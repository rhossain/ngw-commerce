import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  CategoryDisplay, 
  CategoryDisplayStyle, 
  CategorySize,
  CategoryGridOptions,
  CategoryCarouselOptions
} from './categories-display.model';
import { CommerceSettingsService } from '../../../core/services/commerce-settings.service';

/**
 * CategoriesDisplayComponent
 * 
 * A reusable component for displaying categories in multiple styles:
 * - flat-list: Horizontal grid with circular icons (like Top Categories)
 * - masonry-grid: Responsive grid layout with cards
 * - carousel: Swiper-powered carousel with navigation
 * 
 * @example
 * ```html
 * <app-categories-display
 *   [categories]="topCategories"
 *   displayStyle="flat-list"
 *   [showTitle]="true"
 *   title="Top Categories"
 * ></app-categories-display>
 * ```
 */
@Component({
  selector: 'app-categories-display',
  standalone: true,
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './categories-display.component.html',
  styleUrl: './categories-display.component.css'
})
export class CategoriesDisplayComponent implements OnInit {
  /** Array of categories to display */
  @Input() categories: CategoryDisplay[] = [];

  /** WordPress settings flag */
  @Input() useWordPressSettings: boolean = false;

  /** Display style: 'flat-list' | 'masonry-grid' | 'carousel' */
  @Input() displayStyle: CategoryDisplayStyle = 'flat-list';

  /** Show section title and "View All" button */
  @Input() showTitle: boolean = true;

  /** Section title text */
  @Input() title: string = 'Categories';

  /** Title highlight text (wrapped in cyan color) */
  @Input() titleHighlight?: string;

  /** Show "View All" button */
  @Input() showViewAll: boolean = true;

  /** View All button link */
  @Input() viewAllLink: string = '/categories';

  /** Size of category items: 'sm' | 'md' | 'lg' | 'xl' */
  @Input() size: CategorySize = 'md';

  /** Grid layout options (for flat-list and masonry-grid) */
  @Input() gridOptions: CategoryGridOptions = {
    columns: { mobile: 3, tablet: 4, desktop: 7 },
    gap: 24
  };

  /** Carousel options (for carousel style) */
  @Input() carouselOptions: CategoryCarouselOptions = {
    slidesPerView: 'auto',
    spaceBetween: 20,
    loop: false,
    autoplay: false,
    autoplayDelay: 3000,
    navigation: true,
    pagination: true,
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 20 },
      768: { slidesPerView: 3, spaceBetween: 20 },
      1024: { slidesPerView: 5, spaceBetween: 20 },
      1280: { slidesPerView: 7, spaceBetween: 20 }
    }
  };

  /** Show product count badge */
  @Input() showCount: boolean = false;

  /** Enable hover effects */
  @Input() enableHover: boolean = true;

  /** Custom CSS class for the container */
  @Input() containerClass: string = '';

  /** Card style for masonry grid (rounded corners, shadow, etc.) */
  @Input() cardStyle: 'minimal' | 'elevated' | 'bordered' = 'elevated';

  constructor(private settingsService: CommerceSettingsService) {}

  ngOnInit(): void {
    // Apply WordPress settings if enabled
    if (this.useWordPressSettings) {
      this.applyWordPressSettings();
    }

    // Set default grid options if not provided
    if (!this.gridOptions.columns) {
      this.gridOptions.columns = { mobile: 3, tablet: 4, desktop: 7 };
    }
    if (!this.gridOptions.gap) {
      this.gridOptions.gap = 24;
    }
  }

  /**
   * Get category link
   * Uses custom link if provided, otherwise generates from slug
   */
  getCategoryLink(category: CategoryDisplay): string {
    return category.link || `/category/${category.slug}`;
  }

  /**
   * Get grid columns CSS class based on display style and options
   */
  getGridColumnsClass(): string {
    const cols = this.gridOptions.columns || { mobile: 3, tablet: 4, desktop: 7 };
    
    if (this.displayStyle === 'masonry-grid') {
      return `grid-cols-${cols.mobile || 2} sm:grid-cols-${cols.tablet || 3} lg:grid-cols-${cols.desktop || 4}`;
    }
    
    // flat-list style
    return `grid-cols-${cols.mobile || 3} sm:grid-cols-${cols.tablet || 4} lg:grid-cols-${cols.desktop || 7}`;
  }

  /**
   * Get size classes for category items
   */
  getSizeClass(): string {
    const sizeMap = {
      sm: 'w-16 h-16 sm:w-18 sm:h-18',
      md: 'w-20 h-20 sm:w-24 sm:h-24',
      lg: 'w-24 h-24 sm:w-28 sm:h-28',
      xl: 'w-28 h-28 sm:w-32 sm:h-32'
    };
    return sizeMap[this.size] || sizeMap.md;
  }

  /**
   * Get icon size class
   */
  getIconSizeClass(): string {
    const sizeMap = {
      sm: 'text-2xl sm:text-3xl',
      md: 'text-3xl sm:text-4xl',
      lg: 'text-4xl sm:text-5xl',
      xl: 'text-5xl sm:text-6xl'
    };
    return sizeMap[this.size] || sizeMap.md;
  }

  /**
   * Get card style classes for masonry grid
   */
  getCardStyleClass(): string {
    const styleMap = {
      minimal: 'bg-white rounded-lg p-4',
      elevated: 'bg-white rounded-xl p-6 shadow-md hover:shadow-xl',
      bordered: 'bg-white rounded-lg p-5 border-2 border-gray-200 hover:border-cyan-500'
    };
    return styleMap[this.cardStyle] || styleMap.elevated;
  }

  /**
   * Track by function for *ngFor optimization
   */
  trackByCategory(index: number, category: CategoryDisplay): string | number {
    return category.id;
  }

  /**
   * Apply WordPress settings to component configuration
   * Only applies settings for properties that haven't been explicitly set via @Input
   */
  private applyWordPressSettings(): void {
    const config = this.settingsService.getCategoriesDisplayConfig();
    console.log('[CategoriesDisplayComponent] WordPress settings fetch:', config);
    
    if (!config) {
      console.warn('[CategoriesDisplayComponent] WordPress settings enabled but no configuration found');
      console.log('[CategoriesDisplayComponent] Make sure to:');
      console.log('  1. Save settings in WordPress Admin → NGW Commerce Settings');
      console.log('  2. Click "Flush Cache" after saving');
      console.log('  3. Verify API endpoint returns categories_display object');
      return;
    }

    console.log('[CategoriesDisplayComponent] Applying WordPress settings:', {
      displayStyle: config.displayStyle,
      size: config.size,
      gridColumns: config.gridColumns,
      showCount: config.showCount
    });

    // Apply settings only if not explicitly set (checking against defaults)
    if (this.displayStyle === 'flat-list') this.displayStyle = config.displayStyle;
    if (this.size === 'md') this.size = config.size;
    if (this.showTitle === true) this.showTitle = config.showTitle;
    if (this.showViewAll === true) this.showViewAll = config.showViewAll;
    if (this.showCount === false) this.showCount = config.showCount;
    if (this.enableHover === true) this.enableHover = config.enableHover;
    if (this.cardStyle === 'elevated') this.cardStyle = config.cardStyle;
    
    // Apply grid options
    if (this.gridOptions.gap === 24) this.gridOptions.gap = config.gridGap;
    if (!this.gridOptions.columns || 
        (this.gridOptions.columns.mobile === 3 && 
         this.gridOptions.columns.tablet === 4 && 
         this.gridOptions.columns.desktop === 7)) {
      this.gridOptions.columns = config.gridColumns;
    }
    
    // Apply carousel options
    if (this.carouselOptions.slidesPerView === 'auto') {
      // Handle both string and number types from config
      const slidesPerView = config.carouselSlidesPerView;
      this.carouselOptions.slidesPerView = slidesPerView === 'auto' ? 'auto' : 
        (typeof slidesPerView === 'number' ? slidesPerView : parseInt(String(slidesPerView), 10) || 'auto');
    }
    if (this.carouselOptions.spaceBetween === 20) {
      this.carouselOptions.spaceBetween = config.carouselSpaceBetween;
    }
    if (this.carouselOptions.loop === false) {
      this.carouselOptions.loop = config.carouselLoop;
    }
    if (this.carouselOptions.autoplay === false) {
      this.carouselOptions.autoplay = config.carouselAutoplay;
    }
    if (this.carouselOptions.navigation === true) {
      this.carouselOptions.navigation = config.carouselNavigation;
    }
    if (this.carouselOptions.pagination === true) {
      this.carouselOptions.pagination = config.carouselPagination;
    }
  }
}
