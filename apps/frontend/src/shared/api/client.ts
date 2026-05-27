import axios from 'axios';
import { API_URL } from '@/config/env';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const stored = localStorage.getItem('pos-auth');
  if (stored) {
    const parsed = JSON.parse(stored);
    const token = parsed?.state?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pos-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const apiGet = <T>(url: string, params?: object) =>
  apiClient.get<T>(url, { params }).then((r) => r.data);

export const apiPost = <T>(url: string, data?: object) =>
  apiClient.post<T>(url, data).then((r) => r.data);

export const apiPut = <T>(url: string, data?: object) =>
  apiClient.put<T>(url, data).then((r) => r.data);

