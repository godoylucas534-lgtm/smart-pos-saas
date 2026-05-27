import { useMutation } from '@tanstack/react-query';
import { fetchStoreById, loginRequest, type LoginPayload } from '../api/auth.api';

export const useLoginMutation = () =>
  useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const auth = await loginRequest(payload);
      const store = auth.user.storeId ? await fetchStoreById(auth.user.storeId) : null;
      return { auth, store };
    },
  });

