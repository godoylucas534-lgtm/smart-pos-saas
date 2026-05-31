import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

export function PrivateRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sessionChecked = useAuthStore((s) => s.sessionChecked);
  if (!sessionChecked) {
    return <div className="min-h-screen p-6 ui-state-card">Cargando sesion...</div>;
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export function StoreAdminRoute({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" />;
  return user.role === 'store_admin' ? children : <Navigate to="/pos" />;
}

export function SuperAdminRoute({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" />;
  return user.role === 'super_admin' ? children : <Navigate to="/pos" />;
}
