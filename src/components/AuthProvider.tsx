// components/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../stores/useAuthStore';

interface AuthContextType {
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  loading: true,
  refreshUser: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { setUser, clear } = useAuthStore();

  // دالة لتحديث حالة المستخدم
  const refreshUser = useCallback(async () => {
    try {
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        clear();
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error( profileError);
        
        // إذا لم يكن هناك ملف شخصي، أنشئ واحداً افتراضي
        if (profileError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{ 
              id: session.user.id, 
              email: session.user.email,
              role: 'user'
            }]);

          if (insertError) {
            console.error( insertError);
          }
        }
      }

      // تحديث حالة المستخدم
      setUser({
        id: session.user.id,
        email: session.user.email || '',
        role: profile?.role || 'user',
      });

      console.log('✅ تم تحديث حالة المستخدم:', {
        id: session.user.id,
        email: session.user.email,
        role: profile?.role || 'user'
      });

    } catch (error) {
      clear();
    }
  }, [setUser, clear]);
  useEffect(() => {
    const initializeAuth = async () => {
      try {        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await refreshUser();
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // الاستماع لتغيرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await refreshUser();
        } else if (event === 'SIGNED_OUT') {
          clear();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUser, clear]);

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
    <AuthContext.Provider value={{ loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);