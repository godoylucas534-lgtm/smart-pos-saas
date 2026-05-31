import { render, screen, waitFor } from '@testing-library/react';
import CreditPage from './CreditPage';

const authFetchMock = vi.fn();
const parseJsonSafeMock = vi.fn();

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

vi.mock('../lib/authFetch', () => ({
  authFetch: (...args: any[]) => authFetchMock(...args),
  parseJsonSafe: (...args: any[]) => parseJsonSafeMock(...args),
}));

describe('CreditPage pending states', () => {
  beforeEach(() => {
    authFetchMock.mockReset();
    parseJsonSafeMock.mockReset();
  });

  it('muestra mensaje explicito de plan cuando credits esta bloqueado', async () => {
    authFetchMock.mockResolvedValueOnce({ ok: false, status: 403 });
    parseJsonSafeMock.mockResolvedValueOnce({
      code: 'SAAS_FEATURE_NOT_AVAILABLE',
      message: 'Plan actual no incluye credits',
    });

    render(<CreditPage />);

    expect(await screen.findByText(/Funcionalidad no disponible en tu plan actual/i)).toBeInTheDocument();
    expect(screen.queryByText('No hay saldos pendientes.')).not.toBeInTheDocument();
  });

  it('lista deudas cuando el plan permite credits', async () => {
    authFetchMock.mockResolvedValueOnce({ ok: true, status: 200 });
    parseJsonSafeMock.mockResolvedValueOnce([
      {
        id: 'acc-1',
        customerId: 'c-1',
        balance: 22000,
        firstName: 'Ana',
        lastName: 'Perez',
        phone: '0991000000',
      },
    ]);

    render(<CreditPage />);

    expect(await screen.findByText('Ana Perez')).toBeInTheDocument();
    expect(await screen.findByText('Gs. 22.000')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('No hay saldos pendientes.')).not.toBeInTheDocument();
    });
  });
});
