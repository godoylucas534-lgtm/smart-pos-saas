import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiGet } from '@/shared/api/client';
import { useOperationalInsights } from '@/features/insights/hooks/useOperationalInsights';

export default function AlertCenter() {
  const [open, setOpen] = useState(false);
  const operationalInsights = useOperationalInsights();

  const [stockQuery, creditQuery, cashQuery] = useQueries({
    queries: [
      {
        queryKey: ['alerts', 'stock-low'],
        queryFn: () => apiGet<{ items: any[] }>('/products', { lowStock: true, limit: 10 }),
        refetchInterval: 60_000,
      },
      {
        queryKey: ['alerts', 'credits-pending'],
        queryFn: () => apiGet<any[]>('/credit-accounts/pending'),
        refetchInterval: 60_000,
      },
      {
        queryKey: ['alerts', 'cash-active'],
        queryFn: () => apiGet<{ id?: string }>('/cash-register/active'),
        refetchInterval: 60_000,
      },
    ],
  });

  const alerts = useMemo(() => {
    const list: Array<{ id: string; text: string; to: string; source: 'alert' | 'insight' }> = [];
    const lowStock = stockQuery.data?.items ?? [];
    const creditPendingRaw = creditQuery.data;
    const credits = Array.isArray(creditPendingRaw) ? creditPendingRaw : [];
    const cashOpen = Boolean(cashQuery.data?.id);

    if (lowStock.length > 0) list.push({ id: 'stock', text: `${lowStock.length} productos con stock bajo`, to: '/products', source: 'alert' });
    if (credits.length > 0) list.push({ id: 'credits', text: `${credits.length} cuentas con credito pendiente`, to: '/credits', source: 'alert' });
    list.push({ id: 'cash', text: cashOpen ? 'Caja actualmente abierta' : 'Caja cerrada, revisar apertura', to: '/cash-register', source: 'alert' });

    operationalInsights.insights
      .filter((insight) => insight.level === 'warning' || insight.level === 'danger')
      .slice(0, 3)
      .forEach((insight) => {
        list.push({
          id: `insight-${insight.id}`,
          text: insight.description,
          to: insight.ctaTo || '/dashboard',
          source: 'insight',
        });
      });

    return list.filter((item, index, array) => array.findIndex((entry) => entry.text === item.text) === index);
  }, [cashQuery.data?.id, creditQuery.data, operationalInsights.insights, stockQuery.data?.items]);

  return (
    <div className="relative">
      <button className="ui-button ui-button-ghost text-xs px-3 py-2" onClick={() => setOpen((v) => !v)}>
        Alertas {alerts.length > 0 ? `(${alerts.length})` : ''}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 ui-surface p-2 z-50">
          <div className="px-2 py-1 text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Centro de alertas</div>
          {alerts.map((alert) => (
            <Link
              key={alert.id}
              to={alert.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5"
            >
              <span className="text-[10px] uppercase mr-2" style={{ color: 'var(--text-muted)' }}>
                {alert.source}
              </span>
              {alert.text}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
