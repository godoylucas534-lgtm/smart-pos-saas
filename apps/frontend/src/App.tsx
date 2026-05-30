import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import AppLayout from './components/layout/AppLayout';
import { getSessionMe } from './features/auth/api/auth.api';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const POSPage = lazy(() => import('./pages/POSPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const CashRegisterPage = lazy(() => import('./pages/CashRegisterPage'));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage'));
const CreditPage = lazy(() => import('./pages/CreditPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PrivateRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sessionChecked = useAuthStore((s) => s.sessionChecked);
  if (!sessionChecked) {
    return <div className="min-h-screen bg-gray-900 text-gray-300 p-6">Cargando sesion...</div>;
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" />;
  return user.role === 'store_admin' ? children : <Navigate to="/pos" />;
}

export default function App() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const markSessionChecked = useAuthStore((s) => s.markSessionChecked);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const session = await getSessionMe();
        if (!active) return;
        setAuth(session.user);
      } catch {
        if (!active) return;
        clearAuth();
      } finally {
        if (active) markSessionChecked();
      }
    })();
    return () => {
      active = false;
    };
  }, [setAuth, clearAuth, markSessionChecked]);

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 text-gray-300 p-6">Cargando...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/pos" element={<POSPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/cash-register" element={<CashRegisterPage />} />
          <Route path="/credits" element={<CreditPage />} />
          <Route path="/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
          <Route path="/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
          <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
          <Route path="/expenses" element={<AdminRoute><ExpensesPage /></AdminRoute>} />
        </Route>

        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
