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
    <div className="h-screen bg-gray-900 flex flex-col">
      <div className="px-4 py-2 border-b border-gray-700 flex flex-wrap gap-2 bg-gray-900/95">
        <button className="ui-button ui-button-ghost text-xs" onClick={() => productSearchRef.current?.focus()}>F2 Buscar</button>
        <button className="ui-button ui-button-ghost text-xs" onClick={() => setShowPayment(true)} disabled={items.length === 0 || cashOpen === false}>F4 Cobrar</button>
        <button className="ui-button ui-button-ghost text-xs" onClick={clearCart} disabled={items.length === 0}>F6 Limpiar</button>
        <span className="text-xs self-center" style={{ color: 'var(--text-muted)' }}>
          Atajos rapidos para caja moderna
        </span>
      </div>
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-900 border-b border-yellow-700 px-4 py-2 flex items-center gap-3">
          <span className="text-yellow-400 text-lg">!</span>
          <span className="text-yellow-300 text-sm font-medium">
            Stock bajo: {lowStockItems.map((p) => `${p.name} (${formatStockInt(p.stock)} ${p.unit})`).join(' - ')}
          </span>
        </div>
      )}

      {cashOpen === false && (
        <div className="bg-red-900 border-b border-red-700 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-red-400 text-lg">X</span>
            <span className="text-red-300 text-sm font-medium">Caja cerrada. Debes abrir la caja antes de cobrar.</span>
          </div>
          <button onClick={() => navigate('/cash-register')} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg">
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
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCat('')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap font-medium ${selectedCat === '' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(selectedCat === cat.id ? '' : cat.id)}
                style={{ backgroundColor: selectedCat === cat.id ? cat.color : '' }}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap font-medium ${selectedCat === cat.id ? 'text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-gray-400 text-center py-20">Cargando productos...</div>
            ) : products.length === 0 ? (
              <div className="text-gray-400 text-center py-20">No se encontraron productos</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addItem({ id: p.id, name: p.name, sku: p.sku, salePrice: p.salePrice, taxRate: p.taxRate, stock: p.stock, unit: p.unit })}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-500 rounded-xl p-3 text-left transition-all"
                  >
                    <div className="text-white text-sm font-medium leading-tight mb-1">{p.name}</div>
                    <div className="text-indigo-400 font-bold">{formatCurrencyPYG(p.salePrice)}</div>
                    <div className="text-gray-500 text-xs mt-1">Stock: {formatStockInt(p.stock)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-80 bg-gray-800 flex flex-col border-l border-gray-700 max-h-[45vh] lg:max-h-none">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-white font-bold text-lg">Carrito</h2>
            <span className="text-gray-400 text-sm">{items.length} productos</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {items.length === 0 ? (
              <div className="text-gray-500 text-center py-10 text-sm">Agrega productos haciendo click en las tarjetas</div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white text-sm font-medium leading-tight flex-1 mr-2">{item.product.name}</span>
                    <button onClick={() => removeItem(item.product.id)} className="text-red-400 hover:text-red-300 text-lg leading-none">x</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="bg-gray-600 hover:bg-gray-500 text-white w-7 h-7 rounded-lg font-bold">-</button>
                      <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="bg-gray-600 hover:bg-gray-500 text-white w-7 h-7 rounded-lg font-bold">+</button>
                    </div>
                    <span className="text-indigo-400 font-bold text-sm">{formatCurrencyPYG(item.lineTotal)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-700">
            {selectedCustomer ? (
              <div className="bg-indigo-900 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <div className="text-white text-sm font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</div>
                  <div className="text-indigo-300 text-xs">{selectedCustomer.phone || selectedCustomer.document || 'Sin contacto'}</div>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="text-red-400 hover:text-red-300 text-lg">x</button>
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
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {showCustomerSearch && customerResults.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 bg-gray-700 rounded-lg shadow-xl mb-1 max-h-40 overflow-y-auto z-10 border border-gray-600">
                    {customerResults.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCustomerSearch('');
                          setShowCustomerSearch(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-600 text-white text-sm border-b border-gray-600 last:border-0"
                      >
                        <div className="font-medium">{c.firstName} {c.lastName}</div>
                        <div className="text-gray-400 text-xs">{c.phone || c.document || c.email || ''}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-700 space-y-2">
            <div className="flex justify-between text-gray-400 text-sm"><span>Subtotal</span><span>{formatCurrencyPYG(subtotal)}</span></div>
            <div className="flex justify-between text-gray-400 text-sm"><span>IVA</span><span>{formatCurrencyPYG(taxTotal)}</span></div>
            <div className="flex justify-between text-white font-bold text-lg border-t border-gray-600 pt-2"><span>TOTAL</span><span className="text-indigo-400">{formatCurrencyPYG(total)}</span></div>
            <button onClick={() => setShowPayment(true)} disabled={items.length === 0 || cashOpen === false} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg transition-colors mt-2">
              COBRAR
            </button>
            {items.length > 0 && <button onClick={clearCart} className="w-full text-gray-400 hover:text-red-400 text-sm py-1 transition-colors">Limpiar carrito</button>}
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
