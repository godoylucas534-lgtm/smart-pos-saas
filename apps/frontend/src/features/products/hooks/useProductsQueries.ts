import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProduct,
  createProductCategory,
  fetchProductCategories,
  fetchProductMovements,
  fetchProducts,
  updateProduct,
} from '../api/products.api';

export const productsQueryKeys = {
  list: (search: string) => ['products', 'list', search] as const,
  categories: ['products', 'categories'] as const,
  movements: (id: string) => ['products', 'movements', id] as const,
};

export const useProductsQuery = (search: string) =>
  useQuery({
    queryKey: productsQueryKeys.list(search),
    queryFn: async () => {
      const data = await fetchProducts(search);
      return data?.items ?? [];
    },
  });

export const useProductCategoriesQuery = () =>
  useQuery({
    queryKey: productsQueryKeys.categories,
    queryFn: fetchProductCategories,
  });

export const useProductMovementsQuery = (productId: string, enabled: boolean) =>
  useQuery({
    queryKey: productsQueryKeys.movements(productId),
    queryFn: () => fetchProductMovements(productId),
    enabled,
  });

export const useSaveProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: object }) =>
      id ? updateProduct(id, payload) : createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'products'] });
    },
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'categories'] });
    },
  });
};

