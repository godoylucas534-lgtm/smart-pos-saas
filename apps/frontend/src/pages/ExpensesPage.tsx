import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authFetch } from '../lib/authFetch';

type ExpenseCategory = 'alquiler' | 'servicios' | 'insumos' | 'otros';

type Expense = {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
};

const categoryLabel: Record<ExpenseCategory, string> = {
  alquiler: 'Alquiler',
  servicios: 'Servicios',
  insumos: 'Insumos',
  otros: 'Otros',
};

export default function ExpensesPage() {
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category: 'otros' as ExpenseCategory,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/expenses');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo cargar gastos');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!form.description.trim()) {
      toast.error('La descripcion es requerida');
      return;
    }

    const amountNumber = Number(form.amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          category: form.category,
          description: form.description,
          amount: amountNumber,
          date: form.date,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(Array.isArray(err.message) ? err.message.join(', ') : err.message || 'No se pudo guardar');
      }

      toast.success('Gasto guardado');
      setForm({ ...form, description: '', amount: '' });
      await load();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar gasto');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(Number(value) || 0);

  return (
    <div className="min-h-screen bg-gray-900 p-6 max-w-6xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">Gastos</h1>

      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select
            className="bg-gray-700 rounded px-3 py-2"
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value as ExpenseCategory })}
          >
            <option value="alquiler">Alquiler</option>
            <option value="servicios">Servicios</option>
            <option value="insumos">Insumos</option>
            <option value="otros">Otros</option>
          </select>

          <input
            className="bg-gray-700 rounded px-3 py-2 md:col-span-2"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="Descripcion"
          />

          <input
            type="number"
            className="bg-gray-700 rounded px-3 py-2"
            value={form.amount}
            onChange={(event) => setForm({ ...form, amount: event.target.value })}
            placeholder="Monto"
          />

          <input
            type="date"
            className="bg-gray-700 rounded px-3 py-2"
            value={form.date}
            onChange={(event) => setForm({ ...form, date: event.target.value })}
          />
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="mt-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 px-4 py-2 rounded-lg font-semibold"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-300 border-b border-gray-700">
              <th className="text-left p-4">Fecha</th>
              <th className="text-left p-4">Categoria</th>
              <th className="text-left p-4">Descripcion</th>
              <th className="text-right p-4">Monto</th>
            </tr>
          </thead>
          <tbody>
            {items.map((entry) => (
              <tr key={entry.id} className="border-b border-gray-700/70 hover:bg-gray-700/40">
                <td className="p-4">{entry.date}</td>
                <td className="p-4">{categoryLabel[entry.category] || entry.category}</td>
                <td className="p-4">{entry.description}</td>
                <td className="p-4 text-right">{formatPrice(entry.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && items.length === 0 && <div className="text-center py-8 text-gray-400">No hay gastos cargados.</div>}
        {loading && <div className="text-center py-8 text-gray-400">Cargando gastos...</div>}
      </div>
    </div>
  );
}

