import { Link } from 'react-router-dom';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageError, PageLoading } from '@/components/ui/PageState';
import { useDashboardQuery } from '@/features/dashboard/hooks/useDashboardQuery';
import InsightFeed from '@/components/insights/InsightFeed';
import { useOperationalInsights } from '@/features/insights/hooks/useOperationalInsights';

function currency(value: number) {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 }).format(value);
}

export default function DashboardPage() {
  const date = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const todayQuery = useDashboardQuery(date);
  const yesterdayQuery = useDashboardQuery(yesterday);
  const operationalInsights = useOperationalInsights();

  if (todayQuery.isLoading || yesterdayQuery.isLoading) {
    return <div className="p-6"><PageLoading message="Cargando resumen inteligente..." /></div>;
  }
  if (todayQuery.isError || yesterdayQuery.isError) {
    const message = (todayQuery.error as Error)?.message || (yesterdayQuery.error as Error)?.message || 'Error en dashboard';
    return <div className="p-6"><PageError message={message} /></div>;
  }

  const summary = todayQuery.data?.summary ?? {};
  const yesterdaySummary = yesterdayQuery.data?.summary ?? {};
  const hourly = (todayQuery.data?.hourly || []).map((x: any) => ({ hour: `${String(Number(x.hour)).padStart(2, '0')}:00`, total: Number(x.total) }));
  const top = (todayQuery.data?.top || []).map((x: any) => ({ name: x.productName, qty: Number(x.quantity) }));
  const expenses = todayQuery.data?.expenses ?? [];
  const expenseTotal = expenses.reduce((acc: number, item: any) => acc + Number(item.amount || 0), 0);
  const revenue = Number(summary?.totalRevenue || 0);
  const revenueYesterday = Number(yesterdaySummary?.totalRevenue || 0);
  const salesToday = Number(summary?.totalSales || 0);
  const salesYesterday = Number(yesterdaySummary?.totalSales || 0);
  const ticketAverage = salesToday > 0 ? revenue / salesToday : 0;

  const revenueDelta = revenueYesterday > 0 ? ((revenue - revenueYesterday) / revenueYesterday) * 100 : 0;
  const salesDelta = salesYesterday > 0 ? ((salesToday - salesYesterday) / salesYesterday) * 100 : 0;

  const alerts = [
    {
      level: top.length === 0 ? 'warning' : 'info',
      text: top.length === 0 ? 'Sin ventas registradas hoy en el tablero.' : 'Ventas activas hoy detectadas.',
      action: '/reports',
      actionLabel: 'Ver reportes',
    },
    {
      level: expenseTotal > revenue ? 'danger' : 'info',
      text: expenseTotal > revenue ? 'Tus gastos del dia superan tus ingresos.' : 'Gastos del dia controlados.',
      action: '/expenses',
      actionLabel: 'Ir a gastos',
    },
  ];

  const cards = [
    { title: 'Ventas hoy', value: `${salesToday}`, meta: `${salesDelta >= 0 ? '+' : ''}${salesDelta.toFixed(1)}% vs ayer` },
    { title: 'Ingresos', value: currency(revenue), meta: `${revenueDelta >= 0 ? '+' : ''}${revenueDelta.toFixed(1)}% vs ayer` },
    { title: 'Ticket promedio', value: currency(ticketAverage), meta: 'Promedio por venta' },
    { title: 'Utilidad neta', value: currency(revenue - expenseTotal), meta: `Gastos: ${currency(expenseTotal)}` },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5">
      <section className="ui-surface p-5">
        <p className="text-xs tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>Resumen del negocio</p>
        <h1 className="text-2xl md:text-3xl font-semibold mt-1">Dashboard Inteligente</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
          Informacion de hoy con recomendaciones operativas simples.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <article key={card.title} className="ui-card">
            <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{card.title}</p>
            <p className="text-xl font-semibold mt-2">{card.value}</p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{card.meta}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <article className="ui-card xl:col-span-2">
          {operationalInsights.isLoading ? (
            <PageLoading message="Calculando insights..." />
          ) : (
            <InsightFeed insights={operationalInsights.insights.slice(0, 6)} title="Insights automaticos" />
          )}
        </article>
        <article className="ui-card">
          <h2 className="font-semibold mb-3">Alertas accionables</h2>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.text} className="p-3 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-muted)' }}>
                <p className="text-sm">{alert.text}</p>
                <Link to={alert.action} className="inline-block text-xs mt-2 font-semibold" style={{ color: 'var(--primary)' }}>
                  {alert.actionLabel}
                </Link>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <article className="ui-card h-80">
          <h2 className="font-semibold mb-3">Ventas por hora</h2>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={hourly}>
              <XAxis dataKey="hour" stroke="#95a3be" />
              <YAxis stroke="#95a3be" />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </article>
        <article className="ui-card h-80">
          <h2 className="font-semibold mb-3">Top productos</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={top}>
              <XAxis dataKey="name" stroke="#95a3be" />
              <YAxis stroke="#95a3be" />
              <Tooltip />
              <Bar dataKey="qty" fill="var(--success)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>
    </div>
  );
}
