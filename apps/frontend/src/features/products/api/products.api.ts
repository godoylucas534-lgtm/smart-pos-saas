import { apiGet, apiPost, apiPut } from '@/shared/api/client';

export const fetchProducts = (search: string) =>
  apiGet<{ items: any[] }>('/products', { search: search || undefined, limit: 50 });

export const fetchProductCategories = () => apiGet<any[]>('/products/categories/all');

export const createProduct = (payload: object) => apiPost('/products', payload);

export const updateProduct = (id: string, payload: object) => apiPut(`/products/${id}`, payload);

export const fetchProductMovements = (id: string) => apiGet<any[]>(`/products/${id}/movements`);

export const createProductCategory = (payload: { name: string; color: string }) =>
  apiPost('/products/categories', payload);

