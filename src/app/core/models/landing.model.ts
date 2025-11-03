/**
 * Models for the landing page/homepage
 */

export interface Category {
  id: string | number;
  name: string;
  slug: string;
  icon?: string;
  imageUrl?: string;
  count?: number;
}

export interface ProductDeal {
  id: number;
  name: string;
  regularPrice: string;
  salePrice: string;
  discount: string;
  savings: string;
  imageUrl: string;
  slug: string;
  featured?: boolean;
}

export interface BrandShowcase {
  id: string;
  name: string;
  logo?: string;
  backgroundColor: string;
  textColor: string;
  discount: string;
  imageUrl?: string;
}

export interface DailyEssential {
  id: string;
  name: string;
  icon: string;
  discount: string;
  category: string;
}
