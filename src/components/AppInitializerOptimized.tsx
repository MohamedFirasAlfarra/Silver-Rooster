import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/useAuthStore';
import { supabaseKeepAlive } from '../services/supabaseKeepAlive';
import { supabase } from '../lib/supabaseClient';

export const AppInitializerOptimized: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { updateLastActivity } = useAuthStore();
  const [initialized, setInitialized] = useState(false);
  const [initProgress, setInitProgress] = useState(0);
  const [initMessage, setInitMessage] = useState('جاري تحميل التطبيق...');

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      if (!isMounted) return;

      try {
        setInitMessage('🚀 بدء تشغيل التطبيق...');
        setInitProgress(10);

        supabaseKeepAlive.start();
        await new Promise(resolve => setTimeout(resolve, 50));

        setInitMessage('🔐 جارٍ التحقق من المصادقة...');
        setInitProgress(20);
        
        updateLastActivity();

        setInitMessage('📦 جارٍ تحميل البيانات...');
        setInitProgress(30);

        const loadUserSession = async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              updateLastActivity();
            }
          } catch (error) {
            console.warn('⚠️ User session check skipped:', error);
          }
        };

        const preloadProducts = async () => {
          try {
            const { data, error } = await supabase
              .from('products')
              .select('id, name, name_ar, price, image_url')
              .eq('is_deleted', false)
              .limit(8)
              .order('created_at', { ascending: false });

            if (!error && data) {
              queryClient.setQueryData(['products-preview'], data);
              setInitMessage(`✅ تم تحميل ${data.length} منتج أولي`);
              setInitProgress(60);
            }
          } catch (error) {
            console.warn('⚠️ Initial products preload skipped:', error);
          }
        };

        await Promise.allSettled([loadUserSession(), preloadProducts()]);

        setInitProgress(90);
        await new Promise(resolve => setTimeout(resolve, 200));

        if (isMounted) {
          setInitProgress(100);
          setInitMessage('✅ التطبيق جاهز');
          
          setTimeout(() => {
            setInitialized(true);
          }, 300);
        }

      } catch (error) {
        console.error('❌ App initialization error:', error);
        if (isMounted) {
          setInitialized(true);
        }
      }
    };

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, [queryClient, updateLastActivity]);

  if (!initialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="text-center max-w-md px-6">
          <div className="relative mx-auto mb-6">
            <div className="w-24 h-24 border-4 border-primary/10 rounded-full"></div>
            <div 
              className="absolute top-0 left-0 w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin"
              style={{ animationDuration: '1.2s' }}
            ></div>
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-3">
            {initMessage}
          </h2>
          
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${initProgress}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            التحميل: {initProgress}%
            {initProgress > 30 && initProgress < 80 && (
              <span className="mr-2"> • جارٍ تحميل المنتجات...</span>
            )}
          </p>
          
          {initProgress < 50 && (
            <p className="text-xs text-muted-foreground mt-4">
              هذا التحميل الأولي قد يستغرق بضع ثواني فقط
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};