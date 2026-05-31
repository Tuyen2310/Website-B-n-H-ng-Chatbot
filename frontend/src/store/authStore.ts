import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  address?: string;
  points?: number;
  googleId?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
        // Clear cart when a new user logs in to prevent session leakage
        try {
          const { useCartStore } = require('./cartStore');
          useCartStore.getState().clearCart();
        } catch (e) {}
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // Clear cart on logout
        try {
          const { useCartStore } = require('./cartStore');
          useCartStore.getState().clearCart();
        } catch (e) {}
      },
      updateUser: (updatedFields) => 
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
