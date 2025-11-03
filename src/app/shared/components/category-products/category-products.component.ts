import { Component, Input, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { register } from 'swiper/element/bundle';

// Register Swiper web components
register();

export type DisplayStyle = 'carousel' | 'grid' | 'list';

@Component({
  selector: 'app-category-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductCardComponent,
    LoadingSpinnerComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './category-products.component.html',
  styleUrls: ['./category-products.component.css']
})
export class CategoryProductsComponent implements OnInit, OnDestroy {
  // Required inputs
  @Input() categoryId!: number;
  
  // Optional configuration inputs
  @Input() displayStyle: DisplayStyle = 'grid';
  @Input() limit: number = 8;
  @Input() heading: string = '';
  @Input() showViewAll: boolean = true;
  @Input() viewAllRoute: string = '/shop';
  
  // Grid specific options
  @Input() gridColumns: number = 4; // Desktop columns
  @Input() tabletColumns: number = 3; // Tablet columns
  @Input() mobileColumns: number = 2; // Mobile columns
  
  // Carousel specific options
  @Input() carouselAutoplay: boolean = false;
  @Input() carouselDelay: number = 3000;
  @Input() carouselLoop: boolean = true;
  @Input() carouselSlidesPerView: number = 4;
  @Input() carouselSpaceBetween: number = 20;
  
  // List specific options
  @Input() listCompact: boolean = false;
  
  // Advanced options
  @Input() sortBy: 'date' | 'popularity' | 'rating' | 'price' = 'date';
  @Input() sortOrder: 'asc' | 'desc' = 'desc';
  @Input() showOnSaleOnly: boolean = false;
  @Input() showFeaturedOnly: boolean = false;
  
  // Loading and error states
  products: Product[] = [];
  loading: boolean = true;
  error: string | null = null;
  categoryName: string = '';
  
  private destroy$ = new Subject<void>();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    if (!this.categoryId) {
      this.error = 'Category ID is required';
      this.loading = false;
      return;
    }

    this.loadProducts();
    this.loadCategoryName();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProducts(): void {
    this.loading = true;
    this.error = null;

    const params: any = {
      category: this.categoryId.toString(),
      per_page: this.limit,
      orderby: this.sortBy,
      order: this.sortOrder,
      status: 'publish'
    };

    if (this.showOnSaleOnly) {
      params.on_sale = true;
    }

    if (this.showFeaturedOnly) {
      params.featured = true;
    }

    this.productService.searchProducts(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.products = response.products || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.error = 'Failed to load products. Please try again later.';
          this.loading = false;
        }
      });
  }

  private loadCategoryName(): void {
    if (!this.heading) {
      this.productService.getCategoryById(this.categoryId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (category) => {
            this.categoryName = category.name;
          },
          error: (error) => {
            console.error('Error loading category name:', error);
          }
        });
    }
  }

  getDisplayHeading(): string {
    return this.heading || this.categoryName || 'Products';
  }

  getViewAllLink(): string {
    return `${this.viewAllRoute}?category=${this.categoryId}`;
  }

  // Grid layout classes
  getGridClasses(): string {
    const baseClasses = 'grid gap-6';
    const colClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6'
    };
    
    const columnClass = colClasses[this.gridColumns as keyof typeof colClasses] || colClasses[4];
    return `${baseClasses} ${columnClass}`;
  }

  // Carousel configuration
  getSwiperConfig(): any {
    return {
      slidesPerView: 1,
      spaceBetween: this.carouselSpaceBetween,
      loop: this.carouselLoop,
      autoplay: this.carouselAutoplay ? {
        delay: this.carouselDelay,
        disableOnInteraction: false,
      } : false,
      navigation: true,
      pagination: {
        clickable: true,
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 15,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: this.carouselSlidesPerView,
          spaceBetween: this.carouselSpaceBetween,
        },
      },
    };
  }

  // Get carousel breakpoints as JSON string for swiper-container
  getCarouselBreakpoints(): string {
    return JSON.stringify({
      640: { slidesPerView: 2, spaceBetween: 15 },
      768: { slidesPerView: 3, spaceBetween: 20 },
      1024: { slidesPerView: this.carouselSlidesPerView, spaceBetween: this.carouselSpaceBetween }
    });
  }

  // Get carousel autoplay config as JSON string
  getCarouselAutoplay(): string | boolean {
    if (!this.carouselAutoplay) {
      return 'false';
    }
    return JSON.stringify({ 
      delay: this.carouselDelay, 
      disableOnInteraction: false 
    });
  }

  // Get carousel pagination config as JSON string
  getCarouselPagination(): string {
    return JSON.stringify({ clickable: true });
  }

  // List layout classes
  getListClasses(): string {
    return this.listCompact 
      ? 'space-y-4' 
      : 'space-y-6';
  }

  // Reload products (can be called externally if needed)
  reload(): void {
    this.loadProducts();
  }

  // Track by function for *ngFor performance
  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}
