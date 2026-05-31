import axios from 'axios';
import { API_URL } from '@/config/env';
import { useAuthStore } from '@/stores/auth.store';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<void> | null = null;

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

apiClient.interceptors.request.use((config) => {
  const method = String(config.method || 'get').toUpperCase();
  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  if (isMutating) {
    const csrfToken = getCookie('pos_csrf');
    if (csrfToken) {
      config.headers = config.headers || {};
      (config.headers as any)['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const requestUrl = String(error.config?.url || '');
    const skipAuthRedirect = Boolean((error.config as any)?.skipAuthRedirect);
    const isAuthLoginRequest = requestUrl.includes('/auth/login');
    const isAuthMeRequest = requestUrl.includes('/auth/me');
    const isAuthRefreshRequest = requestUrl.includes('/auth/refresh');
    const isAuthLogoutRequest = requestUrl.includes('/auth/logout');
    const originalRequest: any = error.config || {};
    const alreadyOnLogin = typeof window !== 'undefined' && window.location.pathname === '/login';

    if (
      status === 401 &&
      !skipAuthRedirect &&
      !isAuthLoginRequest &&
      !isAuthMeRequest &&
      !isAuthRefreshRequest &&
      !isAuthLogoutRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = apiClient.post('/auth/refresh', {}, { skipAuthRedirect: true } as any)
            .then(() => undefined)
            .finally(() => { refreshPromise = null; });
        }
        await refreshPromise;
        return apiClient.request(originalRequest);
      } catch {
        useAuthStore.getState().clearAuth();
        localStorage.removeItem('pos-auth');
        return Promise.reject(error);
      }
    }

    if (
      status === 401 &&
      !skipAuthRedirect &&
      !isAuthLoginRequest &&
      !isAuthMeRequest &&
      !isAuthRefreshRequest &&
      !alreadyOnLogin
    ) {
      useAuthStore.getState().clearAuth();
      localStorage.removeItem('pos-auth');
    }

    if (status === 403 && error.response?.data?.code === 'SAAS_SUSPENDED') {
      const state = useAuthStore.getState();
      if (state.user) {
        state.setAuth(state.user, undefined, {
          ...(state.subscription || {}),
          status: 'suspended',
        });
      }
    }
    return Promise.reject(error);
  },
);

export const apiGet = <T>(
  url: string,
  params?: object,
  options?: { headers?: Record<string, string>; skipAuthRedirect?: boolean },
) =>
  apiClient
    .get<T>(url, { params, headers: options?.headers, skipAuthRedirect: options?.skipAuthRedirect } as any)
    .then((r) => r.data);

export const apiPost = <T>(url: string, data?: object) =>
  apiClient.post<T>(url, data).then((r) => r.data);

export const apiPut = <T>(url: string, data?: object) =>
  apiClient.put<T>(url, data).then((r) => r.data);

export const apiDelete = <T>(url: string) =>
  apiClient.delete<T>(url).then((r) => r.data);
