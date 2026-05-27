import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/auth.store';
import { authFetch } from '../lib/authFetch';

type StoreForm = {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  currency: string;
  receiptFooter: string;
};

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<StoreForm>({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    currency: 'PYG',
    receiptFooter: 'Gracias por su compra.',
  });

  const storeId = JSON.parse(localStorage.getItem('pos-auth') || '{}')?.state?.user?.storeId;

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await authFetch(`/stores/${storeId}`);
        if (!res.ok) return;

        const data = await res.json();
        setForm({
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          taxId: data.taxId || '',
          currency: data.currency || 'PYG',
          receiptFooter: data.settings?.receiptFooter || 'Gracias por su compra.',
        });
      } catch (error: any) {
        toast.error(error.message || 'No se pudo cargar la configuracion');
      }
    };

    if (storeId) fetchStore();
  }, [storeId]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('El nombre de la tienda es requerido');
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch(`/stores/${storeId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...form,
          settings: { receiptFooter: form.receiptFooter },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(Array.isArray(err.message) ? err.message.join(', ') : err.message || 'Error al guardar');
      }

      toast.success('Configuracion guardada');
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar configuracion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">Configuracion de Tienda</h1>

      <div className="bg-gray-800 rounded-xl p-6 space-y-5 border border-gray-700">
        <div>
          <label className="text-gray-300 text-sm mb-1 block">Nombre de la tienda *</label>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="w-full bg-gray-700 rounded-lg px-4 py-3"
            placeholder="Ej: Tienda Principal"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Telefono</label>
            <input
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-3"
              placeholder="0971 000000"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Email</label>
            <input
              value={form.email}
              type="email"
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-3"
              placeholder="tienda@correo.com"
            />
          </div>
        </div>

        <div>
          <label className="text-gray-300 text-sm mb-1 block">Direccion</label>
          <input
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
            className="w-full bg-gray-700 rounded-lg px-4 py-3"
            placeholder="Calle y numero"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">RUC / NIT</label>
            <input
              value={form.taxId}
              onChange={(event) => setForm({ ...form, taxId: event.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-3"
              placeholder="0000000-0"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Moneda</label>
            <select
              value={form.currency}
              onChange={(event) => setForm({ ...form, currency: event.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-3"
            >
              <option value="PYG">PYG - Guarani</option>
              <option value="USD">USD - Dolar</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-gray-300 text-sm mb-1 block">Mensaje en recibo</label>
          <textarea
            value={form.receiptFooter}
            onChange={(event) => setForm({ ...form, receiptFooter: event.target.value })}
            className="w-full bg-gray-700 rounded-lg px-4 py-3"
            rows={3}
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 py-3 rounded-xl font-bold"
        >
          {loading ? 'Guardando...' : 'Guardar Configuracion'}
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 mt-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-3">Usuario actual</h2>
        <div className="text-gray-300">{user?.firstName} {user?.lastName}</div>
        <div className="text-gray-400 text-sm">{user?.email}</div>
      </div>
    </div>
  );
}

