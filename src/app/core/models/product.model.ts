export interface Product {
weight: any;
dimensions: any;
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: 'simple' | 'variable' | 'grouped' | 'external';
  status: string;
  featured: boolean;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  price_html: string;
  on_sale: boolean;
  purchasable: boolean;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number | null;
  manage_stock: boolean;
  average_rating: string;
  rating_count: number;
  review_count: number;
  categories: ProductCategory[];
  tags: ProductTag[];
  images: ProductImage[];
  attributes: ProductAttribute[];
  variations: ProductVariation[];
  related_ids: number[];
  upsell_ids: number[];
  cross_sell_ids: number[];
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  count: number;
}

export interface ProductTag {
  id: number;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: number;
  src: string;
  name: string;
  alt: string;
  position: number;
}

export interface ProductAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface ProductVariation {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: string;
  stock_quantity: number | null;
  manage_stock: boolean;
  image: ProductImage | null;
  attributes: { [key: string]: string };
  purchasable: boolean;
}

export interface ProductSearchParams {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  stock_status?: string;
  on_sale?: boolean;
  featured?: boolean;
  min_rating?: number;
  orderby?: 'price' | 'price-desc' | 'rating' | 'popularity' | 'date';
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface ProductSearchResponse {
  success: boolean;
  products: Product[];
  total: number;
  pages: number;
  current_page: number;
}