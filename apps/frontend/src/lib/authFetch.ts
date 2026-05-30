import { apiUrl } from '../config/env';

export async function authFetch(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(apiUrl(input), { ...init, headers, credentials: 'include' });

  if (res.status === 401) {
    localStorage.removeItem('pos-auth');
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
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
