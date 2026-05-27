import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '../stores/cart.store';
import ReceiptModal from './ReceiptModal';
import { authFetch } from '../lib/authFetch';

interface Props {
  total: number;
  customerId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ total, customerId, onClose, onSuccess }: Props) {
  const [method, setMethod] = useState<'cash' | 'card' | 'transfer' | 'credit'>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [loading, setLoading] = useState(false);
  const { items, clearCart } = useCartStore();
  const [showReceipt, setShowReceipt] = useState(false);
  const [saleData, setSaleData] = useState<any>(null);

  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');
  const [discountValue, setDiscountValue] = useState('');

  const discountAmount = discountType === 'percent'
    ? Math.round(total * (Number(discountValue) / 100))
    : Number(discountValue) || 0;

  const finalTotal = Math.max(0, total - discountAmount);
  const amountPaidNumber = Number(amountPaid || 0);
  const change = method === 'cash' ? amountPaidNumber - finalTotal : 0;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(p || 0);

  const handleConfirm = async () => {
    if (method === 'credit' && !customerId) {
      toast.error('Fiado requiere cliente seleccionado');
      return;
    }

    if (method === 'cash' && amountPaidNumber < finalTotal) {
      toast.error('El monto recibido es menor al total');
      return;
    }

    setLoading(true);

    try {
      const body = {
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        paymentMethod: method,
        amountPaid: method === 'cash' ? amountPaidNumber : method === 'credit' ? 0 : finalTotal,
        discountAmount,
        customerId: customerId || undefined,
      };

      const res = await authFetch('/sales', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al procesar venta');
      }

      data.amountPaid = method === 'cash' ? amountPaidNumber : method === 'credit' ? 0 : finalTotal;
      data.changeAmount = method === 'cash' ? Math.max(0, change) : 0;

      clearCart();
      setSaleData(data);
      setShowReceipt(true);
    } catch (e: any) {
      toast.error(e.message || 'Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  const disableConfirm = loading || (method === 'cash' && amountPaidNumber < finalTotal);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-white text-xl font-bold mb-3">Cobrar Venta</h2>

        <div className="text-indigo-400 text-3xl font-bold mb-4">{formatPrice(finalTotal)}</div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { key: 'cash', label: 'Efectivo' },
            { key: 'card', label: 'Tarjeta' },
            { key: 'transfer', label: 'Transferencia' },
            { key: 'credit', label: 'Fiado' },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setMethod(m.key as any)}
              className={method === m.key ? 'bg-indigo-600 text-white py-2 rounded' : 'bg-gray-700 text-gray-300 py-2 rounded'}
            >
              {m.label}
            </button>
          ))}
        </div>

        {method === 'cash' && (
          <div className="mb-4">
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded"
              placeholder="Monto recibido"
            />

            {amountPaid && amountPaidNumber >= finalTotal && (
              <div className="mt-2 text-green-400 font-bold">
                Vuelto: {formatPrice(change)}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={disableConfirm}
          className="w-full bg-green-600 disabled:bg-gray-600 py-3 rounded text-white"
        >
          Confirmar
        </button>

        <button onClick={onClose} className="w-full mt-2 bg-gray-700 py-2 rounded text-white">
          Cerrar
        </button>
      </div>

      {showReceipt && saleData && (
        <ReceiptModal
          sale={saleData}
          store={JSON.parse(localStorage.getItem('pos-store') || '{}')}
          onClose={() => {
            setShowReceipt(false);
            onSuccess();
          }}
        />
      )}
    </div>
  );
}

