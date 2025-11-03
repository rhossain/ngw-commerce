/**
 * Category Display Model
 * Interface for category data used in the CategoriesDisplayComponent
 */

export interface CategoryDisplay {
  id: number | string;
  name: string;
  slug: string;
  icon?: string;           // Font Awesome icon class (e.g., 'fa-mobile-alt')
  imageUrl?: string;       // Category image URL
  count?: number;          // Number of products in category
  description?: string;    // Optional category description
  color?: string;          // Optional background/accent color
  link?: string;           // Optional custom link (defaults to /category/:slug)
}

/**
 * Display style options for the categories component
 */
export type CategoryDisplayStyle = 'flat-list' | 'masonry-grid' | 'carousel';

/**
 * Size variants for category items
 */
export type CategorySize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Layout options for grid displays
 */
export interface CategoryGridOptions {
  columns?: {
    mobile?: number;      // Grid columns on mobile (default: 3)
    tablet?: number;      // Grid columns on tablet (default: 4)
    desktop?: number;     // Grid columns on desktop (default: 7)
  };
  gap?: number;           // Gap between items in pixels (default: 24)
}

/**
 * Carousel configuration options
 */
export interface CategoryCarouselOptions {
  slidesPerView?: number | 'auto';  // Number of slides visible (default: 'auto')
  spaceBetween?: number;             // Space between slides (default: 20)
  loop?: boolean;                    // Enable loop mode (default: false)
  autoplay?: boolean;                // Enable autoplay (default: false)
  autoplayDelay?: number;            // Autoplay delay in ms (default: 3000)
  navigation?: boolean;              // Show navigation arrows (default: true)
  pagination?: boolean;              // Show pagination dots (default: true)
  breakpoints?: {                    // Responsive breakpoints
    [width: number]: {
      slidesPerView: number;
      spaceBetween: number;
    };
  };
}
