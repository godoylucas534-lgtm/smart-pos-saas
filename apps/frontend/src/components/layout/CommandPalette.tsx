import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { apiGet } from '@/shared/api/client';

type SearchItem = {
  id: string;
  label: string;
  type: 'producto' | 'cliente' | 'venta' | 'accion';
  path?: string;
  action?: () => void;
};

export default function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const [productsQuery, customersQuery, salesQuery] = useQueries({
    queries: [
      {
        queryKey: ['cmdk', 'products'],
        queryFn: () => apiGet<{ items: Array<{ id: string; name: string }> }>('/products', { limit: 25 }),
        enabled: open,
      },
      {
        queryKey: ['cmdk', 'customers'],
        queryFn: () => apiGet<{ items: Array<{ id: string; firstName: string; lastName?: string }> }>('/customers', { limit: 25 }),
        enabled: open,
      },
      {
        queryKey: ['cmdk', 'sales'],
        queryFn: () => apiGet<{ items: Array<{ id: string; receiptNumber: string }> }>('/sales', { limit: 25 }),
        enabled: open,
      },
    ],
  });

  const items = useMemo<SearchItem[]>(() => {
    const actions: SearchItem[] = [
      { id: 'a-pos', label: 'Ir a POS', type: 'accion', path: '/pos' },
      { id: 'a-dashboard', label: 'Abrir Dashboard', type: 'accion', path: '/dashboard' },
      { id: 'a-product', label: 'Nuevo producto', type: 'accion', path: '/products' },
      { id: 'a-customer', label: 'Nuevo cliente', type: 'accion', path: '/customers' },
      { id: 'a-reports', label: 'Ver reportes', type: 'accion', path: '/reports' },
    ];

    const products = (productsQuery.data?.items ?? []).map<SearchItem>((p) => ({
      id: `p-${p.id}`,
      label: p.name,
      type: 'producto',
      path: '/products',
    }));
    const customers = (customersQuery.data?.items ?? []).map<SearchItem>((c) => ({
      id: `c-${c.id}`,
      label: `${c.firstName} ${c.lastName || ''}`.trim(),
      type: 'cliente',
      path: '/customers',
    }));
    const sales = (salesQuery.data?.items ?? []).map<SearchItem>((s) => ({
      id: `s-${s.id}`,
      label: `Venta ${s.receiptNumber}`,
      type: 'venta',
      path: '/reports',
    }));

    return [...actions, ...products, ...customers, ...sales];
  }, [customersQuery.data?.items, productsQuery.data?.items, salesQuery.data?.items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 12);
    return items.filter((item) => item.label.toLowerCase().includes(q) || item.type.includes(q)).slice(0, 12);
  }, [items, query]);

  const handleSelect = (item: SearchItem) => {
    if (item.action) item.action();
    if (item.path) navigate(item.path);
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <button className="ui-button ui-button-ghost text-xs px-3 py-2" onClick={() => setOpen(true)}>
        Buscar Ctrl+K
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] bg-black/60 p-4 md:p-12">
          <div className="max-w-2xl mx-auto ui-surface overflow-hidden">
            <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos, clientes, ventas o acciones..."
                className="ui-input w-full"
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 flex items-center justify-between"
                  onClick={() => handleSelect(item)}
                >
                  <span>{item.label}</span>
                  <span className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{item.type}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-5 text-sm" style={{ color: 'var(--text-muted)' }}>Sin resultados.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

