export interface Product {
  id: string;
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
  seller_id: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'guest';
  full_name?: string;
  age?: number;
  phone?: string;
  address?: string;
  telegram_chat_id?: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  delivery_address: string;
  delivery_location: string;
  governorate: string;
  notes: string;
  delivery_type: 'pickup' | 'delivery';
  delivery_cost: number;
  created_at: string;
  updated_at?: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  product?: Product;
}

export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';