import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isGuest: boolean;
  lastLogin: string | null;
  setUser: (user: User | null) => void;
  setGuestMode: (isGuest: boolean) => void;
  logout: () => void;
  updateLastLogin: () => void;
  getRedirectPath: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAdmin: false,
      isGuest: false,
      lastLogin: null,

      setUser: (user) =>
        set({
          user,
          isAdmin: user?.role === "admin",
          isGuest: false,
          lastLogin: new Date().toISOString()
        }),

      setGuestMode: (isGuest) =>
        set({
          isGuest,
          user: null,
          isAdmin: false
        }),

      logout: () => {
        set({
          user: null,
          isAdmin: false,
          isGuest: false,
          lastLogin: null
        });
        localStorage.removeItem('auth-storage');
      },

      updateLastLogin: () => {
        set({ lastLogin: new Date().toISOString() });
      },

      getRedirectPath: () => {
        const { isAdmin } = get();
        return isAdmin ? '/admin/dashboard' : '/';
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);