import { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { logoutRequest } from '@/features/auth/api/auth.api';

type MenuItem = {
  to: string;
  icon: string;
  label: string;
  adminOnly: boolean;
};

const menu: MenuItem[] = [
  { to: '/pos', icon: '\u{1F3EA}', label: 'POS', adminOnly: false },
  { to: '/dashboard', icon: '\u{1F4CA}', label: 'Dashboard', adminOnly: false },
  { to: '/products', icon: '\u{1F4E6}', label: 'Inventario', adminOnly: false },
  { to: '/customers', icon: '\u{1F465}', label: 'Clientes', adminOnly: false },
  { to: '/cash-register', icon: '\u{1F4B0}', label: 'Caja', adminOnly: false },
  { to: '/reports', icon: '\u{1F4C8}', label: 'Reportes', adminOnly: true },
  { to: '/expenses', icon: '\u{1F4B8}', label: 'Gastos', adminOnly: true },
  { to: '/credits', icon: '\u{1F91D}', label: 'Creditos', adminOnly: true },
  { to: '/users', icon: '\u{1F464}', label: 'Usuarios', adminOnly: true },
  { to: '/settings', icon: '\u2699\uFE0F', label: 'Config', adminOnly: true },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const links = useMemo(() => {
    const isCashier = user?.role === 'cashier';
    return menu.filter((item) => !(isCashier && item.adminOnly));
  }, [user?.role]);

  const onLogout = async () => {
    try {
      await logoutRequest();
    } catch {
      // Siempre limpiar estado local aunque falle el endpoint
    }
    clearAuth();
    navigate('/login');
  };

  return (
    <>
      <button
        type="button"
        className="md:hidden fixed top-3 left-3 z-50 ui-button ui-button-ghost"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
      >
        \u2630
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menu"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen z-50 transition-all duration-200 ${collapsed ? 'w-20' : 'w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ background: 'var(--bg-muted)', borderRight: '1px solid var(--border)' }}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            {!collapsed && <div className="font-bold tracking-tight">Sistema POS</div>}
            <button
              type="button"
              className="text-sm"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? 'Expandir' : 'Colapsar'}
            >
              {collapsed ? '>' : '<'}
            </button>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'text-white' : ''}`
                }
                style={({ isActive }) =>
                  isActive
                    ? { background: 'var(--primary)' }
                    : { color: 'var(--text-muted)' }
                }
              >
                <span className="text-xl leading-none" aria-hidden="true">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
            {!collapsed && (
              <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                <div>{user?.firstName} {user?.lastName}</div>
                <div>{user?.storeId}</div>
              </div>
            )}
            <button
              type="button"
              className="w-full ui-button ui-button-danger text-sm"
              onClick={onLogout}
            >
              {collapsed ? 'Salir' : 'Logout'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
