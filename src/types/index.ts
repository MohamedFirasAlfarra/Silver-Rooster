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
  role: 'user' | 'admin';
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
}

export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';
