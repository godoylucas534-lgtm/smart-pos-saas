import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import OfflineBanner from '../pwa/OfflineBanner';
import ThemeToggle from '../ui/ThemeToggle';
import AlertCenter from './AlertCenter';

const CommandPalette = lazy(() => import('./CommandPalette'));

export default function AppLayout() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <OfflineBanner />
      <Sidebar />
      <main className="md:pl-64 pl-0 transition-all">
        <div className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-black/20">
          <div className="flex items-center justify-end gap-2 p-3 md:p-4">
            <AlertCenter />
            <Suspense fallback={null}>
              <CommandPalette />
            </Suspense>
            <ThemeToggle />
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
