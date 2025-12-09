// hooks/useProductsInfinite.ts
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';

const PAGE_SIZE = 20; // عدد المنتجات في كل صفحة

export const useProductsInfinite = () => {
  const queryClient = useQueryClient();
  
  return useInfiniteQuery({
    queryKey: ['products-infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      console.log(`🔍 جلب الصفحة ${pageParam + 1}...`);
      
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .eq('is_deleted', false)
        .range(from, to);
        
      if (error) {
        console.error('❌ خطأ في جلب المنتجات:', error);
        throw error;
      }
      
      console.log(`✅ تم جلب ${data?.length || 0} منتج`);
      
      return {
        products: data as Product[],
        nextPage: data && data.length === PAGE_SIZE ? pageParam + 1 : undefined,
        total: count || 0
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30 * 60 * 1000, // 30 دقيقة
    gcTime: 60 * 60 * 1000, // 60 دقيقة
  });
};

// دالة لتحميل جميع المنتجات في الخلفية
export const prefetchAllProducts = async () => {
  const queryClient = useQueryClient();
  
  try {
    console.log('🚀 بدء التحميل المسبق لجميع المنتجات...');
    
    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .eq('is_deleted', false);
      
    if (error) throw error;
    
    console.log(`✅ تم تحميل ${data?.length || 0} منتج مسبقاً`);
    
    // تخزين البيانات في cache
    queryClient.setQueryData(['products-all'], data || []);
    
    return data as Product[];
  } catch (error) {
    console.error('❌ خطأ في التحميل المسبق:', error);
    return [];
  }
};

// دالة للحصول على جميع المنتجات المخزنة مؤقتاً
export const getCachedProducts = () => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<Product[]>(['products-all']) || [];
};