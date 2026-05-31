import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import SuspendedAccountBanner from './SuspendedAccountBanner';
import { useAuthStore } from '@/stores/auth.store';
import * as saasAdminApi from '@/features/saas-admin/api/saas-admin.api';

vi.mock('@/features/saas-admin/api/saas-admin.api', () => ({
  fetchMyStorePolicy: vi.fn(),
}));

describe('SuspendedAccountBanner', () => {
  it('muestra mensaje y contacto dinamicos para tenant suspendido', async () => {
    vi.mocked(saasAdminApi.fetchMyStorePolicy).mockResolvedValueOnce({
      id: 'p1',
      storeId: 's1',
      accessBlockedUntil: null,
      autoReactivateAt: null,
      customSuspendMessage: 'Cuenta bloqueada por auditoria interna.',
      supportContact: 'https://wa.me/595981111111',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any);

    useAuthStore.setState({
      user: { id: 'u1', email: 'admin@x.com', firstName: 'A', lastName: 'B', role: 'store_admin', storeId: 's1' },
      subscription: { status: 'suspended' },
      isAuthenticated: true,
      sessionChecked: true,
    } as any);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SuspendedAccountBanner />
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Cuenta bloqueada por auditoria interna./i)).toBeInTheDocument();
    const link = await screen.findByRole('link', { name: /Contactar soporte/i });
    expect(link).toHaveAttribute('href', 'https://wa.me/595981111111');
  });
});
