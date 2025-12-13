// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// تهيئة التخزين مع معالجة الأخطاء
const createSafeStorage = () => {
  return {
    getItem: (key: string) => {
      try {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(key);
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    },
    removeItem: (key: string) => {
      try {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
    },
  };
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: createSafeStorage(),
  },
});

// دالة مبسطة للحصول على الجلسة مع معالجة الأخطاء
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('Unexpected error getting session:', error);
    return null;
  }
};

// دالة للحصول على المستخدم الحالي
export const getCurrentUser = async () => {
  const session = await getSession();
  return session?.user || null;
};

// دالة للتحقق مما إذا كان المستخدم مسؤولاً
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.role === 'admin';
  } catch (error) {
    console.error('Unexpected error checking admin:', error);
    return false;
  }
};