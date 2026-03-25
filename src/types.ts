export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  image_url: string;
  additional_images?: string[];
  videos?: string[];
  category_id: number;
  category_name?: string;
  stock: number;
  is_featured: boolean;
}

export interface Category {
  id: number;
  name: string;
  image_url?: string;
  parent_id: number | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
}

export interface CartItem extends Product {
  quantity: number;
}
