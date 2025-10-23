// Order domain model

export interface Order {
  id: string | number;
  order_key?: string;
  status: 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed';
  currency?: string;
  date_created?: string;
  date_modified?: string;
  discount_total?: string;
  discount_tax?: string;
  shipping_total?: string;
  shipping_tax?: string;
  cart_tax?: string;
  total?: string;
  total_tax?: string;
  customer_id?: number;
  billing?: BillingAddress;
  shipping?: ShippingAddress;
  payment_method?: string;
  payment_method_title?: string;
  transaction_id?: string;
  customer_ip_address?: string;
  customer_user_agent?: string;
  created_via?: string;
  customer_note?: string;
  date_completed?: string | null;
  date_paid?: string | null;
  line_items?: OrderLineItem[];
  tax_lines?: OrderTaxLine[];
  shipping_lines?: OrderShippingLine[];
  fee_lines?: OrderFeeLine[];
  coupon_lines?: OrderCouponLine[];
  meta_data?: OrderMetaData[];
  
  // Allow additional backend-provided fields
  [key: string]: any;
}

export interface BillingAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface OrderLineItem {
  id?: number;
  name: string;
  product_id: number;
  variation_id?: number;
  quantity: number;
  tax_class?: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes?: any[];
  meta_data?: OrderMetaData[];
  sku?: string;
  price?: string;
  image?: string;
}

export interface OrderTaxLine {
  id?: number;
  rate_code?: string;
  rate_id?: number;
  label?: string;
  compound?: boolean;
  tax_total: string;
  shipping_tax_total: string;
  meta_data?: OrderMetaData[];
}

export interface OrderShippingLine {
  id?: number;
  method_title: string;
  method_id: string;
  total: string;
  total_tax: string;
  taxes?: any[];
  meta_data?: OrderMetaData[];
}

export interface OrderFeeLine {
  id?: number;
  name: string;
  tax_class?: string;
  tax_status?: string;
  total: string;
  total_tax: string;
  taxes?: any[];
  meta_data?: OrderMetaData[];
}

export interface OrderCouponLine {
  id?: number;
  code: string;
  discount: string;
  discount_tax: string;
  meta_data?: OrderMetaData[];
}

export interface OrderMetaData {
  id?: number;
  key: string;
  value: any;
}

export interface CheckoutRequest {
  billing: BillingAddress;
  shipping: ShippingAddress;
  payment_method: string;
  shipping_method: any;
  order_comments?: string;
  line_items?: OrderLineItem[];
}

export interface CheckoutResponse {
  success: boolean;
  order_id?: number;
  order?: Order;
  message?: string;
  payment_result?: {
    result?: string;
    redirect_url?: string;
  };
}
