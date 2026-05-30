import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useSaveProductMutation } from './useProductsQueries';
import { buildProductPayload } from '../api/products.api';

const updateProductMock = vi.fn();
const createProductMock = vi.fn();

vi.mock('../api/products.api', async () => {
  const actual = await vi.importActual<typeof import('../api/products.api')>('../api/products.api');
  return {
    ...actual,
    updateProduct: (...args: any[]) => updateProductMock(...args),
    createProduct: (...args: any[]) => createProductMock(...args),
  };
});

describe('useSaveProductMutation', () => {
  beforeEach(() => {
    updateProductMock.mockReset();
    createProductMock.mockReset();
  });

  it('en update envia payload limpio sin campos prohibidos', async () => {
    updateProductMock.mockResolvedValueOnce({});
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const dirtyForm: any = {
      id: 'p1',
      storeId: 's1',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
      category: { id: 'c1', name: 'Cat' },
      metadata: { notes: 'x' },
      name: ' Producto ',
      categoryId: '',
      salePrice: 8000,
      stock: 6,
      stockMin: 1,
      taxRate: 10,
      unit: 'unidad',
      trackStock: true,
      isBulk: false,
    };
    const cleanPayload = buildProductPayload(dirtyForm);

    const { result } = renderHook(() => useSaveProductMutation(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: 'p1', payload: cleanPayload });
    });

    expect(updateProductMock).toHaveBeenCalledTimes(1);
    expect(updateProductMock).toHaveBeenCalledWith('p1', cleanPayload);
    expect(cleanPayload).not.toHaveProperty('id');
    expect(cleanPayload).not.toHaveProperty('storeId');
    expect(cleanPayload).not.toHaveProperty('createdAt');
    expect(cleanPayload).not.toHaveProperty('updatedAt');
    expect(cleanPayload).not.toHaveProperty('category');
    expect(cleanPayload).not.toHaveProperty('metadata');
  });
});
