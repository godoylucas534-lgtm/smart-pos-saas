import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import toast from 'react-hot-toast';
import { apiUrl } from '../config/env';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    // Datos del admin
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Datos de la tienda
    storeName: '',
    storeSlug: '',
    currency: 'PYG',
  });

  const generateSlug = (name: string) =>
    name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);

  const handleNext = () => {
    if (!form.firstName || !form.email || !form.password) {
      toast.error('Completa todos los campos requeridos');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Las contraseÃ±as no coinciden');
      return;
    }
    if (form.password.length < 8) {
      toast.error('La contraseÃ±a debe tener al menos 8 caracteres');
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    if (!form.storeName) {
      toast.error('El nombre de la tienda es requerido');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/auth/register'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          storeName: form.storeName,
          storeSlug: form.storeSlug || generateSlug(form.storeName),
          currency: form.currency,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(
        Array.isArray(data.message) ? data.message[0] : data.message
      );

      setAuth(data.user);

      // Guardar datos de la tienda
      const storeId = data.user.storeId;
      if (storeId) {
        fetch(apiUrl(`/stores/${storeId}`), {
          credentials: 'include',
        })
        .then(r => r.json())
        .then(store => localStorage.setItem('pos-store', JSON.stringify(store)))
        .catch(() => {});
      }

      toast.success('Â¡Tienda creada exitosamente! Bienvenido ðŸŽ‰');
      navigate('/pos');
    } catch (e: any) {
      toast.error(e.message || 'Error al crear la tienda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">ðŸª</div>
          <h1 className="text-white text-2xl font-bold">Crear nueva tienda</h1>
          <p className="text-gray-400 text-sm mt-1">
            Paso {step} de 2 â€” {step === 1 ? 'Datos del administrador' : 'Datos de la tienda'}
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex mb-8 gap-2">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-700'}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-700'}`} />
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-300 text-sm mb-1 block">Nombre *</label>
                <input value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Juan" />
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-1 block">Apellido</label>
                <input value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="PÃ©rez" />
              </div>
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-1 block">Email *</label>
              <input value={form.email} type="email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="tu@email.com" />
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-1 block">ContraseÃ±a *</label>
              <input value={form.password} type="password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="MÃ­nimo 8 caracteres" />
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-1 block">Confirmar contraseÃ±a *</label>
              <input value={form.confirmPassword} type="password"
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Repite la contraseÃ±a" />
            </div>

            <button onClick={handleNext}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl mt-2">
              Siguiente â†’
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-1 block">Nombre de la tienda *</label>
              <input value={form.storeName}
                onChange={(e) => setForm({
                  ...form,
                  storeName: e.target.value,
                  storeSlug: generateSlug(e.target.value),
                })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej: Boutique Glamour" />
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-1 block">
                Identificador Ãºnico (slug)
              </label>
              <input value={form.storeSlug}
                onChange={(e) => setForm({ ...form, storeSlug: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="boutique-glamour" />
              <p className="text-gray-500 text-xs mt-1">
                Solo letras minÃºsculas, nÃºmeros y guiones
              </p>
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-1 block">Moneda</label>
              <select value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="PYG">PYG â€” GuaranÃ­ (Paraguay)</option>
                <option value="USD">USD â€” DÃ³lar</option>
                <option value="ARS">ARS â€” Peso Argentino</option>
                <option value="BRL">BRL â€” Real BrasileÃ±o</option>
                <option value="CLP">CLP â€” Peso Chileno</option>
                <option value="COP">COP â€” Peso Colombiano</option>
                <option value="MXN">MXN â€” Peso Mexicano</option>
                <option value="PEN">PEN â€” Sol Peruano</option>
                <option value="UYU">UYU â€” Peso Uruguayo</option>
              </select>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(1)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-medium">
                â† AtrÃ¡s
              </button>
              <button onClick={handleRegister} disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-xl">
                {loading ? 'Creando...' : 'ðŸš€ Crear Tienda'}
              </button>
            </div>
          </div>
        )}

        <div className="text-center mt-6">
          <span className="text-gray-400 text-sm">Â¿Ya tienes cuenta? </span>
          <button onClick={() => navigate('/login')}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
            Iniciar sesiÃ³n
          </button>
        </div>
      </div>
    </div>
  );
}

