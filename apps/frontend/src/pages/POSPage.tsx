import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import { useCartStore } from '../stores/cart.store';
import {
  useActiveCashRegister,
  useLowStockProducts,
  usePOSCategories,
  usePOSCustomerSearch,
  usePOSProducts,
} from '@/features/pos/hooks/usePOSQueries';
import toast from 'react-hot-toast';
import { formatCurrencyPYG, formatStockInt } from '@/lib/utils';

export default function POSPage() {
  const navigate = useNavigate();
  const { items, total, subtotal, taxTotal, addItem, removeItem, updateQuantity, clearCart } = useCartStore();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const [customerSearch, setCustomerSearch] = useState('');
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const productSearchRef = useRef<HTMLInputElement>(null);

  const { data: productsResponse, isLoading: loading } = usePOSProducts(debouncedSearch, selectedCat);
  const { data: categories = [] } = usePOSCategories();
  const { data: lowStockResponse } = useLowStockProducts();
  const { data: cashRegister } = useActiveCashRegister();
  const { data: customerResults = [] } = usePOSCustomerSearch(
    debouncedCustomerSearch,
    showCustomerSearch && debouncedCustomerSearch.length >= 2,
  );

  const products = productsResponse?.items ?? [];
  const lowStockItems = lowStockResponse?.items ?? [];
  const cashOpen = typeof cashRegister?.id !== 'undefined' ? Boolean(cashRegister?.id) : null;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCustomerSearch(customerSearch), 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F2') {
        event.preventDefault();
        productSearchRef.current?.focus();
        toast.success('Busqueda de productos activa');
      }
      if (event.key === 'F4') {
        event.preventDefault();
        if (items.length === 0 || cashOpen === false) {
          toast.error('No se puede cobrar en este momento');
          return;
        }
        setShowPayment(true);
        toast.success('Modal de cobro abierto');
      }
      if (event.key === 'F6') {
        event.preventDefault();
        if (items.length === 0) {
          toast('El carrito ya esta vacio');
          return;
        }
        clearCart();
        toast.success('Carrito limpiado');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cashOpen, clearCart, items.length]);

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="px-4 py-2 border-b flex flex-wrap gap-2" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <button className="ui-button ui-button-ghost text-xs" onClick={() => productSearchRef.current?.focus()}>F2 Buscar</button>
        <button className="ui-button ui-button-ghost text-xs" onClick={() => setShowPayment(true)} disabled={items.length === 0 || cashOpen === false}>F4 Cobrar</button>
        <button className="ui-button ui-button-ghost text-xs" onClick={clearCart} disabled={items.length === 0}>F6 Limpiar</button>
        <span className="text-xs self-center ui-text-muted">
          Atajos rapidos para caja moderna
        </span>
      </div>
      {lowStockItems.length > 0 && (
        <div className="px-4 py-2 flex items-center gap-3 border-b" style={{ background: 'color-mix(in srgb, var(--warning) 15%, var(--surface))', borderColor: 'color-mix(in srgb, var(--warning) 40%, var(--border))' }}>
          <span className="text-lg" style={{ color: 'var(--warning)' }}>!</span>
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            Stock bajo: {lowStockItems.map((p) => `${p.name} (${formatStockInt(p.stock)} ${p.unit})`).join(' - ')}
          </span>
        </div>
      )}

      {cashOpen === false && (
        <div className="border-b px-4 py-2 flex items-center justify-between" style={{ background: 'color-mix(in srgb, var(--danger) 15%, var(--surface))', borderColor: 'color-mix(in srgb, var(--danger) 45%, var(--border))' }}>
          <div className="flex items-center gap-3">
            <span className="text-lg" style={{ color: 'var(--danger)' }}>X</span>
            <span className="text-sm font-medium">Caja cerrada. Debes abrir la caja antes de cobrar.</span>
          </div>
          <button onClick={() => navigate('/cash-register')} className="ui-button ui-button-danger text-xs px-3 py-1">
            Abrir Caja
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <input
            ref={productSearchRef}
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ui-input mb-3"
          />

          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCat('')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap font-medium ${selectedCat === '' ? 'ui-button-primary text-white' : ''}`}
              style={selectedCat === '' ? undefined : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(selectedCat === cat.id ? '' : cat.id)}
                style={
                  selectedCat === cat.id
                    ? { backgroundColor: cat.color, color: '#fff' }
                    : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }
                }
                className="px-3 py-1 rounded-full text-sm whitespace-nowrap font-medium"
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="ui-state-card text-center py-20">Cargando productos...</div>
            ) : products.length === 0 ? (
              <div className="ui-state-card text-center py-20">No se encontraron productos</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addItem({ id: p.id, name: p.name, sku: p.sku, salePrice: p.salePrice, taxRate: p.taxRate, stock: p.stock, unit: p.unit })}
                    className="ui-card text-left transition-all hover:translate-y-[-1px]"
                  >
                    <div className="text-sm font-medium leading-tight mb-1">{p.name}</div>
                    <div className="font-bold" style={{ color: 'var(--primary)' }}>{formatCurrencyPYG(p.salePrice)}</div>
                    <div className="text-xs mt-1 ui-text-muted">Stock: {formatStockInt(p.stock)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-80 flex flex-col border-l max-h-[45vh] lg:max-h-none" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-bold text-lg">Carrito</h2>
            <span className="text-sm ui-text-muted">{items.length} productos</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {items.length === 0 ? (
              <div className="ui-state-card text-center py-10 text-sm">Agrega productos haciendo click en las tarjetas</div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="ui-card p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium leading-tight flex-1 mr-2">{item.product.name}</span>
                    <button onClick={() => removeItem(item.product.id)} className="text-lg leading-none" style={{ color: 'var(--danger)' }}>x</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="ui-button ui-button-ghost w-7 h-7 p-0">-</button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="ui-button ui-button-ghost w-7 h-7 p-0">+</button>
                    </div>
                    <span className="font-bold text-sm" style={{ color: 'var(--primary)' }}>{formatCurrencyPYG(item.lineTotal)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-700">
            {selectedCustomer ? (
              <div className="ui-card p-3 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</div>
                  <div className="text-xs ui-text-muted">{selectedCustomer.phone || selectedCustomer.document || 'Sin contacto'}</div>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="text-lg" style={{ color: 'var(--danger)' }}>x</button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                  }}
                  onFocus={() => setShowCustomerSearch(true)}
                  className="w-full ui-input text-sm"
                />
                {showCustomerSearch && customerResults.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 ui-surface mb-1 max-h-40 overflow-y-auto z-10">
                    {customerResults.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCustomerSearch('');
                          setShowCustomerSearch(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm border-b last:border-0 hover:bg-[var(--surface-hover)]"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div className="font-medium">{c.firstName} {c.lastName}</div>
                        <div className="ui-text-muted text-xs">{c.phone || c.document || c.email || ''}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
            <div className="flex justify-between ui-text-muted text-sm"><span>Subtotal</span><span>{formatCurrencyPYG(subtotal)}</span></div>
            <div className="flex justify-between ui-text-muted text-sm"><span>IVA</span><span>{formatCurrencyPYG(taxTotal)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-2" style={{ borderColor: 'var(--border)' }}><span>TOTAL</span><span style={{ color: 'var(--primary)' }}>{formatCurrencyPYG(total)}</span></div>
            <button onClick={() => setShowPayment(true)} disabled={items.length === 0 || cashOpen === false} className="w-full ui-button ui-button-primary disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-xl text-lg mt-2">
              COBRAR
            </button>
            {items.length > 0 && <button onClick={clearCart} className="w-full ui-text-muted hover:text-red-400 text-sm py-1 transition-colors">Limpiar carrito</button>}
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          total={total}
          customerId={selectedCustomer?.id}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}
