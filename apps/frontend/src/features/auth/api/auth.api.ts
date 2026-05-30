import { apiGet, apiPost } from '@/shared/api/client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  storeId: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken?: string;
  subscription?: any;
}

export const loginRequest = (payload: LoginPayload) =>
  apiPost<LoginResponse>('/auth/login', payload);

export const fetchStoreById = (storeId: string) =>
  apiGet(`/stores/${storeId}`, undefined, {
    skipAuthRedirect: true,
  });

export const getSessionMe = () =>
  apiGet<{ user: AuthUser; subscription?: any }>('/auth/me', undefined, {
    skipAuthRedirect: true,
  });

export const logoutRequest = () => apiPost<{ ok: boolean }>('/auth/logout');
