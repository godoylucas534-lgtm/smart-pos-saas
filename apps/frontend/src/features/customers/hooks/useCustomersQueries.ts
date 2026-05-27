import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCustomer,
  fetchCustomers,
  updateCustomer,
  type CustomerPayload,
} from '../api/customers.api';

export const customerQueryKeys = {
  list: (search: string) => ['customers', search] as const,
};

export const useCustomersQuery = (search: string) =>
  useQuery({
    queryKey: customerQueryKeys.list(search),
    queryFn: async () => {
      const data = await fetchCustomers(search);
      return Array.isArray(data) ? data : data?.items ?? [];
    },
  });

export const useSaveCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: CustomerPayload }) =>
      id ? updateCustomer(id, payload) : createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

