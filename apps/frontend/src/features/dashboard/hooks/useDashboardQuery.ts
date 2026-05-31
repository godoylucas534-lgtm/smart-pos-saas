import { useQueries } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  fetchDailyExpenses,
  fetchDailySummary,
  fetchHourlyStats,
  fetchTopProductsStats,
} from '../api/dashboard.api';

export const dashboardQueryKeys = {
  summary: (date: string) => ['dashboard', 'summary', date] as const,
  hourly: (date: string) => ['dashboard', 'hourly', date] as const,
  top: (date: string) => ['dashboard', 'top', date] as const,
  expenses: (date: string) => ['dashboard', 'expenses', date] as const,
};

export function dashboardRetryPolicy(failureCount: number, error: unknown) {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 403) return false;
  }
  return failureCount < 1;
}

export function useDashboardQueries(date: string) {
  const [summaryQuery, hourlyQuery, topQuery, expensesQuery] = useQueries({
    queries: [
      {
        queryKey: dashboardQueryKeys.summary(date),
        queryFn: () => fetchDailySummary() as Promise<any>,
        retry: dashboardRetryPolicy,
      },
      {
        queryKey: dashboardQueryKeys.hourly(date),
        queryFn: () => fetchHourlyStats(date) as Promise<any[]>,
        retry: dashboardRetryPolicy,
      },
      {
        queryKey: dashboardQueryKeys.top(date),
        queryFn: () => fetchTopProductsStats(date) as Promise<any[]>,
        retry: dashboardRetryPolicy,
      },
      {
        queryKey: dashboardQueryKeys.expenses(date),
        queryFn: () => fetchDailyExpenses(date) as Promise<any[]>,
        retry: dashboardRetryPolicy,
      },
    ],
  });

  return { summaryQuery, hourlyQuery, topQuery, expensesQuery };
}

