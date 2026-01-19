import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../store/app.state';
import * as ProductSelectors from '../../store/selectors/product.selectors';
import { Category, BrandShowcase, DailyEssential } from '../../core/models/landing.model';
import { CategoryProductsComponent } from '../../shared/components/category-products/category-products.component';
import { HeroBannerComponent } from '../../shared/components/hero-banner/hero-banner.component';
import { HeroSlide } from '../../shared/components/hero-banner/hero-banner.model';
import { CommerceSettingsService, HeroBannerSlide } from '../../core/services/commerce-settings.service';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { CategoriesDisplayComponent } from '../../shared/components/categories-display/categories-display.component';
import { CategoryDisplay } from '../../shared/components/categories-display/categories-display.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CategoryProductsComponent, HeroBannerComponent, CategoriesDisplayComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loading$: Observable<boolean>;

  // Dynamic hero slides from plugin settings
  heroSlides: HeroSlide[] = [];
  heroLoading = true;
  heroError: string | null = null;

  // Category products sections from WordPress
  categoryProductsSections: any[] = [];

  // Top Categories - will be loaded from WordPress
  topCategories: CategoryDisplay[] = [];
  topCategoriesLoading = true;

  // Electronics Brands
  electronicsBrands: BrandShowcase[] = [
    {
      id: 'iphone',
      name: 'iPhone',
      backgroundColor: 'from-gray-800 to-gray-900',
      textColor: 'text-white',
      discount: 'UP to 80% OFF'
    },
    {
      id: 'realme',
      name: 'realme',
      backgroundColor: 'bg-yellow-100',
      textColor: 'text-gray-900',
      discount: 'UP to 80% OFF'
    },
    {
      id: 'xiaomi',
      name: 'Xiaomi',
      backgroundColor: 'bg-orange-50',
      textColor: 'text-gray-900',
      discount: 'UP to 80% OFF'
    },
    {
      id: 'samsung',
      name: 'Samsung',
      backgroundColor: 'from-blue-400 to-blue-600',
      textColor: 'text-white',
      discount: 'UP to 80% OFF'
    }
  ];

  // Daily Essentials
  dailyEssentials: DailyEssential[] = [
    { id: '1', name: 'Daily Essentials', icon: 'fa-shopping-basket', discount: 'UP to 50% OFF', category: 'essentials' },
    { id: '2', name: 'Vegetables', icon: 'fa-carrot', discount: 'UP to 50% OFF', category: 'vegetables' },
    { id: '3', name: 'Fruits', icon: 'fa-apple-alt', discount: 'UP to 50% OFF', category: 'fruits' },
    { id: '4', name: 'Strawberry', icon: 'fa-seedling', discount: 'UP to 50% OFF', category: 'strawberry' },
    { id: '5', name: 'Mango', icon: 'fa-lemon', discount: 'UP to 50% OFF', category: 'mango' },
    { id: '6', name: 'Cherry', icon: 'fa-circle', discount: 'UP to 50% OFF', category: 'cherry' }
  ];

  constructor(private store: Store<AppState>, private settingsService: CommerceSettingsService) {
    this.loading$ = this.store.select(ProductSelectors.selectProductsLoading);
  }

  ngOnInit(): void {
    this.loadHeroSlides();
    this.loadTopCategories();
  }

  private loadTopCategories(): void {
    this.topCategoriesLoading = true;
    this.settingsService.fetchTopCategories(10)
      .pipe(finalize(() => this.topCategoriesLoading = false))
      .subscribe({
        next: categories => {
          this.topCategories = categories;
          console.log('[HomeComponent] Top Categories loaded:', categories.length, 'categories');
        },
        error: err => {
          console.error('[HomeComponent] Failed to load top categories', err);
          // Fallback to hardcoded categories if API fails
          this.topCategories = [
            { id: 1, name: 'Mobile', slug: 'mobile', icon: 'fa-mobile-alt' },
            { id: 2, name: 'Cosmetics', slug: 'cosmetics', icon: 'fa-pump-soap' },
            { id: 3, name: 'Electronics', slug: 'electronics', icon: 'fa-tv' },
            { id: 4, name: 'Furniture', slug: 'furniture', icon: 'fa-couch' },
            { id: 5, name: 'Watches', slug: 'watches', icon: 'fa-clock' },
            { id: 6, name: 'Decor', slug: 'decor', icon: 'fa-leaf' },
            { id: 7, name: 'Accessories', slug: 'accessories', icon: 'fa-gem' }
          ];
        }
      });
  }

  private loadHeroSlides(): void {
    this.heroLoading = true;
    this.heroError = null;
    this.settingsService.fetchSettings()
      .pipe(finalize(() => this.heroLoading = false))
      .subscribe({
        next: settings => {
          this.heroSlides = this.settingsService.mapHeroSlides(settings) as HeroBannerSlide[];
          if (!this.heroSlides.length) {
            // Fallback sample slides if no configuration available
            this.heroSlides = [
              { id: 'fallback-1', title: 'Welcome to MegaMart', description: 'Configure hero slides in admin.', active: true },
              { id: 'fallback-2', title: 'Add Products', description: 'Select hero products in WP Admin.', active: false }
            ];
          }
          
          // Load category products sections
          this.categoryProductsSections = this.settingsService.getCategoryProductsSections();
          console.log('[HomeComponent] Category Products Sections:', this.categoryProductsSections);
        },
        error: err => {
          console.error('[HomeComponent] Hero settings fetch failed', err);
          this.heroError = 'Failed loading hero content.';
          // Provide minimal fallback
          this.heroSlides = [ { id: 'error', title: 'Hero Unavailable', description: 'Retry later', active: true } ];
        }
      });
  }

  getCategoryLink(slug: string): string {
    return `/products?category=${slug}`;
  }

  getBrandLink(brandSlug: string): string {
    return `/products?brand=${brandSlug}`;
  }

  getProductLink(slug: string): string {
    return `/products/${slug}`;
  }
}
