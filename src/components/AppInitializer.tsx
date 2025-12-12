// components/AppInitializer.tsx
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/useAuthStore';
import { checkSupabaseConnection } from '../lib/supabaseClient';

export const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { updateLastActivity } = useAuthStore();

  useEffect(() => {
    updateLastActivity();
    const prefetchProducts = async () => {
      try {
        const { supabase } = await import('../lib/supabaseClient');
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          queryClient.setQueryData(['products-all'], data);
          console.log( data.length);
        }
      } catch (error) {
        console.error( error);
      }
    };

    // تحقق من اتصال Supabase
    const checkConnection = async () => {
      const { connected } = await checkSupabaseConnection();
      if (!connected) {
      } else {
        prefetchProducts();
      }
    };

    checkConnection();
    const interval = setInterval(() => {
      prefetchProducts();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [queryClient, updateLastActivity]);

  return <>{children}</>;
};