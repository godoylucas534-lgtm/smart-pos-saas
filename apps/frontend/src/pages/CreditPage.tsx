import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdaptiveDataTable, { type DataColumn } from '@/components/ui/AdaptiveDataTable';
import { PageLoading } from '@/components/ui/PageState';
import { authFetch } from '../lib/authFetch';

type CreditAccount = {
  id: string;
  customerId: string;
  balance: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  document?: string;
  lastPaymentAt?: string;
};

export default function CreditPage() {
  const [accounts, setAccounts] = useState<CreditAccount[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/credit-accounts/pending');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.items || [];
      setAccounts(Array.isArray(list) ? list : []);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar creditos');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const pay = async (customerId: string) => {
    const amount = Number(amounts[customerId] || 0);
    if (amount <= 0) {
      toast.error('Ingresa un monto valido');
      return;
    }

    try {
      const res = await authFetch('/credit-accounts/pay', {
        method: 'POST',
        body: JSON.stringify({ customerId, amount }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(Array.isArray(err.message) ? err.message.join(', ') : err.message || 'No se pudo registrar pago');
      }

      toast.success('Pago registrado');
      setAmounts((current) => ({ ...current, [customerId]: '' }));
      await load();
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar pago');
    }
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(Number(value) || 0);

  const columns: DataColumn<CreditAccount>[] = [
    { key: 'cliente', title: 'Cliente', render: (a) => `${a.firstName || ''} ${a.lastName || ''}`.trim() },
    { key: 'contacto', title: 'Contacto', render: (a) => a.phone || a.document || '-' },
    { key: 'saldo', title: 'Saldo', align: 'right', render: (a) => <span style={{ color: 'var(--warning)' }}>{formatPrice(a.balance)}</span> },
    {
      key: 'pago',
      title: 'Pago',
      render: (a) => (
        <div className="flex gap-2 max-w-xs">
          <input
            type="number"
            className="ui-input w-full"
            value={amounts[a.customerId] || ''}
            onChange={(event) => setAmounts((current) => ({ ...current, [a.customerId]: event.target.value }))}
            placeholder="Monto"
          />
          <button type="button" className="ui-button ui-button-primary" onClick={() => pay(a.customerId)}>
            Cobrar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Creditos Pendientes</h1>

      <div className="ui-card overflow-hidden">
        {loading ? <PageLoading message="Cargando creditos..." /> : (
          <AdaptiveDataTable
            columns={columns}
            rows={accounts}
            rowKey={(a) => a.id}
            emptyMessage="No hay saldos pendientes."
            density="compact"
          />
        )}
      </div>
    </div>
  );
}
