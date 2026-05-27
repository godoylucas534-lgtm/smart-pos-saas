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
  accessToken: string;
}

export const loginRequest = (payload: LoginPayload) =>
  apiPost<LoginResponse>('/auth/login', payload);

export const fetchStoreById = (storeId: string) => apiGet(`/stores/${storeId}`);

