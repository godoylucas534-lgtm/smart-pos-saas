import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AxiosError } from 'axios';
import LoginPage from './LoginPage';

const navigateMock = vi.fn();
const setAuthMock = vi.fn();
const mutateAsyncMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('../stores/auth.store', () => ({
  useAuthStore: (selector: any) => selector({ setAuth: setAuthMock }),
}));

vi.mock('@/features/auth/hooks/useLoginMutation', () => ({
  useLoginMutation: () => ({ mutateAsync: mutateAsyncMock }),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: (...args: any[]) => toastSuccessMock(...args),
    error: (...args: any[]) => toastErrorMock(...args),
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('login exitoso + store disponible => guarda auth/store y navega normal', async () => {
    mutateAsyncMock.mockResolvedValueOnce({
      auth: {
        user: { id: 'u1', email: 'admin@test.com', firstName: 'A', lastName: 'B', role: 'store_admin', storeId: 's1' },
      },
      store: { id: 's1', name: 'Store One' },
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText('admin@empresa.com'), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('********'), { target: { value: 'Pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesion' }));

    await waitFor(() => {
      expect(setAuthMock).toHaveBeenCalledWith(
        { id: 'u1', email: 'admin@test.com', firstName: 'A', lastName: 'B', role: 'store_admin', storeId: 's1' },
        expect.any(String),
      );
    });
    expect(localStorage.getItem('pos-store')).toBe(JSON.stringify({ id: 's1', name: 'Store One' }));
    expect(toastSuccessMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/pos');
  });

  it('login 401 => mensaje de credenciales incorrectas', async () => {
    mutateAsyncMock.mockRejectedValueOnce(
      new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
        data: { message: 'Credenciales incorrectas' },
      }),
    );

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText('admin@empresa.com'), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('********'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesion' }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Credenciales incorrectas');
    });
    expect(navigateMock).not.toHaveBeenCalledWith('/pos');
  });

  it('login sin response => mensaje de red/conectividad', async () => {
    mutateAsyncMock.mockRejectedValueOnce(
      new AxiosError('Network Error', 'ERR_NETWORK', {
        baseURL: 'https://api.example.com',
        url: '/auth/login',
      } as any),
    );

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText('admin@empresa.com'), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('********'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesion' }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith(expect.stringContaining('Error CORS/bloqueo'));
    });
  });

  it('login 5xx => mensaje de servidor', async () => {
    mutateAsyncMock.mockRejectedValueOnce(
      new AxiosError('Server Error', 'ERR_BAD_RESPONSE', { url: '/auth/login' } as any, undefined, {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {},
        config: {} as any,
        data: { message: 'Backend down' },
      }),
    );

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText('admin@empresa.com'), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('********'), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesion' }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Error servidor 503. Intenta nuevamente.');
    });
  });
});
