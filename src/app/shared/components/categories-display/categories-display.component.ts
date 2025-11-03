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

  ngOnInit(): void {
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
}
