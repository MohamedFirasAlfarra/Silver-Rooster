import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isGuest: boolean;
  setUser: (user: User | null) => void;
  setGuestMode: (isGuest: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAdmin: false,
      isGuest: false,
      setUser: (user) => set({ user, isAdmin: user?.role === 'admin', isGuest: false }),
      setGuestMode: (isGuest) => set({ isGuest, user: null, isAdmin: false }),
      logout: () => set({ user: null, isAdmin: false, isGuest: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
