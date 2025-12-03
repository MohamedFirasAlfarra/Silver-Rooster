import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('🔍 جلب المنتجات من Supabase...');
      
      const { data, error, count } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .eq('is_deleted', false); // فقط المنتجات غير المحذوفة
        
      if (error) {
        console.error('❌ خطأ في جلب المنتجات:', error);
        throw error;
      }
      
      console.log(`✅ تم جلب ${data?.length || 0} منتج`);
      return data as Product[];
    },
    retry: 1, // إعادة المحاولة مرة واحدة فقط
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 دقائق
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.id] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};