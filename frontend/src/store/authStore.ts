import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Tenant } from '@/types';
import { api } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    tenant_name: string;
    tenant_domain: string;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    timezone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('auth_token'),
      isLoading: false,
      isAuthenticated: !!localStorage.getItem('auth_token'),

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.login(email, password);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.register(data);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } catch (error) {
          // Ignorar erros no logout
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          localStorage.removeItem('auth_token');
        }
      },

      fetchUser: async () => {
        if (!get().token) return;
        set({ isLoading: true });
        try {
          const user = await api.getMe();
          set({ user, isLoading: false });
        } catch (error) {
          set({ isLoading: false, isAuthenticated: false });
          localStorage.removeItem('auth_token');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

