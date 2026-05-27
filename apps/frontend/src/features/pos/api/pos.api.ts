import { apiGet } from '@/shared/api/client';

export interface POSProduct {
  id: string;
  name: string;
  sku: string;
  salePrice: number;
  taxRate: number;
  stock: number;
  unit: string;
}

export interface POSCategory {
  id: string;
  name: string;
  color: string;
}

export interface POSCustomer {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  document?: string;
  email?: string;
}

export const fetchPOSProducts = (filters: { search?: string; categoryId?: string }) =>
  apiGet<{ items: POSProduct[] }>('/products', { ...filters, limit: 50 });

export const fetchPOSCategories = () => apiGet<POSCategory[]>('/products/categories/all');

export const fetchLowStockProducts = () =>
  apiGet<{ items: POSProduct[] }>('/products', { lowStock: true, limit: 50 });

export const fetchActiveCashRegister = () => apiGet<{ id?: string | null }>('/cash-register/active');

export const searchPOSCustomers = (query: string) =>
  apiGet<POSCustomer[]>('/customers/search', { q: query });

