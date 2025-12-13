// components/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getSession } from '../lib/supabaseClient';
import { useAuthStore } from '../stores/useAuthStore';

interface AuthContextType {
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { setUser, clear, user } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('🚀 بدء تهيئة المصادقة...');

        // الحصول على الجلسة الحالية
        const session = await getSession();

        if (!session) {
          console.log('❌ لا توجد جلسة نشطة - وضع الزائر');
          return;
        }

        console.log('✅ جلسة موجودة:', session.user.email);

        // جلب بيانات الملف الشخصي
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, email')
          .eq('id', session.user.id)
          .maybeSingle();

        // إذا لم يكن هناك ملف شخصي، لا توجد مشكلة - استخدم البيانات الافتراضية
        const role = profile?.role || 'user';
        const userEmail = profile?.email || session.user.email || '';

        if (isMounted) {
          setUser({
            id: session.user.id,
            email: userEmail,
            role: role,
          });

          console.log('✅ تم تحديث حالة المستخدم');
        }

      } catch (error) {
        console.error('❌ خطأ في تهيئة المصادقة:', error);
        if (isMounted) {
          clear();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // بدء التهيئة مع timeout احتياطي
    initializeAuth();

    timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('⚠️ انتهت مهلة التهيئة، إيقاف التحميل');
        setLoading(false);
      }
    }, 5000); // 5 ثواني كحد أقصى

    // الاستماع لتغيرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 تغير حالة المصادقة:', event);

        if (!isMounted) return;

        if (event === 'SIGNED_IN' && session) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, email')
              .eq('id', session.user.id)
              .maybeSingle();

            setUser({
              id: session.user.id,
              email: profile?.email || session.user.email || '',
              role: profile?.role || 'user',
            });
          } catch (error) {
            console.error('Error updating user after sign in:', error);
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              role: 'user',
            });
          }
        } else if (event === 'SIGNED_OUT') {
          clear();
        } else if (event === 'USER_UPDATED' && session) {
          // تحديث بيانات المستخدم إذا لزم الأمر
          if (user?.id === session.user.id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, email')
              .eq('id', session.user.id)
              .maybeSingle();

            setUser({
              id: session.user.id,
              email: profile?.email || session.user.email || '',
              role: profile?.role || 'user',
            });
          }
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);