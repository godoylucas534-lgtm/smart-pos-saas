import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReceiptModal from '../components/ReceiptModal';
import { PageEmpty, PageError, PageLoading } from '@/components/ui/PageState';
import { fetchSalesByRange } from '@/features/sales/api/sales.api';
import { fetchMyStore } from '@/features/store/api/store.api';
import AdaptiveDataTable, { type DataColumn } from '@/components/ui/AdaptiveDataTable';

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [filterDraft, setFilterDraft] = useState({ dateFrom, dateTo });

  const salesQuery = useQuery({
    queryKey: ['sales', 'reports', filterDraft.dateFrom, filterDraft.dateTo],
    queryFn: async () => {
      const data = await fetchSalesByRange(filterDraft.dateFrom, filterDraft.dateTo);
      return Array.isArray(data?.items) ? data.items : [];
    },
  });

  const storeQuery = useQuery({
    queryKey: ['stores', 'mine'],
    queryFn: fetchMyStore,
    staleTime: 5 * 60_000,
  });

  const sales = salesQuery.data ?? [];
  const storeInfo = storeQuery.data ?? JSON.parse(localStorage.getItem('pos-store') || '{}');

  const ranking = useMemo(() => {
    const rankingMap = new Map<string, { name: string; qty: number }>();
    for (const sale of sales) {
      if (sale.status !== 'completed') continue;
      for (const item of sale.items || []) {
        const key = item.productId;
        const current = rankingMap.get(key) || { name: item.productName, qty: 0 };
        current.qty += Number(item.quantity || 0);
        rankingMap.set(key, current);
      }
    }
    return [...rankingMap.values()].sort((a, b) => b.qty - a.qty).slice(0, 10);
  }, [sales]);

  const columns: DataColumn<any>[] = [
    { key: 'receipt', title: 'Recibo', render: (sale) => sale.receiptNumber },
    { key: 'date', title: 'Fecha', render: (sale) => new Date(sale.createdAt).toLocaleString('es-PY') },
    { key: 'status', title: 'Estado', render: (sale) => sale.status },
    { key: 'total', title: 'Total', align: 'right', render: (sale) => Number(sale.total || 0).toLocaleString('es-PY') },
    {
      key: 'ticket',
      title: 'Ticket',
      align: 'center',
      render: (sale) => (
        <button
          type="button"
          onClick={() => setSelectedSale(sale)}
          className="ui-button ui-button-primary text-xs px-3 py-1"
        >
          Ver ticket
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Reportes</h1>

      <div className="ui-surface p-3 md:p-4 flex flex-wrap gap-2 mb-4">
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="ui-input" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="ui-input" />
        <button className="ui-button ui-button-primary" onClick={() => setFilterDraft({ dateFrom, dateTo })}>Generar</button>
      </div>

      {salesQuery.isLoading ? (
        <PageLoading message="Cargando ventas..." />
      ) : salesQuery.isError ? (
        <PageError message={(salesQuery.error as Error).message} />
      ) : (
        <>
          <div className="ui-card mb-4">
            <h2 className="font-bold mb-2">Productos mas vendidos</h2>
            {ranking.length === 0 ? (
              <PageEmpty message="Sin datos" />
            ) : (
              <ol className="list-decimal pl-5 space-y-1">
                {ranking.map((r, i) => (
                  <li key={`${r.name}-${i}`}>{r.name} - {r.qty}</li>
                ))}
              </ol>
            )}
          </div>

          <div className="ui-card">
            <h2 className="font-bold mb-2">Registros de ventas</h2>
            <AdaptiveDataTable
              columns={columns}
              rows={sales}
              rowKey={(sale) => sale.id}
              emptyMessage="Sin ventas en el periodo."
              density="compact"
            />
          </div>
        </>
      )}

      {selectedSale && (
        <ReceiptModal
          sale={selectedSale}
          store={storeInfo || {}}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  );
}
