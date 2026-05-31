import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdaptiveDataTable, { type DataColumn } from '@/components/ui/AdaptiveDataTable';
import { PageError, PageLoading } from '@/components/ui/PageState';
import { authFetch, parseJsonSafe } from '../lib/authFetch';
import { formatCurrencyPYG } from '@/lib/utils';

type CreditAccount = {
  id: string;
  storeId?: string;
  customerId: string;
  balance: number;
  customer?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    phone?: string;
    document?: string;
  } | null;
  lastPaymentAt?: string;
  createdAt?: string;
};

export default function CreditPage() {
  const [accounts, setAccounts] = useState<CreditAccount[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mapAccount = (item: any): CreditAccount => ({
    id: String(item?.id ?? item?.customerId ?? ''),
    storeId: item?.storeId ? String(item.storeId) : undefined,
    customerId: String(item?.customerId ?? item?.customer?.id ?? ''),
    balance: Number(item?.balance ?? 0),
    customer: item?.customer
      ? item.customer
      : {
          id: item?.customerId ? String(item.customerId) : undefined,
          firstName: item?.firstName,
          lastName: item?.lastName,
          phone: item?.phone,
          document: item?.document,
        },
    lastPaymentAt: item?.lastPaymentAt ?? undefined,
    createdAt: item?.createdAt ?? undefined,
  });

  const getCustomerLabel = (account: CreditAccount) => {
    const customer = account.customer;
    const fullName = `${customer?.firstName ?? ''} ${customer?.lastName ?? ''}`.trim();
    return customer?.name || fullName || account.customerId || '-';
  };

  const getCustomerContact = (account: CreditAccount) => {
    const customer = account.customer;
    return customer?.phone || customer?.document || '-';
  };

  const load = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authFetch('/credit-accounts/pending');
      const data = await parseJsonSafe<any>(res);

      if (!res.ok) {
        if (res.status === 403 && (data as any)?.code === 'SAAS_FEATURE_NOT_AVAILABLE') {
          throw new Error('Funcionalidad no disponible en tu plan actual. Por favor actualiza a un plan superior para habilitar el control de fiados.');
        }
        const message = Array.isArray((data as any)?.message)
          ? (data as any).message.join(', ')
          : (data as any)?.message || 'No se pudieron cargar los creditos pendientes';
        throw new Error(message);
      }

      const list = Array.isArray(data) ? data : data?.items || [];
      const mapped = Array.isArray(list) ? list.map(mapAccount).filter((entry) => entry.customerId) : [];
      setAccounts(mapped);
    } catch (error: any) {
      const message = error?.message || 'Error al cargar creditos';
      setErrorMessage(message);
      toast.error(message);
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

  const columns: DataColumn<CreditAccount>[] = [
    { key: 'cliente', title: 'Cliente', render: (a) => getCustomerLabel(a) },
    { key: 'contacto', title: 'Contacto', render: (a) => getCustomerContact(a) },
    { key: 'saldo', title: 'Saldo', align: 'right', render: (a) => <span style={{ color: 'var(--warning)' }}>{formatCurrencyPYG(a.balance)}</span> },
    {
      key: 'pago',
      title: 'Accion',
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
        {loading ? <PageLoading message="Cargando creditos..." /> : errorMessage ? <PageError message={errorMessage} /> : (
          <AdaptiveDataTable
            columns={columns}
            rows={accounts}
            rowKey={(a) => `${a.id}-${a.customerId}`}
            emptyMessage="No hay saldos pendientes."
            density="compact"
          />
        )}
      </div>
    </div>
  );
}
