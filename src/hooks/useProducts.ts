import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';
import { getCachedProducts, clearProductsCache } from './useProductsOptimized';

// ذاكرة تخزين محلية لهذا الهوك
let localCache: Product[] | null = null;

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('🔍 جلب المنتجات من Supabase...');
      
      // التحقق من الكاش العالمي أولاً
      const cachedProducts = getCachedProducts();
      if (cachedProducts.length > 0) {
        console.log('✅ استخدام المنتجات المخزنة في الذاكرة:', cachedProducts.length);
        return cachedProducts;
      }
      
      // التحقق من الكاش المحلي
      if (localCache && localCache.length > 0) {
        console.log('✅ استخدام المنتجات المخزنة محلياً:', localCache.length);
        return localCache;
      }
      
      // جلب البيانات من السيرفر
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .eq('is_deleted', false);
        
      if (error) {
        console.error('❌ خطأ في جلب المنتجات:', error);
        throw error;
      }
      
      console.log(`✅ تم جلب ${data?.length || 0} منتج`);
      
      // تحديث الكاش المحلي
      localCache = data as Product[];
      
      return data as Product[];
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30 * 60 * 1000, // 30 دقيقة
    gcTime: 60 * 60 * 1000, // 60 دقيقة
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('معرف المنتج مطلوب');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .single();
      
      if (error) {
        console.error('❌ خطأ في جلب المنتج:', error);
        throw error;
      }
      
      return data as Product;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: {
      name: string;
      name_ar: string;
      category: string;
      category_ar: string;
      type: string;
      type_ar: string;
      quantity: number;
      ingredients: string;
      ingredients_ar: string;
      description: string;
      description_ar: string;
      price: number;
      image_url: string;
    }) => {
      // التحقق من تسجيل الدخول
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) throw new Error('غير مصرح به');

      const product = {
        ...productData,
        seller_id: authUser.user.id,
      };

      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newProduct) => {
      // تحديث cache يدوياً
      queryClient.setQueryData<Product[]>(['products-all'], (oldData = []) => {
        return [newProduct, ...oldData];
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Product>) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (updatedProduct) => {
      // تحديث cache يدوياً
      queryClient.setQueryData<Product[]>(['products-all'], (oldData = []) => {
        return oldData.map(product => 
          product.id === updatedProduct.id ? updatedProduct : product
        );
      });
      queryClient.invalidateQueries({ queryKey: ['product', updatedProduct.id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .update({ is_deleted: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      // تحديث cache يدوياً
      queryClient.setQueryData<Product[]>(['products-all'], (oldData = []) => {
        return oldData.filter(product => product.id !== id);
      });
    },
  });
};