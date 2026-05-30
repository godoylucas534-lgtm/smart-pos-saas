import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import type { ReactNode } from 'react';
import { useLoginMutation } from './useLoginMutation';
import { fetchStoreById, loginRequest } from '../api/auth.api';

vi.mock('../api/auth.api', () => ({
  loginRequest: vi.fn(),
  fetchStoreById: vi.fn(),
}));

const mockedLoginRequest = vi.mocked(loginRequest);
const mockedFetchStoreById = vi.mocked(fetchStoreById);

const authResponse = {
  user: {
    id: 'u1',
    email: 'admin@test.com',
    firstName: 'Admin',
    lastName: 'Test',
    role: 'store_admin',
    storeId: 'store-1',
  },
};

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useLoginMutation', () => {
  it('login exitoso + fetch tienda exitoso => retorna auth + store', async () => {
    mockedLoginRequest.mockResolvedValueOnce(authResponse as any);
    mockedFetchStoreById.mockResolvedValueOnce({ id: 'store-1', name: 'Store 1' } as any);

    const { result } = renderHook(() => useLoginMutation(), { wrapper });
    let data: any;
    await waitFor(async () => {
      data = await result.current.mutateAsync({ email: 'admin@test.com', password: 'pass1234' });
    });

    expect(mockedFetchStoreById).toHaveBeenCalledWith('store-1');
    expect(data.auth).toEqual(authResponse);
    expect(data.store).toEqual({ id: 'store-1', name: 'Store 1' });
  });

  it('login exitoso + fetch tienda 401 => NO rompe login principal y store null', async () => {
    mockedLoginRequest.mockResolvedValueOnce(authResponse as any);
    mockedFetchStoreById.mockRejectedValueOnce(
      new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
        data: { message: 'Unauthorized' },
      }),
    );

    const { result } = renderHook(() => useLoginMutation(), { wrapper });
    const data = await result.current.mutateAsync({ email: 'admin@test.com', password: 'pass1234' });

    expect(data.auth).toEqual(authResponse);
    expect(data.store).toBeNull();
  });
});
