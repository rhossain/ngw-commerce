import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

// Settings response shape (partial; extend as needed)
export interface CommerceSettingsResponse {
  hero_slider_products: number[];
  hero_slider_order: number[];
  hero_slider_details: Array<{
    id: number;
    title: string;
    slug?: string;
    link?: string;
    thumbUrl?: string;
    price?: number | null;
    regularPrice?: number | null;
    salePrice?: number | null;
    discountPercent?: number | null;
    currency?: string;
    hasDiscount?: boolean;
    discountAmount?: number | null;
    currencySymbol?: string;
  }>; // Provided by plugin augment
  cache_version: number;
  updated_at: string;
  schema_version?: number; // used to force refetch when structure changes
  component_settings?: ComponentSettings;
}

// Component settings interfaces
export interface CategoryProductsConfig {
  categoryId?: number;
  displayStyle: 'carousel' | 'grid' | 'list';
  limit: number;
  carouselAutoplay: boolean;
  carouselDelay: number;
  carouselLoop: boolean;
  carouselSlidesPerView: number;
  carouselSpaceBetween: number;
  gridColumns: number;
  sortBy: 'date' | 'popularity' | 'rating' | 'price';
  sortOrder: 'asc' | 'desc';
  showViewAll: boolean;
  showOnSaleOnly: boolean;
  showFeaturedOnly: boolean;
  carouselNavigation: boolean;
  carouselPagination: boolean;
}

export interface CategoriesDisplayConfig {
  displayStyle: 'flat-list' | 'masonry-grid' | 'carousel';
  size: 'sm' | 'md' | 'lg' | 'xl';
  showTitle: boolean;
  showViewAll: boolean;
  showCount: boolean;
  enableHover: boolean;
  cardStyle: 'minimal' | 'elevated' | 'bordered';
  gridColumns: { mobile: number; tablet: number; desktop: number };
  gridGap: number;
  carouselSlidesPerView: string | number;
  carouselSpaceBetween: number;
  carouselLoop: boolean;
  carouselAutoplay: boolean;
  carouselNavigation: boolean;
  carouselPagination: boolean;
}

export interface ComponentSettings {
  category_products_sections?: CategoryProductsConfig[];
  categories_display?: CategoriesDisplayConfig;
}

// Category interface for categories endpoint
export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  imageUrl?: string | null;
  link: string;
}

export interface HeroBannerSlide {
  id: string; // Use product id as string for compatibility
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  externalLink?: string; // original WP permalink if needed
  active?: boolean;
  price?: number | null;
  regularPrice?: number | null;
  salePrice?: number | null;
  discountPercent?: number | null;
  hasDiscount?: boolean;
  discountAmount?: number | null;
  currency?: string;
  currencySymbol?: string;
}

@Injectable({ providedIn: 'root' })
export class CommerceSettingsService {
  private settingsCache: CommerceSettingsResponse | null = null;
  private etag: string | null = null;
  private lastFetchTs = 0;
  private readonly STALE_MS = 60_000; // 1 minute client-side staleness window

  constructor(private http: HttpClient) {}

  /** Fetch settings with client-side + server ETag caching */
  fetchSettings(force = false): Observable<CommerceSettingsResponse> {
    if (!force && this.settingsCache && (Date.now() - this.lastFetchTs) < this.STALE_MS) {
      return of(this.settingsCache);
    }
    const headers = this.etag ? new HttpHeaders({ 'If-None-Match': this.etag }) : new HttpHeaders();
    return this.http.get<CommerceSettingsResponse>(`${environment.apiUrl}/ngw/v1/settings`, { observe: 'response', headers })
      .pipe(
        map(resp => {
          const newEtag = resp.headers.get('ETag');
          if (newEtag) this.etag = newEtag.replace(/"/g, '');
          const body = resp.body as CommerceSettingsResponse;
          return body;
        }),
        tap(body => {
          this.settingsCache = body;
          this.lastFetchTs = Date.now();
        }),
        catchError(err => {
          // 304 Not Modified path handled here (no body) - reuse cache
          if (err.status === 304 && this.settingsCache) {
            return of(this.settingsCache);
          }
          return throwError(() => err);
        })
      );
  }

  /** Convert plugin hero details to HeroBannerSlide array for component */
  mapHeroSlides(settings: CommerceSettingsResponse): HeroBannerSlide[] {
    const ordered = (settings.hero_slider_order && settings.hero_slider_order.length
      ? settings.hero_slider_order
      : (settings.hero_slider_products || []))
      .map(id => Number(id)); // normalize to numbers

    const detailsIndex = new Map<number, CommerceSettingsResponse['hero_slider_details'][number]>();
    (settings.hero_slider_details || []).forEach(d => {
      const key = Number(d.id);
      detailsIndex.set(key, d);
    });

    // If details missing entirely, return empty array so caller can fallback.
    if (!detailsIndex.size) {
      return [];
    }

    const decodeSymbol = (sym?: string): string | undefined => {
      if (!sym) return undefined;
      // Replace common HTML entities manually (Angular already escapes interpolation)
      return sym
        .replace(/&nbsp;/gi, ' ') // non-breaking space
        .replace(/&#(\d+);/g, (_, dec) => {
          const code = parseInt(dec, 10);
            return String.fromCharCode(code);
        })
        .trim();
    };
    return ordered.map((id, i) => {
      const det = detailsIndex.get(Number(id));
      const title = (det && det.title) ? det.title : `Product #${id}`;
      const regular = det?.regularPrice ?? null;
      const rawSale = det?.salePrice ?? null;
      const basePrice = det?.price ?? null; // Woo _price (effective)
      // Determine sale price only if truly discounted vs regular.
      const sale = (rawSale != null && regular != null && rawSale < regular) ? rawSale : null;
      // Effective display price: prefer sale, then base _price, then regular.
      const effectivePrice = sale ?? basePrice ?? regular ?? null;
      // Discount percent: prefer provided; else compute (regular - sale)/regular.
      let discountPercent = (det?.discountPercent != null && det.discountPercent! > 0) ? det.discountPercent : null;
      if (!discountPercent && regular && sale && regular > 0) {
        discountPercent = Math.round(((regular - sale) / regular) * 100);
      }
      const hasDiscount = !!(discountPercent && discountPercent > 0);
      const discountAmount = hasDiscount && regular && sale ? (regular - sale) : null;
      const currency = det?.currency || 'USD';
  const currencySymbol = decodeSymbol(det?.currencySymbol);
      const internalLink = det?.slug ? `/products/${det.slug}` : `/products/${id}`;
      return {
        id: String(id),
        title,
        subtitle: undefined,
        description: title,
        imageUrl: det?.thumbUrl || undefined,
        ctaText: 'View',
        ctaLink: internalLink,
        externalLink: det?.link,
        active: i === 0,
        price: effectivePrice,
        regularPrice: regular,
        salePrice: sale,
        discountPercent: discountPercent ?? null,
        hasDiscount,
        discountAmount,
        currency,
        currencySymbol
      };
    });
  }

  /** Get array of category products sections from WordPress settings */
  getCategoryProductsSections(): CategoryProductsConfig[] {
    if (!this.settingsCache || !this.settingsCache.component_settings) {
      return [];
    }
    const comp = this.settingsCache.component_settings as any;
    // Preferred: array of sections
    if (Array.isArray(comp.category_products_sections) && comp.category_products_sections.length) {
      return comp.category_products_sections.map((s: any) => this.normalizeCategorySection(s));
    }
    // Handle object-form sections (from WP options serialization with keyed indices)
    if (comp.category_products_sections && typeof comp.category_products_sections === 'object') {
      const obj = comp.category_products_sections as Record<string, any>;
      const keys = Object.keys(obj).filter(k => k !== '__INDEX__');
      // Sort numeric-like keys ascending to preserve visual order
      keys.sort((a,b) => (parseInt(a,10)||0) - (parseInt(b,10)||0));
      const normalized = keys.map(k => this.normalizeCategorySection(obj[k]))
        .filter(s => (s.categoryId ?? 0) > 0);
      if (normalized.length) return normalized;
    }
    // Fallback (legacy): single object under `category_products`
    if (comp.category_products && typeof comp.category_products === 'object') {
      return [this.normalizeCategorySection(comp.category_products)];
    }
    return [];
  }

  /** Get categories display configuration from WordPress settings */
  getCategoriesDisplayConfig(): CategoriesDisplayConfig | null {
    if (!this.settingsCache || !this.settingsCache.component_settings) {
      return null;
    }
    const raw = this.settingsCache.component_settings.categories_display;
    if (!raw) {
      return null;
    }
    return this.normalizeCategoriesDisplayConfig(raw);
  }

  /** Fetch top categories from WordPress */
  fetchTopCategories(perPage: number = 10): Observable<any[]> {
    const params = { per_page: perPage, hide_empty: true, orderby: 'count', order: 'DESC' };
    return this.http.get<WPCategory[]>(`${environment.apiUrl}/ngw/v1/categories`, { params })
      .pipe(
        map(categories => categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          count: cat.count,
          imageUrl: cat.imageUrl,
          link: `/products?category=${cat.slug}`
        }))),
        catchError(err => {
          console.error('[CommerceSettingsService] Failed to fetch categories', err);
          return throwError(() => err);
        })
      );
  }

  /** Normalize categories display config values (strings -> proper types) */
  private normalizeCategoriesDisplayConfig(raw: any): CategoriesDisplayConfig {
    const toNum = (v: any, def: number) => {
      const n = Number(v);
      return Number.isFinite(n) && !Number.isNaN(n) ? n : def;
    };
    const toBool = (v: any, def: boolean) => {
      if (typeof v === 'boolean') return v;
      if (v === '1' || v === 1) return true;
      if (v === '0' || v === 0) return false;
      return def;
    };
    
    const displayStyle = ['flat-list', 'masonry-grid', 'carousel'].includes(raw?.displayStyle) 
      ? raw.displayStyle : 'flat-list';
    const size = ['sm', 'md', 'lg', 'xl'].includes(raw?.size) ? raw.size : 'md';
    const cardStyle = ['minimal', 'elevated', 'bordered'].includes(raw?.cardStyle) 
      ? raw.cardStyle : 'elevated';
    
    // Handle gridColumns (can be object with string values)
    const gridCols = raw?.gridColumns || {};
    const gridColumns = {
      mobile: toNum(gridCols.mobile, 3),
      tablet: toNum(gridCols.tablet, 4),
      desktop: toNum(gridCols.desktop, 7)
    };
    
    // Handle carouselSlidesPerView (can be 'auto' or number)
    let carouselSlidesPerView: string | number = 'auto';
    if (raw?.carouselSlidesPerView === 'auto') {
      carouselSlidesPerView = 'auto';
    } else if (raw?.carouselSlidesPerView) {
      const num = toNum(raw.carouselSlidesPerView, 0);
      carouselSlidesPerView = num > 0 ? num : 'auto';
    }
    
    return {
      displayStyle,
      size,
      showTitle: toBool(raw?.showTitle, true),
      showViewAll: toBool(raw?.showViewAll, true),
      showCount: toBool(raw?.showCount, false),
      enableHover: toBool(raw?.enableHover, true),
      cardStyle,
      gridColumns,
      gridGap: toNum(raw?.gridGap, 24),
      carouselSlidesPerView,
      carouselSpaceBetween: toNum(raw?.carouselSpaceBetween, 20),
      carouselLoop: toBool(raw?.carouselLoop, false),
      carouselAutoplay: toBool(raw?.carouselAutoplay, false),
      carouselNavigation: toBool(raw?.carouselNavigation, true),
      carouselPagination: toBool(raw?.carouselPagination, true)
    };
  }

  /** Normalize section values coming from WordPress (strings -> numbers/booleans) */
  private normalizeCategorySection(raw: any): CategoryProductsConfig {
    const toNum = (v: any, def: number) => {
      const n = Number(v);
      return Number.isFinite(n) && !Number.isNaN(n) ? n : def;
    };
    const toBool = (v: any, def: boolean) => {
      if (typeof v === 'boolean') return v;
      if (v === '1' || v === 1) return true;
      if (v === '0' || v === 0) return false;
      return def;
    };
    const display = ['carousel','grid','list'].includes(raw?.displayStyle) ? raw.displayStyle : 'grid';
    const sortBy = ['date','popularity','rating','price'].includes(raw?.sortBy) ? raw.sortBy : 'date';
    const sortOrder: 'asc' | 'desc' = raw?.sortOrder === 'asc' ? 'asc' : 'desc';
    return {
      categoryId: toNum(raw?.categoryId, 0),
      displayStyle: display,
      limit: toNum(raw?.limit, 8),
      carouselAutoplay: toBool(raw?.carouselAutoplay, false),
      carouselDelay: toNum(raw?.carouselDelay, 3000),
      carouselLoop: toBool(raw?.carouselLoop, true),
      carouselSlidesPerView: toNum(raw?.carouselSlidesPerView, 4),
      carouselSpaceBetween: toNum(raw?.carouselSpaceBetween, 20),
      gridColumns: toNum(raw?.gridColumns, 4),
      sortBy,
      sortOrder,
      showViewAll: toBool(raw?.showViewAll, true),
      showOnSaleOnly: toBool(raw?.showOnSaleOnly, false),
      showFeaturedOnly: toBool(raw?.showFeaturedOnly, false),
      carouselNavigation: toBool(raw?.carouselNavigation, true),
      carouselPagination: toBool(raw?.carouselPagination, true)
    };
  }
}
