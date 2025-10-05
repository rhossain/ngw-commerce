export interface CartItem {
  key: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  line_total: number;
  line_subtotal: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    regular_price: string;
    sale_price: string;
    image: string;
    permalink: string;
    sku: string;
    stock_status: string;
    manage_stock: boolean;
    stock_quantity: number | null;
  };
  variation: { [key: string]: string };
}

export interface Cart {
  cart_items: CartItem[];
  totals: CartTotals;
  coupons: string[];
  items_count: number;
  needs_shipping: boolean;
  needs_payment: boolean;
}

export interface CartTotals {
  subtotal: string;
  subtotal_tax: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_contents_total: string;
  cart_contents_tax: string;
  fee_total: string;
  fee_tax: string;
  total: string;
  total_tax: string;
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
  variation_id?: number;
  variation?: { [key: string]: string };
}