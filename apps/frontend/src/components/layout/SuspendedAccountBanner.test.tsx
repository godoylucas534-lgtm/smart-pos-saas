import { render, screen } from '@testing-library/react';
import SuspendedAccountBanner from './SuspendedAccountBanner';
import { useAuthStore } from '@/stores/auth.store';

describe('SuspendedAccountBanner', () => {
  it('muestra mensaje y CTA whatsapp para tenant suspendido', () => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'admin@x.com', firstName: 'A', lastName: 'B', role: 'store_admin', storeId: 's1' },
      subscription: { status: 'suspended' },
      isAuthenticated: true,
      sessionChecked: true,
    } as any);

    render(<SuspendedAccountBanner />);

    expect(screen.getByText(/Tu cuenta está suspendida por falta de pago/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Contactar por WhatsApp/i })).toBeInTheDocument();
  });
});
