import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Order, CartItem, Product } from '../types';

export const useOrders = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!userId,
  });
};

export const useOrder = (orderId: string | undefined) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data as Order;
    },
    enabled: !!orderId,
  });
};

interface CreateOrderParams {
  userId: string;
  cartItems: { id: string; product_id: string; quantity: number; product: Product }[];
  deliveryData: {
    address: string;
    deliveryLocation: string;
    governorate: string;
    notes: string;
    deliveryType: 'pickup' | 'delivery';
    deliveryCost: number;
  };
  customerData: {
    name: string;
    phone: string;
  };
  totalAmount: number;
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, cartItems, deliveryData, customerData, totalAmount }: CreateOrderParams) => {
      // 1. Create the Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: userId,
          customer_name: customerData.name,
          customer_phone: customerData.phone,
          total_amount: totalAmount,
          status: 'pending',
          delivery_address: deliveryData.address,
          delivery_location: deliveryData.deliveryLocation,
          governorate: deliveryData.governorate,
          notes: deliveryData.notes,
          delivery_type: deliveryData.deliveryType,
          delivery_cost: deliveryData.deliveryCost
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Clear Cart
      const { error: clearError } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId);

      if (clearError) throw clearError;

      return order;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['cart', variables.userId] });
    },
  });
};

// Admin Hooks
export const useAdminOrders = () => {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] }); // Also update user's view
    },
  });
};
