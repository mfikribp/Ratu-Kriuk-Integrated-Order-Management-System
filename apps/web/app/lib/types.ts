export interface Product {
  id: string;
  sku: string;
  name: string;
  category?: string;
  description?: string;
  unit_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  city_region_postal_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  source: string;
  customer_id: string;
  order_date: string;
  status: string;
  product_total: number;
  shipping_cost: number;
  grand_total: number;
  notes?: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  subtotal: number;
}

export interface PackingOrder {
  id: string;
  order_number: string;
  customer_name: string;
  order_date: string;
  status: string;
  item_count: number;
  created_at: string;
}

export interface PackingItem {
  product_id: string;
  product_name: string;
  quantity: number;
  subtotal: number;
}

export interface PackingOrderDetail {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  order_date: string;
  status: string;
  items: PackingItem[];
  shipping_cost: number;
  grand_total: number;
}

export interface ProductionBatch {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  production_date: string;
  batch_code?: string;
  notes?: string;
  recorded_by: string;
  recorded_by_name: string;
  created_at: string;
}

export interface ImportResponse {
  job_id: string;
  total_rows: number;
  success_count: number;
  failed_count: number;
  duplicate_count: number;
  message: string;
}

export type Role = 'ADMIN' | 'EMPLOYEE_PACKING' | 'EMPLOYEE_PRODUCTION';

export const ORDER_STATUSES = [
  'Diproses',
  'Dikemas',
  'Dikirim',
  'Selesai',
  'Dibatalkan',
] as const;
