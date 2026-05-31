import { apiGet, apiClient } from '@/shared/api/client';

export type TenantRow = {
  subscriptionId: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  plan: string;
  status: string;
  trialEndsAt?: string | null;
  currentPeriodEndsAt?: string | null;
  graceEndsAt?: string | null;
  suspendedAt?: string | null;
  cancelledAt?: string | null;
};

export const fetchTenants = () => apiGet<TenantRow[]>('/saas/admin/tenants');

export const suspendTenant = (storeId: string) =>
  apiClient.patch(`/saas/admin/tenants/${storeId}/suspend`).then((r) => r.data);

export const reactivateTenant = (storeId: string) =>
  apiClient.patch(`/saas/admin/tenants/${storeId}/reactivate`).then((r) => r.data);
