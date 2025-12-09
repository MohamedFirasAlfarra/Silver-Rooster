// hooks/useProductsOptimized.ts
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';

// ذاكرة تخزين عالمية للمنتجات
let globalProductsCache: Product[] = [];
let globalCacheTimestamp = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 دقيقة

interface UseProductsOptimizedOptions {
  onProductLoaded?: (product: Product) => void;
  onAllProductsLoaded?: (products: Product[]) => void;
}

export const useProductsOptimized = (options?: UseProductsOptimizedOptions) => {
  const [products, setProducts] = useState<Product[]>(globalProductsCache);
  const [isLoading, setIsLoading] = useState(!globalProductsCache.length);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // دالة جلب المنتجات بسرعة وبطريقة متوازية
  const fetchProductsParallel = async (signal: AbortSignal) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    
    try {
      console.log('🚀 بدء جلب المنتجات المتوازي...');
      
      // جلب كل المنتجات دفعة واحدة ولكن مع تحديث فوري
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .eq('is_deleted', false);
      
      if (error) throw error;
      
      console.log(`✅ تم جلب ${data?.length || 0} منتج`);
      
      // تحديث الذاكرة العالمية
      globalProductsCache = data as Product[];
      globalCacheTimestamp = Date.now();
      
      // إعادة المنتجات للدالة الرئيسية
      return data as Product[];
      
    } catch (err) {
      console.error('❌ خطأ في جلب المنتجات:', err);
      throw err;
    } finally {
      isFetchingRef.current = false;
    }
  };

  // دالة تحميل المنتجات مع عرض فوري
  const loadProductsWithStreaming = async () => {
    if (globalProductsCache.length > 0) {
      setProducts(globalProductsCache);
      setIsLoading(false);
      options?.onAllProductsLoaded?.(globalProductsCache);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // إلغاء أي طلب سابق
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      console.log('🚀 بدء جلب المنتجات مع العرض الفوري...');
      const startTime = Date.now();

      // جلب المنتجات دفعة واحدة
      const allProducts = await fetchProductsParallel(signal);
      
      if (signal.aborted) return;

      // حساب الوقت المستغرق
      const elapsedTime = Date.now() - startTime;
      console.log(`⏱️ وقت الجلب: ${elapsedTime}ms`);

      if (allProducts && allProducts.length > 0) {
        // عرض المنتجات فوراً عند وصولها
        setProducts(allProducts);
        options?.onAllProductsLoaded?.(allProducts);
        setProgress(100);
      }

      setIsLoading(false);
      setHasMore(false);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('تم إلغاء الطلب');
        return;
      }
      console.error('❌ خطأ في جلب المنتجات:', err);
      setError(err);
      setIsLoading(false);
    }
  };

  // إعادة تحميل المنتجات
  const refetch = async () => {
    globalProductsCache = [];
    globalCacheTimestamp = 0;
    await loadProductsWithStreaming();
  };

  // جلب المنتجات عند التحميل الأول
  useEffect(() => {
    // التحقق من صلاحية الكاش
    const isCacheValid = globalProductsCache.length > 0 && 
                        Date.now() - globalCacheTimestamp < CACHE_DURATION;
    
    if (isCacheValid) {
      setProducts(globalProductsCache);
      setIsLoading(false);
      options?.onAllProductsLoaded?.(globalProductsCache);
    } else {
      loadProductsWithStreaming();
    }

    // تنظيف عند إلغاء المكون
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // تحديث الذاكرة العالمية عند تغيير المنتجات
  useEffect(() => {
    if (products.length > 0 && products !== globalProductsCache) {
      globalProductsCache = [...products];
      globalCacheTimestamp = Date.now();
    }
  }, [products]);

  return {
    products,
    isLoading,
    error,
    refetch,
    progress,
    hasMore,
  };
};

// دالة مساعدة للوصول للمنتجات من أي مكان
export const getCachedProducts = (): Product[] => {
  return globalProductsCache;
};

// دالة مساعدة لمسح الكاش
export const clearProductsCache = (): void => {
  globalProductsCache = [];
  globalCacheTimestamp = 0;
};