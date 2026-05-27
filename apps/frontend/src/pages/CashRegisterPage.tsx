import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AdaptiveDataTable, { type DataColumn } from '@/components/ui/AdaptiveDataTable';
import { PageEmpty, PageLoading } from '@/components/ui/PageState';
import { authFetch, parseJsonSafe } from '../lib/authFetch';

type CashRegister = {
  id: string;
  openingAmount: number;
  closingAmount?: number;
  difference?: number;
  status: 'open' | 'closed';
  createdAt: string;
  closedAt?: string;
  cashier?: { firstName?: string; lastName?: string };
};

export default function CashRegisterPage() {
  const [activeCash, setActiveCash] = useState<CashRegister | null>(null);
  const [history, setHistory] = useState<CashRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [openingAmount, setOpeningAmount] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const expectedClose = useMemo(() => {
    if (!activeCash) return 0;
    return Number(activeCash.openingAmount || 0);
  }, [activeCash]);

  const historyColumns: DataColumn<CashRegister>[] = [
    { key: 'cashier', title: 'Cajero', render: (entry) => `${entry.cashier?.firstName || ''} ${entry.cashier?.lastName || ''}`.trim() || '-' },
    { key: 'open', title: 'Apertura', render: (entry) => new Date(entry.createdAt).toLocaleString('es-PY') },
    { key: 'close', title: 'Cierre', render: (entry) => (entry.closedAt ? new Date(entry.closedAt).toLocaleString('es-PY') : '-') },
    { key: 'openAmount', title: 'Monto inicial', align: 'right', render: (entry) => formatPrice(entry.openingAmount) },
    { key: 'closeAmount', title: 'Monto cierre', align: 'right', render: (entry) => (entry.closingAmount != null ? formatPrice(entry.closingAmount) : '-') },
    {
      key: 'difference',
      title: 'Diferencia',
      align: 'right',
      render: (entry) =>
        entry.difference != null ? (
          <span style={{ color: Number(entry.difference) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {Number(entry.difference) >= 0 ? '+' : ''}{formatPrice(entry.difference)}
          </span>
        ) : '-',
    },
    { key: 'status', title: 'Estado', align: 'center', render: (entry) => (entry.status === 'open' ? 'Abierta' : 'Cerrada') },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [activeRes, historyRes] = await Promise.all([
        authFetch('/cash-register/active'),
        authFetch('/cash-register/history'),
      ]);

      const activeData = await parseJsonSafe<any>(activeRes);
      const historyData = await parseJsonSafe<any>(historyRes);

      setActiveCash(activeData?.id ? activeData : null);
      setHistory(Array.isArray(historyData?.items) ? historyData.items : Array.isArray(historyData) ? historyData : []);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo cargar la informacion de caja');
      setActiveCash(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = async () => {
    if (!openingAmount || Number(openingAmount) <= 0) {
      toast.error('Ingresa un monto inicial valido');
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch('/cash-register/open', {
        method: 'POST',
        body: JSON.stringify({ openingAmount: Number(openingAmount), notes }),
      });

      if (!res.ok) {
        const err = await parseJsonSafe<any>(res);
        const message = Array.isArray(err?.message) ? err.message.join(', ') : err?.message;
        throw new Error(message || 'No se pudo abrir la caja');
      }

      toast.success('Caja abierta exitosamente');
      setShowOpenModal(false);
      setOpeningAmount('');
      setNotes('');
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error al abrir caja');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    if (!closingAmount || Number(closingAmount) < 0) {
      toast.error('Ingresa un monto de cierre valido');
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch('/cash-register/close', {
        method: 'POST',
        body: JSON.stringify({ closingAmount: Number(closingAmount), notes }),
      });

      if (!res.ok) {
        const err = await parseJsonSafe<any>(res);
        const message = Array.isArray(err?.message) ? err.message.join(', ') : err?.message;
        throw new Error(message || 'No se pudo cerrar la caja');
      }

      toast.success('Caja cerrada exitosamente');
      setShowCloseModal(false);
      setClosingAmount('');
      setNotes('');
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error al cerrar caja');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Control de Caja</h1>

      <div className="ui-surface p-6 mb-6">
        {activeCash ? (
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="font-bold text-xl mb-1" style={{ color: 'var(--success)' }}>Caja abierta</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Cajero: {activeCash.cashier?.firstName} {activeCash.cashier?.lastName}</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Apertura: {new Date(activeCash.createdAt).toLocaleString('es-PY')}</div>
              <div className="text-sm mt-2">Monto inicial: <span className="font-bold">{formatPrice(activeCash.openingAmount)}</span></div>
              <div className="text-sm">Esperado base: <span className="font-bold">{formatPrice(expectedClose)}</span></div>
            </div>
            <button type="button" onClick={() => setShowCloseModal(true)} className="ui-button ui-button-danger px-6 py-3">
              Cerrar Caja
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="font-bold text-xl mb-1">Caja cerrada</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>No hay caja abierta en este momento</div>
            </div>
            <button type="button" onClick={() => setShowOpenModal(true)} className="ui-button ui-button-primary px-6 py-3">
              Abrir Caja
            </button>
          </div>
        )}
      </div>

      <div className="ui-card overflow-hidden">
        <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-bold text-lg">Historial de Cajas</h2>
        </div>

        {loading ? <PageLoading /> : history.length === 0 ? (
          <PageEmpty message="No hay registros de caja" />
        ) : (
          <AdaptiveDataTable columns={historyColumns} rows={history} rowKey={(entry) => entry.id} density="compact" />
        )}
      </div>

      {showOpenModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="ui-surface p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Abrir Caja</h2>
            <div className="space-y-4">
              <input type="number" value={openingAmount} onChange={(event) => setOpeningAmount(event.target.value)} className="ui-input w-full" placeholder="Monto inicial" />
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="ui-input w-full" placeholder="Notas (opcional)" rows={2} />
              <div className="flex gap-3">
                <button type="button" className="flex-1 ui-button ui-button-ghost py-3" onClick={() => setShowOpenModal(false)}>Cancelar</button>
                <button type="button" className="flex-1 ui-button ui-button-primary py-3" onClick={handleOpen} disabled={saving}>{saving ? 'Abriendo...' : 'Abrir'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCloseModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="ui-surface p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Cerrar Caja</h2>
            <div className="space-y-4">
              <input type="number" value={closingAmount} onChange={(event) => setClosingAmount(event.target.value)} className="ui-input w-full" placeholder="Monto contado" />
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="ui-input w-full" placeholder="Notas (opcional)" rows={2} />
              <div className="flex gap-3">
                <button type="button" className="flex-1 ui-button ui-button-ghost py-3" onClick={() => setShowCloseModal(false)}>Cancelar</button>
                <button type="button" className="flex-1 ui-button ui-button-danger py-3" onClick={handleClose} disabled={saving}>{saving ? 'Cerrando...' : 'Cerrar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
