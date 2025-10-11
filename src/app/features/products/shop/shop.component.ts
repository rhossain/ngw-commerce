import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AppState } from '../../../store/app.state';
import * as ProductActions from '../../../store/actions/product.actions';
import * as ProductSelectors from '../../../store/selectors/product.selectors';
import { Product, ProductSearchParams, ProductCategory, ProductAttribute } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ProductService } from '../../../core/services/product.service';

interface ShopFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  featured?: boolean;
  rating?: number;
  attributes?: { [key: string]: string[] };
  orderby?: 'date' | 'popularity' | 'rating' | 'price' | 'price-desc';
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit, OnDestroy {
  products$: Observable<Product[]>;
  loading$: Observable<boolean>;
  pagination$: Observable<any>;
  
  // Math for template
  Math = Math;
  
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  // Filter state
  filters: ShopFilters = {
    orderby: 'date'
  };

  // Filter options
  categories: ProductCategory[] = [];
  loadingCategories = true;
  
  // Available product attributes (color, size, etc.)
  availableAttributes: { [key: string]: string[] } = {};
  selectedAttributes: { [key: string]: string[] } = {};
  
  // Price range
  minPrice = 0;
  maxPrice = 1000;
  priceMin = 0;
  priceMax = 1000;
  
  // UI state
  showMobileFilters = false;
  showFilters = true;
  
  // Sort options
  sortOptions = [
    { value: 'date', label: 'Newest First' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'price', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' }
  ];
  
  // Pagination
  currentPage = 1;
  perPage = 12;
  totalProducts = 0;
  totalPages = 0;
  
  // View mode
  viewMode: 'grid' | 'list' = 'grid';

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {
    this.products$ = this.store.select(ProductSelectors.selectAllProducts);
    this.loading$ = this.store.select(ProductSelectors.selectProductsLoading);
    this.pagination$ = this.store.select(ProductSelectors.selectProductsPagination);
  }

  ngOnInit(): void {
    // Load categories
    this.loadCategories();
    
    // Read filters from URL query params
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.initFiltersFromParams(params);
      this.loadProducts();
    });
    
    // Setup search debounce
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filters.search = searchTerm;
      this.currentPage = 1;
      this.updateUrlAndLoadProducts();
    });
    
    // Watch pagination changes
    this.pagination$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(pagination => {
      if (pagination) {
        this.totalProducts = pagination.total || 0;
        this.totalPages = pagination.pages || 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.filter(c => c.count > 0); // Only categories with products
        this.loadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loadingCategories = false;
      }
    });
  }

  initFiltersFromParams(params: any): void {
    this.filters.search = params['search'] || '';
    this.filters.category = params['category'] || '';
    this.filters.minPrice = params['min_price'] ? +params['min_price'] : undefined;
    this.filters.maxPrice = params['max_price'] ? +params['max_price'] : undefined;
    this.filters.inStock = params['in_stock'] === 'true';
    this.filters.onSale = params['on_sale'] === 'true';
    this.filters.featured = params['featured'] === 'true';
    this.filters.rating = params['rating'] ? +params['rating'] : undefined;
    this.filters.orderby = params['orderby'] || 'date';
    this.currentPage = params['page'] ? +params['page'] : 1;
    
    // Set price range inputs
    this.priceMin = this.filters.minPrice || 0;
    this.priceMax = this.filters.maxPrice || 1000;
  }

  loadProducts(): void {
    const params: ProductSearchParams = {
      page: this.currentPage,
      per_page: this.perPage,
      orderby: this.filters.orderby as any,
      order: this.filters.orderby === 'price-desc' ? 'desc' : 'asc'
    };
    
    if (this.filters.search) {
      params.search = this.filters.search;
    }
    
    if (this.filters.category) {
      // WooCommerce REST API expects a category ID (or comma-separated IDs), not a slug, for the 'category' param
      const catId = this.getCategoryIdFromSlug(this.filters.category);
      if (catId) {
        params.category = String(catId);
      } else {
        console.warn('[Shop] Category slug not found among loaded categories:', this.filters.category);
      }
    }
    
    if (this.filters.minPrice !== undefined) {
      params.min_price = this.filters.minPrice;
    }
    
    if (this.filters.maxPrice !== undefined) {
      params.max_price = this.filters.maxPrice;
    }
    
    if (this.filters.inStock) {
      params.stock_status = 'instock';
    }
    
    if (this.filters.onSale) {
      params.on_sale = true;
    }
    
    if (this.filters.featured) {
      params.featured = true;
    }
    
    this.store.dispatch(ProductActions.loadProducts({ params }));
  }

  updateUrlAndLoadProducts(): void {
    const queryParams: any = {
      page: this.currentPage
    };
    
    if (this.filters.search) queryParams.search = this.filters.search;
    if (this.filters.category) queryParams.category = this.filters.category;
    if (this.filters.minPrice) queryParams.min_price = this.filters.minPrice;
    if (this.filters.maxPrice) queryParams.max_price = this.filters.maxPrice;
    if (this.filters.inStock) queryParams.in_stock = 'true';
    if (this.filters.onSale) queryParams.on_sale = 'true';
    if (this.filters.featured) queryParams.featured = 'true';
    if (this.filters.rating) queryParams.rating = this.filters.rating;
    if (this.filters.orderby) queryParams.orderby = this.filters.orderby;
    
    // Replace the whole query params set so cleared filters (like category) are removed
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams
    });
  }

  // Filter actions
  onSearchChange(searchTerm: string): void {
    this.searchSubject$.next(searchTerm);
  }

  onCategoryChange(categorySlug: string): void {
    this.filters.category = categorySlug;
    this.currentPage = 1;
    this.updateUrlAndLoadProducts();
  }

  // New click handler used by link-style category buttons
  onCategoryClick(slug: string): void {
    this.onCategoryChange(slug);
    // Persist last chosen category (even empty string for All) for future visits
    try {
      if (slug) {
        localStorage.setItem('shop:lastCategory', slug);
      } else {
        localStorage.removeItem('shop:lastCategory');
      }
    } catch (e) {
      console.warn('[Shop] Unable to access localStorage for category persistence', e);
    }
  }

  onPriceRangeChange(): void {
    this.filters.minPrice = this.priceMin;
    this.filters.maxPrice = this.priceMax;
    this.currentPage = 1;
    this.updateUrlAndLoadProducts();
  }

  onInStockToggle(): void {
    this.filters.inStock = !this.filters.inStock;
    this.currentPage = 1;
    this.updateUrlAndLoadProducts();
  }

  onSaleToggle(): void {
    this.filters.onSale = !this.filters.onSale;
    this.currentPage = 1;
    this.updateUrlAndLoadProducts();
  }

  onFeaturedToggle(): void {
    this.filters.featured = !this.filters.featured;
    this.currentPage = 1;
    this.updateUrlAndLoadProducts();
  }

  onRatingFilter(rating: number): void {
    this.filters.rating = rating;
    this.currentPage = 1;
    this.updateUrlAndLoadProducts();
  }

  onSortChange(sortBy: string): void {
    this.filters.orderby = sortBy as any;
    this.currentPage = 1;
    this.updateUrlAndLoadProducts();
  }

  clearFilters(): void {
    this.filters = { orderby: 'date' };
    this.priceMin = 0;
    this.priceMax = 1000;
    this.selectedAttributes = {};
    this.currentPage = 1;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
    try { localStorage.removeItem('shop:lastCategory'); } catch {}
  }

  private getCategoryIdFromSlug(slug: string): number | undefined {
    return this.categories.find(c => c.slug === slug)?.id;
  }

  // Pagination
  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateUrlAndLoadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get visiblePages(): number[] {
    const maxVisible = 5;
    const halfVisible = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, this.currentPage - halfVisible);
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // UI toggles
  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  // Utility
  hasActiveFilters(): boolean {
    return !!(
      this.filters.search ||
      this.filters.category ||
      this.filters.minPrice ||
      this.filters.maxPrice ||
      this.filters.inStock ||
      this.filters.onSale ||
      this.filters.featured ||
      this.filters.rating
    );
  }

  // Aggregate total product count across categories (used for All Categories display)
  get totalCategoryCount(): number {
    return this.categories.reduce((sum, c) => sum + (c.count || 0), 0);
  }

  // After categories load, if no category in URL but last stored exists, apply it
  private applyPersistedCategoryIfNeeded(): void {
    if (this.filters.category) return; // URL already defines it
    try {
      const saved = localStorage.getItem('shop:lastCategory');
      if (saved && this.categories.some(c => c.slug === saved)) {
        this.filters.category = saved;
        this.currentPage = 1;
        // Do not push to URL immediately to avoid double loading; call update explicitly
        this.updateUrlAndLoadProducts();
      }
    } catch {}
  }
}
