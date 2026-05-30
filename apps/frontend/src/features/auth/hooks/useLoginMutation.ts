import { useMutation } from '@tanstack/react-query';
import { fetchStoreById, loginRequest, type LoginPayload } from '../api/auth.api';

export const useLoginMutation = () =>
  useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const auth = await loginRequest(payload);
      let store = null;
      if (auth.user.storeId) {
        try {
          store = await fetchStoreById(auth.user.storeId);
        } catch {
          store = null;
        }
      }
      return { auth, store };
    },
  });
