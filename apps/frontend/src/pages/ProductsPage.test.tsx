import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductsPage from './ProductsPage';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/features/products/hooks/useProductsQueries', () => ({
  useProductsQuery: () => ({
    data: [
      {
        id: 'p1',
        name: 'Producto Test',
        sku: 'SKU-1',
        salePrice: 8000,
        stock: 10,
        stockMin: 5,
        isActive: true,
      },
    ],
    isLoading: false,
  }),
  useProductCategoriesQuery: () => ({ data: [] }),
  useProductMovementsQuery: () => ({ data: [], isLoading: false }),
  useSaveProductMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateCategoryMutation: () => ({ mutateAsync: vi.fn() }),
}));

describe('ProductsPage render stock/price', () => {
  it('muestra stock y stock minimo como enteros literales y precio en PYG', () => {
    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Gs. 8.000')).toBeInTheDocument();
  });
});
