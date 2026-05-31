import { apiGet, apiPost, apiPut } from '@/shared/api/client';

export const fetchProducts = (search: string) =>
  apiGet<{ items: any[] }>('/products', { search: search || undefined, limit: 50 });

export const fetchProductCategories = () => apiGet<any[]>('/products/categories/all');

export const createProduct = (payload: object) => apiPost('/products', payload);

export const updateProduct = (id: string, payload: object) => apiPut(`/products/${id}`, payload);

export const fetchProductMovements = (id: string) => apiGet<any[]>(`/products/${id}/movements`);

export const createProductCategory = (payload: { name: string; color: string }) =>
  apiPost('/products/categories', payload);

type ProductFormInput = {
  name?: string;
  sku?: string;
  description?: string;
  barcode?: string;
  categoryId?: string;
  brand?: string;
  supplier?: string;
  costPrice?: number | string;
  salePrice?: number | string;
  stock?: number | string;
  stockMin?: number | string;
  taxRate?: number | string;
  unit?: string;
  trackStock?: boolean;
  isBulk?: boolean;
  imageUrl?: string;
  notes?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
};

const optionalText = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

// Keep update/create payload aligned with backend DTO (no readonly fields).
export function buildProductPayload(input: ProductFormInput, options?: { includeIsActive?: boolean }) {
  // Support mapping controlsStock (legacy) to trackStock
  const trackStockVal = input.trackStock !== undefined 
    ? input.trackStock 
    : (input as any).controlsStock;

  const payload: any = {
    name: (input.name || '').trim(),
    sku: optionalText(input.sku),
    description: optionalText(input.description),
    barcode: optionalText(input.barcode),
    categoryId: optionalText(input.categoryId),
    brand: optionalText(input.brand),
    supplier: optionalText(input.supplier),
    costPrice: Number(input.costPrice || 0),
    salePrice: Number(input.salePrice || 0),
    stock: Number(input.stock || 0),
    stockMin: Number(input.stockMin || 0),
    taxRate: Number(input.taxRate || 0),
    unit: input.unit || 'unidad',
    trackStock: trackStockVal === undefined ? true : Boolean(trackStockVal),
    isBulk: Boolean(input.isBulk),
    imageUrl: optionalText(input.imageUrl),
  };

  const notesVal = optionalText(input.notes);
  if (notesVal) {
    payload.metadata = { notes: notesVal };
  } else if (input.metadata) {
    payload.metadata = input.metadata;
  }

  if (options?.includeIsActive) {
    payload.isActive = input.isActive === undefined ? true : Boolean(input.isActive);
  }

  return payload;
}

