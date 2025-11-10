export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string; // made optional to support dynamic plugin mapping
  description?: string; // optional for fallback/error slides
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  active?: boolean;
  price?: number | null; // current price (sale if applicable)
  regularPrice?: number | null; // original price before discount
  salePrice?: number | null; // sale price if lower than regular
  discountPercent?: number | null; // computed discount percent
  currency?: string; // store currency code
  hasDiscount?: boolean; // convenience boolean
  discountAmount?: number | null; // regular - sale when discounted
  currencySymbol?: string; // store currency symbol for display
}
