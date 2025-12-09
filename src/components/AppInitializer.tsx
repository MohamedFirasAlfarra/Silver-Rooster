// components/AppInitializer.tsx
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // تحميل المنتجات عند بدء التطبيق
    const initializeApp = async () => {
      // تحقق مما إذا كانت المنتجات محملة مسبقاً
      const cachedProducts = queryClient.getQueryData(['products-all']);
      
      if (!cachedProducts) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
            .eq('is_deleted', false);
            
          if (!error && data) {
            queryClient.setQueryData(['products-all'], data);
            console.log('🚀 تم تحميل المنتجات عند بدء التطبيق:', data.length);
          }
        } catch (error) {
          console.error('❌ خطأ في تحميل المنتجات الأولي:', error);
        }
      }
    };
    
    initializeApp();
    
    // يمكنك إضافة المزيد من التحضيرات هنا
  }, [queryClient]);
  
  return <>{children}</>;
};