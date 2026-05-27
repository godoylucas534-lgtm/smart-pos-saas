import { apiGet, apiPost, apiPut } from '@/shared/api/client';

export interface CustomerPayload {
  firstName: string;
  lastName?: string;
  documentType?: string;
  document?: string;
  birthDate?: string;
  phone?: string;
  alternativePhone?: string;
  email?: string;
  address?: string;
  city?: string;
  businessName?: string;
  taxDocument?: string;
  notes?: string;
  creditLimit: number;
}

export const fetchCustomers = (search: string) => {
  if (search) {
    return apiGet<any[]>('/customers/search', { q: search });
  }
  return apiGet<{ items: any[] }>('/customers', { limit: 50 });
};

export const createCustomer = (payload: CustomerPayload) => apiPost('/customers', payload);

export const updateCustomer = (customerId: string, payload: CustomerPayload) =>
  apiPut(`/customers/${customerId}`, payload);

