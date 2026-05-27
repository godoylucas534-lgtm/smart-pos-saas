import { useQuery } from '@tanstack/react-query';
import {
  fetchDailyExpenses,
  fetchDailySummary,
  fetchHourlyStats,
  fetchTopProductsStats,
} from '../api/dashboard.api';

export const dashboardQueryKeys = {
  daily: (date: string) => ['dashboard', 'daily', date] as const,
};

export const useDashboardQuery = (date: string) =>
  useQuery({
    queryKey: dashboardQueryKeys.daily(date),
    queryFn: async () => {
      const [summary, hourly, top, expenses] = await Promise.all([
        fetchDailySummary() as Promise<any>,
        fetchHourlyStats(date) as Promise<any[]>,
        fetchTopProductsStats(date) as Promise<any[]>,
        fetchDailyExpenses(date) as Promise<any[]>,
      ]);

      return { summary, hourly, top, expenses };
    },
  });
