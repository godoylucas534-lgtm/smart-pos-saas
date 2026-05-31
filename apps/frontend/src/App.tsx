import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import AppLayout from './components/layout/AppLayout';
import { getSessionMe } from './features/auth/api/auth.api';
import { PrivateRoute, StoreAdminRoute, SuperAdminRoute } from './components/auth/RoleGuards';

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
const ControlCenterPage = lazy(() => import('./pages/ControlCenterPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

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
        setAuth(session.user, undefined, session.subscription ?? null);
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
          <Route path="/reports" element={<StoreAdminRoute><ReportsPage /></StoreAdminRoute>} />
          <Route path="/settings" element={<StoreAdminRoute><SettingsPage /></StoreAdminRoute>} />
          <Route path="/users" element={<StoreAdminRoute><UsersPage /></StoreAdminRoute>} />
          <Route path="/expenses" element={<StoreAdminRoute><ExpensesPage /></StoreAdminRoute>} />
          <Route path="/control-center" element={<SuperAdminRoute><ControlCenterPage /></SuperAdminRoute>} />
        </Route>

        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
