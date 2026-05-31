import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  storeId: string;
}

interface SubscriptionInfo {
  plan?: string;
  status?: string;
  trialEndsAt?: string | null;
  currentPeriodEndsAt?: string | null;
  graceEndsAt?: string | null;
}

interface AuthState {
  user: User | null;
  subscription: SubscriptionInfo | null;
  isAuthenticated: boolean;
  sessionChecked: boolean;
  setAuth: (user: User, _accessToken?: string, subscription?: SubscriptionInfo | null) => void;
  clearAuth: () => void;
  markSessionChecked: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      subscription: null,
      isAuthenticated: false,
      sessionChecked: false,
      setAuth: (user, _accessToken, subscription) => set({ user, subscription: subscription ?? null, isAuthenticated: true }),
      clearAuth: () => set({ user: null, subscription: null, isAuthenticated: false }),
      markSessionChecked: () => set({ sessionChecked: true }),
    }),
    {
      name: 'pos-auth',
      partialize: (state) => ({
        user: state.user,
        subscription: state.subscription,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthUser = () => useAuthStore((state) => state.user);
