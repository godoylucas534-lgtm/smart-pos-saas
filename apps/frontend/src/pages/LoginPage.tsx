import { type FormEvent, useState } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/auth.store';
import { APP_NAME } from '../config/env';
import { useLoginMutation } from '@/features/auth/hooks/useLoginMutation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const loginMutation = useLoginMutation();

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const { auth, store } = await loginMutation.mutateAsync({ email, password });
      setAuth(auth.user, auth.accessToken ?? '');
      if (store) {
        localStorage.setItem('pos-store', JSON.stringify(store));
      }
      toast.success('Bienvenido!');
      navigate('/pos');
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const payloadMessage = error.response?.data?.message;
        const message = Array.isArray(payloadMessage) ? payloadMessage.join(', ') : payloadMessage;

        if (status === 401) {
          const authError = message || 'Credenciales incorrectas';
          setErrorMessage(authError);
          toast.error(authError);
        } else if (status === 429) {
          const rateLimitError = 'Demasiados intentos, espera 1 minuto';
          setErrorMessage(rateLimitError);
          toast.error(rateLimitError);
        } else if (status && status >= 500) {
          const serverError = 'Error del servidor (5xx). Revisa backend o intenta nuevamente.';
          setErrorMessage(serverError);
          toast.error(serverError);
        } else if (error.code === 'ECONNABORTED' || !error.response) {
          const networkError = 'Error de red/conexion. Verifica API_URL y conectividad.';
          setErrorMessage(networkError);
          toast.error(networkError);
        } else {
          const genericError = message || 'No se pudo iniciar sesion';
          setErrorMessage(genericError);
          toast.error(genericError);
        }
      } else {
        const fallbackError = 'No se pudo iniciar sesion';
        setErrorMessage(fallbackError);
        toast.error(fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loading) {
      void handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          {APP_NAME}
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Inicia sesion para continuar
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="admin@empresa.com"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-1 block">Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="********"
            />
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 text-white font-bold py-3 rounded-lg transition-colors mt-2"
          >
            {loading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-400 text-sm">No tienes cuenta? </span>
            <button onClick={() => navigate('/register')}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
              Crear nueva tienda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
