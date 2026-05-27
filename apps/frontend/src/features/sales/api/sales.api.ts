import { apiGet } from '@/shared/api/client';

export const fetchSalesByRange = (dateFrom: string, dateTo: string) =>
  apiGet<{ items: any[] }>('/sales', {
    dateFrom: `${dateFrom}T00:00:00`,
    dateTo: `${dateTo}T23:59:59`,
    limit: 500,
  });

