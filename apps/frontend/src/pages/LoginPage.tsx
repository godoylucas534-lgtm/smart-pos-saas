import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/auth.store';
import { APP_NAME } from '../config/env';
import { useLoginMutation } from '@/features/auth/hooks/useLoginMutation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const loginMutation = useLoginMutation();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { auth, store } = await loginMutation.mutateAsync({ email, password });
      setAuth(auth.user, auth.accessToken);
      if (store) {
        localStorage.setItem('pos-store', JSON.stringify(store));
      }
      toast.success('Bienvenido!');
      navigate('/pos');
    } catch {
      toast.error('No se puede conectar al servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          {APP_NAME}
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Inicia sesiÃ³n para continuar
        </p>

        <div className="space-y-4">
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
            <label className="text-gray-300 text-sm mb-1 block">ContraseÃ±a</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 text-white font-bold py-3 rounded-lg transition-colors mt-2"
          >
            {loading ? 'Iniciando sesiÃ³n...' : 'Iniciar SesiÃ³n'}
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-400 text-sm">Â¿No tienes cuenta? </span>
            <button onClick={() => navigate('/register')}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
              Crear nueva tienda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

