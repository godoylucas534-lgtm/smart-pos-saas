import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { apiGet } from '@/shared/api/client';
import { dashboardRetryPolicy, useDashboardQueries } from '@/features/dashboard/hooks/useDashboardQuery';
import type { OperationalInsight } from '../types';

export function useOperationalInsights() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const todayDashboard = useDashboardQueries(today);
  const yesterdayDashboard = useDashboardQueries(yesterday);
  const [stockQuery, creditQuery, cashQuery] = useQueries({
    queries: [
      {
        queryKey: ['alerts', 'stock-low'],
        queryFn: () => apiGet<{ items: any[] }>('/products', { lowStock: true, limit: 10 }),
        retry: dashboardRetryPolicy,
      },
      {
        queryKey: ['alerts', 'credits-pending'],
        queryFn: () => apiGet<any[]>('/credit-accounts/pending'),
        retry: dashboardRetryPolicy,
      },
      {
        queryKey: ['alerts', 'cash-active'],
        queryFn: () => apiGet<{ id?: string; createdAt?: string }>('/cash-register/active'),
        retry: dashboardRetryPolicy,
      },
    ],
  });

  const insights = useMemo<OperationalInsight[]>(() => {
    const list: OperationalInsight[] = [];

    const todaySummary = todayDashboard.summaryQuery.data ?? {};
    const yesterdaySummary = yesterdayDashboard.summaryQuery.data ?? {};
    const todayRevenue = Number(todaySummary?.totalRevenue || 0);
    const yesterdayRevenue = Number(yesterdaySummary?.totalRevenue || 0);
    const todaySales = Number(todaySummary?.totalSales || 0);
    const yesterdaySales = Number(yesterdaySummary?.totalSales || 0);
    const revenueDelta = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
    const salesDelta = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0;

    if (yesterdayRevenue > 0) {
      list.push({
        id: 'revenue-vs-yesterday',
        level: revenueDelta >= 0 ? 'success' : 'warning',
        title: revenueDelta >= 0 ? 'Subida de ventas' : 'Caida de ventas',
        description: `Ingresos ${revenueDelta >= 0 ? '+' : ''}${revenueDelta.toFixed(1)}% vs ayer.`,
        ctaLabel: 'Ver reportes',
        ctaTo: '/reports',
      });
    }

    if (yesterdaySales > 0) {
      list.push({
        id: 'sales-vs-yesterday',
        level: salesDelta >= 0 ? 'success' : 'info',
        title: 'Cantidad de ventas',
        description: `${salesDelta >= 0 ? '+' : ''}${salesDelta.toFixed(1)}% de tickets vs ayer.`,
      });
    }

    const top = (todayDashboard.topQuery.data || []).map((x: any) => ({
      name: x.productName,
      qty: Number(x.quantity || 0),
    }));
    if (top.length > 0) {
      list.push({
        id: 'top-product',
        level: 'info',
        title: 'Producto mas vendido',
        description: `${top[0].name} lidera con ${top[0].qty} unidades.`,
        ctaLabel: 'Ir a inventario',
        ctaTo: '/products',
      });
    }

    const hourly = (todayDashboard.hourlyQuery.data || []).map((x: any) => Number(x.total || 0));
    if (hourly.length > 3) {
      const firstHalf = hourly.slice(0, Math.floor(hourly.length / 2)).reduce((acc, val) => acc + val, 0);
      const secondHalf = hourly.slice(Math.floor(hourly.length / 2)).reduce((acc, val) => acc + val, 0);
      list.push({
        id: 'hourly-trend',
        level: secondHalf >= firstHalf ? 'success' : 'warning',
        title: 'Tendencia horaria',
        description: secondHalf >= firstHalf ? 'El cierre del dia viene acelerando ventas.' : 'Ventas mas fuertes en primera mitad del dia.',
      });
    }

    const lowStock = stockQuery.data?.items ?? [];
    if (lowStock.length > 0) {
      list.push({
        id: 'critical-stock',
        level: 'danger',
        title: 'Stock critico',
        description: `${lowStock.length} productos con stock bajo requieren reposicion.`,
        ctaLabel: 'Reponer productos',
        ctaTo: '/products',
      });
    }

    const creditsRaw = creditQuery.data;
    const credits = Array.isArray(creditsRaw) ? creditsRaw : [];
    if (credits.length > 0) {
      list.push({
        id: 'credit-pending',
        level: 'warning',
        title: 'Cobros pendientes',
        description: `${credits.length} clientes con deuda pendiente.`,
        ctaLabel: 'Revisar creditos',
        ctaTo: '/credits',
      });
    }

    const cashCreatedAt = cashQuery.data?.createdAt;
    if (cashCreatedAt) {
      const openHours = (Date.now() - new Date(cashCreatedAt).getTime()) / (1000 * 60 * 60);
      if (openHours >= 10) {
        list.push({
          id: 'cash-open-long',
          level: 'warning',
          title: 'Caja abierta por muchas horas',
          description: `La caja lleva ${openHours.toFixed(1)} horas abierta.`,
          ctaLabel: 'Revisar caja',
          ctaTo: '/cash-register',
        });
      }
    } else {
      list.push({
        id: 'cash-closed',
        level: 'info',
        title: 'Caja cerrada',
        description: 'No hay caja activa en este momento.',
        ctaLabel: 'Abrir caja',
        ctaTo: '/cash-register',
      });
    }

    return list;
  }, [
    cashQuery.data?.createdAt,
    creditQuery.data,
    stockQuery.data?.items,
    todayDashboard.hourlyQuery.data,
    todayDashboard.summaryQuery.data,
    todayDashboard.topQuery.data,
    yesterdayDashboard.summaryQuery.data,
  ]);

  const isLoading =
    todayDashboard.summaryQuery.isLoading ||
    yesterdayDashboard.summaryQuery.isLoading ||
    stockQuery.isLoading ||
    creditQuery.isLoading ||
    cashQuery.isLoading;

  return { insights, isLoading };
}
