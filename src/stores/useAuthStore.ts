// stores/useAuthStore.ts
import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isGuest: boolean;
  setUser: (user: User | null) => void;
  setGuestMode: (isGuest: boolean) => void;
  logout: () => Promise<void>;
  clear: () => void;
}

// التخزين المحلي البسيط
const storage = {
  get: (): { user: User | null; isGuest: boolean } => {
    try {
      const stored = localStorage.getItem('auth-storage');
      return stored ? JSON.parse(stored) : { user: null, isGuest: false };
    } catch {
      return { user: null, isGuest: false };
    }
  },
  set: (data: { user: User | null; isGuest: boolean }) => {
    try {
      localStorage.setItem('auth-storage', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  },
  clear: () => {
    try {
      localStorage.removeItem('auth-storage');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },
};

export const useAuthStore = create<AuthState>((set, get) => {
  // تحميل الحالة الأولية من localStorage
  const { user, isGuest } = storage.get();
  
  return {
    user,
    isAdmin: user?.role === 'admin',
    isGuest,

    setUser: (user) => {
      const newState = { user, isAdmin: user?.role === 'admin', isGuest: false };
      set(newState);
      storage.set({ user, isGuest: false });
    },

    setGuestMode: (isGuest) => {
      const newState = { user: null, isAdmin: false, isGuest };
      set(newState);
      storage.set({ user: null, isGuest });
    },

    logout: async () => {
      const { supabase } = await import('../lib/supabaseClient');
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
      const newState = { user: null, isAdmin: false, isGuest: false };
      set(newState);
      storage.set({ user: null, isGuest: false });
    },

    clear: () => {
      const newState = { user: null, isAdmin: false, isGuest: false };
      set(newState);
      storage.set({ user: null, isGuest: false });
    },
  };
});

// دالة مساعدة للتحقق من صحة الجلسة
export const validateSession = async (): Promise<boolean> => {
  const { user } = useAuthStore.getState();
  
  if (!user) return false;
  
  try {
    const { supabase } = await import('../lib/supabaseClient');
    const { data: { session } } = await supabase.auth.getSession();
    return !!session && session.user.id === user.id;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
};