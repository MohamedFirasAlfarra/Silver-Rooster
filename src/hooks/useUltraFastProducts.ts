import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { superFastCache } from '../lib/superFastCache';

interface Product {
  id: string;
  name: string;
  name_ar: string;
  price: number;
  image_url: string;
  category: string;
  category_ar: string;
  type?: string;
  type_ar?: string;
}

export const useUltraFastProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadProducts = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    
    try {
      setIsLoading(true);
      setError(null);
      setProgress(0);
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      console.time('⚡ Ultra Fast Product Load');
      
      setProgress(10);
      
      const cachedProducts = await superFastCache.get<Product[]>('products-all');
      
      if (cachedProducts && cachedProducts.length > 0) {
        console.log('✅ Using cached products:', cachedProducts.length);
        setProducts(cachedProducts);
        setProgress(100);
        setInitialLoadComplete(true);
        
        setTimeout(() => fetchFreshData(), 500);
        return;
      }
      
      setProgress(30);
      
      const { data: basicProducts, error: basicError } = await supabase
        .from('products')
        .select('id, name, name_ar, price, image_url, category, category_ar, type, type_ar')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(12);
        
      if (basicError) throw basicError;
      
      if (basicProducts && basicProducts.length > 0) {
        setProducts(basicProducts);
        superFastCache.set('products-basic', basicProducts, 2);
        setInitialLoadComplete(true);
        setProgress(70);
        
        setTimeout(() => {
          setProducts(prev => {
            const newProducts = [...prev];
            fetchFreshData();
            return newProducts;
          });
        }, 100);
      }
      
      console.timeEnd('⚡ Ultra Fast Product Load');
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      console.error('❌ Product load error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
      setProgress(100);
    }
  };

  const fetchFreshData = async () => {
    try {
      const { data: fullProducts, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
        
      if (!error && fullProducts) {
        setProducts(fullProducts);
        superFastCache.set('products-all', fullProducts, 1);
        console.log('✅ Fresh products loaded in background:', fullProducts.length);
      }
    } catch (err) {
      console.warn('⚠️ Background fetch failed:', err);
    }
  };

  useEffect(() => {
    loadProducts();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    products,
    isLoading,
    error,
    progress,
    initialLoadComplete,
    refetch: loadProducts,
  };
};