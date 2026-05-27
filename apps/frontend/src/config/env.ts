const rawApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
const rawApiPrefix = import.meta.env.VITE_API_PREFIX || '/api/v1';
const appOrigin = typeof window !== 'undefined' ? window.location.origin : '';

const normalizedApiPrefix = rawApiPrefix.startsWith('/') ? rawApiPrefix : `/${rawApiPrefix}`;

function normalizeApiUrl(value?: string): string {
  if (!value) {
    return `${appOrigin}${normalizedApiPrefix}`;
  }

  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed) {
    return `${appOrigin}${normalizedApiPrefix}`;
  }

  return trimmed;
}

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'POS Paraguay';
export const BRAND_LEGAL_NAME = import.meta.env.VITE_BRAND_LEGAL_NAME || APP_NAME;
export const BRAND_SUPPORT_EMAIL = import.meta.env.VITE_BRAND_SUPPORT_EMAIL || 'soporte@posparaguay.com';
export const BRAND_PRIMARY_COLOR = import.meta.env.VITE_BRAND_PRIMARY_COLOR || '#111827';
export const API_URL = normalizeApiUrl(rawApiUrl);

export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (!path) return API_URL;
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
