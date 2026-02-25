export interface Product {
  id: string;
  name: string;
  format: 'Cápsulas' | 'Polvo' | 'Gotero';
  specs: string;
  category: string;
  price: number;
  image: string;
  badge?: string;
  focus: string;
  benefits: string[];
  usage: string;
  ingredients: string;
}

export interface Pack {
  id: string;
  name: string;
  products: string[];
  price: number;
  image: string;
  description: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  packId?: string;
}

export interface Order {
  id: string;
  date: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_method: 'Envío' | 'Retiro';
  address?: string;
  items: any[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'Nuevo' | 'Contactado' | 'Pagado' | 'Enviado' | 'Cancelado';
  notes?: string;
}

export interface Settings {
  whatsapp_number: string;
  currency: string;
  shipping_fee: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'sales' | 'viewer';
  status: 'pending' | 'approved' | 'rejected';
}

export interface Promo {
  id?: number;
  title: string;
  description: string;
  code: string;
  discount: string;
  active: number;
}

export interface Lead {
  id: string;
  created_at: string;
  name?: string;
  phone?: string;
  email?: string;
  source: 'home' | 'checkout' | 'contact';
  interest?: string;
  status: 'Nuevo' | 'En seguimiento' | 'Cerrado ganado' | 'Cerrado perdido';
  assigned_to?: number;
}

export interface ActivityLog {
  id: number;
  lead_id?: string;
  order_id?: string;
  created_at: string;
  type: 'call' | 'whatsapp' | 'note' | 'status_change';
  outcome?: string;
  notes?: string;
  next_follow_up?: string;
  user_id: number;
}
