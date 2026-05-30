import { AxiosError } from 'axios';
import { apiClient } from './client';

describe('apiClient response interceptor', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: 'http://localhost/' },
    });
    localStorage.setItem('pos-auth', JSON.stringify({ state: { accessToken: 'abc' } }));
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    localStorage.clear();
  });

  it('NO redirige en 401 de /auth/login', async () => {
    const handlers = (apiClient.interceptors.response as any).handlers as Array<{ rejected?: (error: any) => Promise<never> }>;
    const rejected = handlers[0]?.rejected;
    expect(rejected).toBeTypeOf('function');

    const error = new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', {
      url: '/auth/login',
    } as any);
    (error as any).response = { status: 401 };

    await expect(rejected!(error)).rejects.toBe(error);
    expect(localStorage.getItem('pos-auth')).not.toBeNull();
    expect(window.location.href).toBe('http://localhost/');
  });
});
