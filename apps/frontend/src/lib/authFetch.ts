import { apiUrl } from '../config/env';

export function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem('pos-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

export async function authFetch(input: string, init: RequestInit = {}) {
  const token = getAccessToken();
  const headers = new Headers(init.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(apiUrl(input), { ...init, headers });

  if (res.status === 401) {
    localStorage.removeItem('pos-auth');
    window.location.href = '/login';
    throw new Error('Sesion expirada. Inicia sesion de nuevo.');
  }

  return res;
}

export async function parseJsonSafe<T = any>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
