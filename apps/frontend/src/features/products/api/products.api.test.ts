import { buildProductPayload } from './products.api';

describe('buildProductPayload', () => {
  it('excluye campos readonly/prohibidos y sanitiza opcionales', () => {
    const payload = buildProductPayload({
      id: 'prod-1' as any,
      storeId: 'store-1' as any,
      createdAt: '2026-01-01' as any,
      updatedAt: '2026-01-02' as any,
      category: { id: 'cat-1', name: 'Categoria' } as any,
      name: ' Yerba ',
      sku: '',
      description: '  ',
      barcode: '123',
      categoryId: '',
      brand: ' ACME ',
      supplier: '',
      costPrice: '5000' as any,
      salePrice: 8000,
      stock: '12' as any,
      stockMin: 2,
      taxRate: 10,
      unit: 'unidad',
      trackStock: true,
      isBulk: false,
      imageUrl: '  ',
      notes: ' nota interna ',
      isActive: true,
    } as any);

    expect(payload).toEqual({
      name: 'Yerba',
      sku: undefined,
      description: undefined,
      barcode: '123',
      categoryId: undefined,
      brand: 'ACME',
      supplier: undefined,
      costPrice: 5000,
      salePrice: 8000,
      stock: 12,
      stockMin: 2,
      taxRate: 10,
      unit: 'unidad',
      trackStock: true,
      isBulk: false,
      imageUrl: undefined,
      notes: 'nota interna',
      isActive: true,
    });

    expect(payload).not.toHaveProperty('id');
    expect(payload).not.toHaveProperty('storeId');
    expect(payload).not.toHaveProperty('createdAt');
    expect(payload).not.toHaveProperty('updatedAt');
    expect(payload).not.toHaveProperty('category');
    expect(payload).not.toHaveProperty('metadata');
    expect(payload).not.toHaveProperty('controlsStock');
  });
});
