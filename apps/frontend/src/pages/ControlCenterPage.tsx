import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AdaptiveDataTable, { type DataColumn } from '@/components/ui/AdaptiveDataTable';
import { PageError, PageLoading } from '@/components/ui/PageState';
import { fetchTenants, reactivateTenant, suspendTenant, type TenantRow } from '@/features/saas-admin/api/saas-admin.api';

function fmtDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('es-PY');
}

function statusBadge(status: string) {
  const s = String(status || '').toLowerCase();
  if (s === 'active' || s === 'trial') return <span className="ui-badge ui-badge-success">{status}</span>;
  if (s === 'suspended') return <span className="ui-badge ui-badge-danger">{status}</span>;
  if (s === 'grace_period') return <span className="ui-badge ui-badge-warning">{status}</span>;
  return <span className="ui-badge">{status}</span>;
}

export default function ControlCenterPage() {
  const qc = useQueryClient();
  const tenantsQuery = useQuery({
    queryKey: ['saas-admin', 'tenants'],
    queryFn: fetchTenants,
  });

  const suspendMutation = useMutation({
    mutationFn: suspendTenant,
    onSuccess: () => {
      toast.success('Tenant suspendido correctamente');
      qc.invalidateQueries({ queryKey: ['saas-admin', 'tenants'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'No se pudo suspender tenant'),
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateTenant,
    onSuccess: () => {
      toast.success('Tenant reactivado correctamente');
      qc.invalidateQueries({ queryKey: ['saas-admin', 'tenants'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'No se pudo reactivar tenant'),
  });

  const tenants = tenantsQuery.data ?? [];
  const columns: DataColumn<TenantRow>[] = [
    { key: 'store', title: 'Tienda', render: (t) => <div><div className="font-semibold">{t.storeName || '-'}</div><div className="text-xs ui-text-muted">{t.storeSlug || '-'}</div></div> },
    { key: 'plan', title: 'Plan', render: (t) => <span className="ui-badge">{t.plan}</span> },
    { key: 'status', title: 'Estado', render: (t) => statusBadge(t.status) },
    { key: 'period', title: 'Fin periodo', render: (t) => fmtDate(t.currentPeriodEndsAt) },
    { key: 'grace', title: 'Fin grace', render: (t) => fmtDate(t.graceEndsAt) },
    {
      key: 'actions',
      title: 'Acciones',
      align: 'right',
      render: (t) => (
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            className="ui-button ui-button-danger text-xs"
            disabled={t.status === 'suspended' || suspendMutation.isPending}
            onClick={() => suspendMutation.mutate(t.storeId)}
          >
            Suspender
          </button>
          <button
            type="button"
            className="ui-button ui-button-primary text-xs"
            disabled={t.status !== 'suspended' || reactivateMutation.isPending}
            onClick={() => reactivateMutation.mutate(t.storeId)}
          >
            Reactivar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">
      <section className="ui-hero">
        <p className="ui-kicker">Panel Interno</p>
        <h1 className="text-2xl md:text-3xl font-semibold">Control Center</h1>
        <p className="ui-text-muted mt-2">Gestión de suscripciones, suspensión y reactivación de tenants (solo super admin).</p>
      </section>
      <section className="ui-card">
        {tenantsQuery.isLoading ? (
          <PageLoading message="Cargando tenants..." />
        ) : tenantsQuery.isError ? (
          <PageError message={(tenantsQuery.error as any)?.response?.data?.message || 'No se pudieron cargar tenants'} />
        ) : (
          <AdaptiveDataTable columns={columns} rows={tenants} rowKey={(t) => t.storeId} density="compact" emptyMessage="Sin tenants disponibles." />
        )}
      </section>
    </div>
  );
}
