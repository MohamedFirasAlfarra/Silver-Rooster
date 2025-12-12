// stores/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isGuest: boolean;
  lastActivity: number;
  setUser: (user: User | null) => void;
  setGuestMode: (isGuest: boolean) => void;
  updateLastActivity: () => void;
  logout: () => Promise<void>;
  clear: () => void;
}

// دالة تخزين مخصصة مع معالجة الأخطاء
const storage = {
  getItem: (name: string) => {
    try {
      const value = localStorage.getItem(name);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  setItem: (name: string, value: any) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAdmin: false,
      isGuest: false,
      lastActivity: Date.now(),

      setUser: (user) => {
        if (user) {
          console.log('👤 تعيين مستخدم:', user.email, 'الدور:', user.role);
        } else {
          console.log('👤 تعيين مستخدم: null');
        }
        
        set({
          user,
          isAdmin: user?.role === 'admin',
          isGuest: false,
          lastActivity: Date.now(),
        });
      },

      setGuestMode: (isGuest) => {
        console.log('👤 وضع الضيف:', isGuest);
        set({
          isGuest,
          user: null,
          isAdmin: false,
          lastActivity: Date.now(),
        });
      },

      updateLastActivity: () => {
        set({
          lastActivity: Date.now(),
        });
      },

      logout: async () => {
        console.log('🚪 تسجيل الخروج...');
        const { supabase } = await import('../lib/supabaseClient');
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Error signing out:', error);
        }
        set({
          user: null,
          isAdmin: false,
          isGuest: false,
          lastActivity: Date.now(),
        });
      },

      clear: () => {
        console.log('🧹 تنظيف حالة المصادقة');
        set({
          user: null,
          isAdmin: false,
          isGuest: false,
          lastActivity: Date.now(),
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => storage),
      // تجنب تخزين التوكنات الحساسة
      partialize: (state) => ({
        user: state.user ? {
          id: state.user.id,
          email: state.user.email,
          role: state.user.role,
        } : null,
        isAdmin: state.isAdmin,
        isGuest: state.isGuest,
        lastActivity: state.lastActivity,
      }),
    }
  )
);

// دالة مساعدة للتحقق من انتهاء الجلسة
export const checkSessionExpiry = () => {
  const { lastActivity, user } = useAuthStore.getState();
  
  // فقط تحقق إذا كان هناك مستخدم مسجل
  if (!user) return false;
  
  const TWELVE_HOURS = 12 * 60 * 60 * 1000; // 12 ساعة
  
  if (Date.now() - lastActivity > TWELVE_HOURS) {
    console.log('⏰ انتهت جلسة المستخدم بسبب عدم النشاط');
    useAuthStore.getState().clear();
    return true;
  }
  
  useAuthStore.getState().updateLastActivity();
  return false;
};

// دالة للتحقق من صحة جلسة المستخدم
export const validateUserSession = async () => {
  const { user, isAdmin, isGuest } = useAuthStore.getState();
  
  if (isGuest) return { valid: true, isGuest: true };
  if (!user) return { valid: false, reason: 'No user found' };
  
  try {
    const { supabase } = await import('../lib/supabaseClient');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('❌ لا توجد جلسة نشطة في Supabase');
      return { valid: false, reason: 'No active session' };
    }
    
    // تحقق من تطابق ID المستخدم
    if (session.user.id !== user.id) {
      console.log('❌ هوية المستخدم غير متطابقة');
      return { valid: false, reason: 'User ID mismatch' };
    }
    
    return { valid: true, user, isAdmin };
  } catch (error) {
    console.error('Error validating session:', error);
    return { valid: false, reason: 'Validation error' };
  }
};