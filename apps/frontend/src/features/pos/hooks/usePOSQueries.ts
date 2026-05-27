import { useQuery } from '@tanstack/react-query';
import {
  fetchActiveCashRegister,
  fetchLowStockProducts,
  fetchPOSCategories,
  fetchPOSProducts,
  searchPOSCustomers,
} from '../api/pos.api';

export const posQueryKeys = {
  products: (search: string, categoryId: string) => ['pos', 'products', search, categoryId] as const,
  categories: ['pos', 'categories'] as const,
  lowStock: ['pos', 'low-stock'] as const,
  cashRegister: ['pos', 'cash-register', 'active'] as const,
  customerSearch: (query: string) => ['pos', 'customers', query] as const,
};

export const usePOSProducts = (search: string, categoryId: string) =>
  useQuery({
    queryKey: posQueryKeys.products(search, categoryId),
    queryFn: () => fetchPOSProducts({ search: search || undefined, categoryId: categoryId || undefined }),
  });

export const usePOSCategories = () =>
  useQuery({
    queryKey: posQueryKeys.categories,
    queryFn: fetchPOSCategories,
  });

export const useLowStockProducts = () =>
  useQuery({
    queryKey: posQueryKeys.lowStock,
    queryFn: fetchLowStockProducts,
  });

export const useActiveCashRegister = () =>
  useQuery({
    queryKey: posQueryKeys.cashRegister,
    queryFn: fetchActiveCashRegister,
  });

export const usePOSCustomerSearch = (query: string, enabled: boolean) =>
  useQuery({
    queryKey: posQueryKeys.customerSearch(query),
    queryFn: () => searchPOSCustomers(query),
    enabled,
  });

