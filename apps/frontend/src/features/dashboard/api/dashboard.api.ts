import { apiGet } from '@/shared/api/client';

export const fetchDailySummary = () => apiGet('/sales/summary/daily');

export const fetchHourlyStats = (date: string) => apiGet('/sales/stats/hourly', { date });

export const fetchTopProductsStats = (date: string) => apiGet('/sales/stats/top-products', { date });

export const fetchDailyExpenses = (date: string) =>
  apiGet('/expenses', {
    dateFrom: date,
    dateTo: date,
  });

