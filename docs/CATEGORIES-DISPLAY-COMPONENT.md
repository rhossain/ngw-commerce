# Categories Display Component

A highly reusable and flexible Angular component for displaying categories in multiple styles: flat list with circular icons, masonry grid with cards, or Swiper-powered carousel.

## 📦 Component Files

```
src/app/shared/components/categories-display/
├── categories-display.component.ts       # Component logic
├── categories-display.component.html     # Template with 3 display styles
├── categories-display.component.css      # Styles and animations
└── categories-display.model.ts           # TypeScript interfaces
```

## 🎯 Features

- ✅ **3 Display Styles**: Flat list, masonry grid, carousel
- ✅ **Fully Customizable**: Colors, sizes, layouts, animations
- ✅ **Responsive Design**: Mobile, tablet, desktop optimized
- ✅ **Icon Support**: Font Awesome icons
- ✅ **Image Support**: Category images with hover effects
- ✅ **Count Badges**: Show product counts (optional)
- ✅ **Carousel Mode**: Swiper integration with navigation
- ✅ **Hover Effects**: Smooth animations and transitions
- ✅ **Routing**: Built-in Angular router support
- ✅ **Accessibility**: ARIA labels, focus states, keyboard navigation
- ✅ **Empty State**: Elegant no-data display

## 📝 Quick Start

### 1. Import the Component

```typescript
import { CategoriesDisplayComponent } from '../../shared/components/categories-display/categories-display.component';
import { CategoryDisplay } from '../../shared/components/categories-display/categories-display.model';

@Component({
  imports: [CategoriesDisplayComponent],
  // ...
})
export class YourComponent {
  categories: CategoryDisplay[] = [
    { id: 1, name: 'Mobile', slug: 'mobile', icon: 'fa-mobile-alt' },
    { id: 2, name: 'Electronics', slug: 'electronics', icon: 'fa-tv' },
    // ...
  ];
}
```

### 2. Use in Template

```html
<app-categories-display
  [categories]="categories"
  displayStyle="flat-list"
  [showTitle]="true"
  title="Top Categories"
></app-categories-display>
```

## 🎨 Display Styles

### 1. Flat List (Circular Icons Grid)

Perfect for displaying categories like "Top Categories" section on homepage.

```html
<app-categories-display
  [categories]="topCategories"
  displayStyle="flat-list"
  title="Shop From Top Categories"
  titleHighlight="Top Categories"
  size="md"
  [gridOptions]="{
    columns: { mobile: 3, tablet: 4, desktop: 7 },
    gap: 24
  }"
></app-categories-display>
```

**Features:**
- Circular icons with background colors
- Grid layout (responsive columns)
- Hover animations (lift effect)
- First item highlighted with cyan accent

**Use Cases:**
- Homepage category navigation
- Quick category access
- Mobile-friendly browsing

---

### 2. Masonry Grid (Card Layout)

Responsive grid with card-based design, perfect for category pages.

```html
<app-categories-display
  [categories]="allCategories"
  displayStyle="masonry-grid"
  title="Browse All Categories"
  cardStyle="elevated"
  [showCount]="true"
  [gridOptions]="{
    columns: { mobile: 2, tablet: 3, desktop: 4 },
    gap: 20
  }"
></app-categories-display>
```

**Features:**
- Card-based layout with images
- Product count badges
- Description text support
- 3 card styles: minimal, elevated, bordered

**Use Cases:**
- Category listing pages
- Department browsing
- Feature-rich category displays

---

### 3. Carousel (Swiper)

Swiper-powered carousel with navigation and autoplay.

```html
<app-categories-display
  [categories]="featuredCategories"
  displayStyle="carousel"
  title="Featured Categories"
  [carouselOptions]="{
    slidesPerView: 'auto',
    spaceBetween: 20,
    loop: true,
    autoplay: true,
    autoplayDelay: 3000,
    navigation: true,
    pagination: true,
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 20 },
      768: { slidesPerView: 3, spaceBetween: 20 },
      1024: { slidesPerView: 5, spaceBetween: 20 }
    }
  }"
></app-categories-display>
```

**Features:**
- Swiper carousel integration
- Navigation arrows and pagination dots
- Autoplay support
- Responsive breakpoints
- Loop mode

**Use Cases:**
- Featured categories showcase
- Limited space displays
- Interactive browsing experiences

## 🔧 Component API

### Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `categories` | `CategoryDisplay[]` | `[]` | Array of category objects |
| `displayStyle` | `'flat-list' \| 'masonry-grid' \| 'carousel'` | `'flat-list'` | Display layout style |
| `showTitle` | `boolean` | `true` | Show section title |
| `title` | `string` | `'Categories'` | Section title text |
| `titleHighlight` | `string?` | `undefined` | Text to highlight in cyan |
| `showViewAll` | `boolean` | `true` | Show "View All" button |
| `viewAllLink` | `string` | `'/categories'` | View All button link |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Size of category items |
| `gridOptions` | `CategoryGridOptions` | See below | Grid layout configuration |
| `carouselOptions` | `CategoryCarouselOptions` | See below | Carousel configuration |
| `showCount` | `boolean` | `false` | Show product count badges |
| `enableHover` | `boolean` | `true` | Enable hover effects |
| `containerClass` | `string` | `''` | Custom CSS class |
| `cardStyle` | `'minimal' \| 'elevated' \| 'bordered'` | `'elevated'` | Card style for masonry |

### CategoryDisplay Interface

```typescript
interface CategoryDisplay {
  id: number | string;        // Unique identifier
  name: string;               // Category name
  slug: string;               // URL slug
  icon?: string;              // Font Awesome class (e.g., 'fa-mobile-alt')
  imageUrl?: string;          // Category image URL
  count?: number;             // Number of products
  description?: string;       // Optional description
  color?: string;             // Background/accent color
  link?: string;              // Custom link (defaults to /category/:slug)
}
```

### CategoryGridOptions Interface

```typescript
interface CategoryGridOptions {
  columns?: {
    mobile?: number;          // Grid columns on mobile (default: 3)
    tablet?: number;          // Grid columns on tablet (default: 4)
    desktop?: number;         // Grid columns on desktop (default: 7)
  };
  gap?: number;               // Gap between items in pixels (default: 24)
}
```

### CategoryCarouselOptions Interface

```typescript
interface CategoryCarouselOptions {
  slidesPerView?: number | 'auto';  // Slides visible (default: 'auto')
  spaceBetween?: number;             // Space between slides (default: 20)
  loop?: boolean;                    // Enable loop mode (default: false)
  autoplay?: boolean;                // Enable autoplay (default: false)
  autoplayDelay?: number;            // Autoplay delay in ms (default: 3000)
  navigation?: boolean;              // Show arrows (default: true)
  pagination?: boolean;              // Show dots (default: true)
  breakpoints?: {                    // Responsive breakpoints
    [width: number]: {
      slidesPerView: number;
      spaceBetween: number;
    };
  };
}
```

## 💡 Usage Examples

### Example 1: Homepage Top Categories (Current Implementation)

```html
<!-- home.component.html -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <app-categories-display
    [categories]="topCategories"
    displayStyle="flat-list"
    [showTitle]="true"
    title="Shop From Top Categories"
    titleHighlight="Top Categories"
    [showViewAll]="true"
    viewAllLink="/products"
    size="md"
    [showCount]="false"
    [enableHover]="true"
  ></app-categories-display>
</section>
```

```typescript
// home.component.ts
topCategories: CategoryDisplay[] = [
  { id: 1, name: 'Mobile', slug: 'mobile', icon: 'fa-mobile-alt' },
  { id: 2, name: 'Cosmetics', slug: 'cosmetics', icon: 'fa-pump-soap' },
  { id: 3, name: 'Electronics', slug: 'electronics', icon: 'fa-tv' },
  { id: 4, name: 'Furniture', slug: 'furniture', icon: 'fa-couch' },
  { id: 5, name: 'Watches', slug: 'watches', icon: 'fa-clock' },
  { id: 6, name: 'Decor', slug: 'decor', icon: 'fa-leaf' },
  { id: 7, name: 'Accessories', slug: 'accessories', icon: 'fa-gem' }
];
```

---

### Example 2: Category Page with Images and Counts

```html
<app-categories-display
  [categories]="shopCategories"
  displayStyle="masonry-grid"
  title="Browse All Departments"
  [showCount]="true"
  cardStyle="elevated"
  [gridOptions]="{
    columns: { mobile: 2, tablet: 3, desktop: 4 },
    gap: 20
  }"
></app-categories-display>
```

```typescript
shopCategories: CategoryDisplay[] = [
  {
    id: 1,
    name: 'Electronics',
    slug: 'electronics',
    imageUrl: 'assets/categories/electronics.jpg',
    count: 156,
    description: 'Latest gadgets and devices'
  },
  {
    id: 2,
    name: 'Fashion',
    slug: 'fashion',
    imageUrl: 'assets/categories/fashion.jpg',
    count: 432,
    description: 'Trending styles for everyone'
  },
  // ...
];
```

---

### Example 3: Featured Categories Carousel

```html
<app-categories-display
  [categories]="featuredCategories"
  displayStyle="carousel"
  title="Trending Categories"
  titleHighlight="Trending"
  size="lg"
  [carouselOptions]="{
    slidesPerView: 'auto',
    spaceBetween: 30,
    loop: true,
    autoplay: true,
    autoplayDelay: 4000,
    navigation: true,
    pagination: true,
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 20 },
      768: { slidesPerView: 3, spaceBetween: 25 },
      1024: { slidesPerView: 5, spaceBetween: 30 }
    }
  }"
></app-categories-display>
```

---

### Example 4: Sidebar Categories (Small Size)

```html
<app-categories-display
  [categories]="sidebarCategories"
  displayStyle="flat-list"
  title="Quick Links"
  [showViewAll]="false"
  size="sm"
  [gridOptions]="{
    columns: { mobile: 2, tablet: 2, desktop: 2 },
    gap: 16
  }"
></app-categories-display>
```

---

### Example 5: Department Mega Menu

```html
<app-categories-display
  [categories]="departmentCategories"
  displayStyle="masonry-grid"
  [showTitle]="false"
  [showViewAll]="false"
  cardStyle="minimal"
  [enableHover]="true"
  [gridOptions]="{
    columns: { mobile: 1, tablet: 2, desktop: 3 },
    gap: 12
  }"
></app-categories-display>
```

## 🎨 Customization

### Custom Colors

You can set custom colors for individual categories:

```typescript
categories: CategoryDisplay[] = [
  { 
    id: 1, 
    name: 'Electronics', 
    slug: 'electronics', 
    icon: 'fa-tv',
    color: '#e0f2fe' // Light blue background
  },
  { 
    id: 2, 
    name: 'Fashion', 
    slug: 'fashion', 
    icon: 'fa-tshirt',
    color: '#fce7f3' // Light pink background
  }
];
```

### Custom Links

Override default category links:

```typescript
categories: CategoryDisplay[] = [
  { 
    id: 1, 
    name: 'Sale Items', 
    slug: 'sale', 
    icon: 'fa-tag',
    link: '/products?on_sale=true' // Custom link
  }
];
```

### Custom Container Styling

Add custom classes for additional styling:

```html
<app-categories-display
  [categories]="categories"
  displayStyle="flat-list"
  containerClass="my-custom-categories shadow-lg rounded-xl p-6"
></app-categories-display>
```

## 🎭 Size Variants

```html
<!-- Small - Sidebar/Compact -->
<app-categories-display size="sm" [categories]="categories"></app-categories-display>

<!-- Medium - Default/Homepage -->
<app-categories-display size="md" [categories]="categories"></app-categories-display>

<!-- Large - Feature Section -->
<app-categories-display size="lg" [categories]="categories"></app-categories-display>

<!-- Extra Large - Hero Section -->
<app-categories-display size="xl" [categories]="categories"></app-categories-display>
```

## 🎨 Card Styles (Masonry Grid)

```html
<!-- Minimal - Clean and simple -->
<app-categories-display 
  displayStyle="masonry-grid"
  cardStyle="minimal"
  [categories]="categories"
></app-categories-display>

<!-- Elevated - Default with shadow -->
<app-categories-display 
  displayStyle="masonry-grid"
  cardStyle="elevated"
  [categories]="categories"
></app-categories-display>

<!-- Bordered - Border hover effect -->
<app-categories-display 
  displayStyle="masonry-grid"
  cardStyle="bordered"
  [categories]="categories"
></app-categories-display>
```

## 🚀 Integration with WooCommerce

If you're loading categories from WooCommerce API:

```typescript
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

categories$: Observable<CategoryDisplay[]>;

ngOnInit() {
  // Load from store and transform to CategoryDisplay
  this.categories$ = this.store.select(selectAllCategories).pipe(
    map(wooCategories => wooCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.image?.src,
      count: cat.count,
      description: cat.description
    })))
  );
}
```

```html
<app-categories-display
  [categories]="categories$ | async"
  displayStyle="masonry-grid"
></app-categories-display>
```

## 📱 Responsive Behavior

The component automatically adjusts for different screen sizes:

| Screen Size | Flat List Columns | Masonry Grid Columns | Carousel Slides |
|-------------|-------------------|----------------------|-----------------|
| Mobile (< 640px) | 3 | 2 | 1-2 |
| Tablet (640-1024px) | 4 | 3 | 3 |
| Desktop (> 1024px) | 7 | 4 | 5-7 |

Customize these with `gridOptions` or `carouselOptions.breakpoints`.

## ♿ Accessibility Features

- ✅ **ARIA Labels**: Proper labels for screen readers
- ✅ **Keyboard Navigation**: Tab navigation support
- ✅ **Focus States**: Clear focus indicators
- ✅ **Reduced Motion**: Respects `prefers-reduced-motion`
- ✅ **Semantic HTML**: Proper heading hierarchy
- ✅ **Alt Text**: Image alt attributes

## 🐛 Troubleshooting

### Issue: Categories not displaying

**Solution:** Ensure you've imported the component:

```typescript
import { CategoriesDisplayComponent } from '../../shared/components/categories-display/categories-display.component';

@Component({
  imports: [CategoriesDisplayComponent]
})
```

---

### Issue: Carousel not working

**Solution:** Ensure Swiper is registered in your app. Add to `main.ts`:

```typescript
import { register } from 'swiper/element/bundle';
register();
```

---

### Issue: Icons not showing

**Solution:** Ensure Font Awesome is loaded in `index.html`:

```html
<link rel="stylesheet" 
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

---

### Issue: Hover effects not working

**Solution:** Enable hover effects:

```html
<app-categories-display [enableHover]="true"></app-categories-display>
```

---

### Issue: Custom colors not applying

**Solution:** Use valid CSS color values:

```typescript
{ id: 1, name: 'Test', slug: 'test', color: '#e0f2fe' } // ✅ Valid
{ id: 1, name: 'Test', slug: 'test', color: 'blue' }    // ✅ Valid
{ id: 1, name: 'Test', slug: 'test', color: 'invalid' } // ❌ Invalid
```

## 🎯 Best Practices

### 1. Choose the Right Display Style

- **Flat List**: Best for 5-10 main categories with icons
- **Masonry Grid**: Best for 10+ categories with images and descriptions
- **Carousel**: Best for featured/trending categories with limited space

### 2. Optimize Images

For masonry grid with images:
- Use optimized images (WebP format)
- Recommended size: 400x300px
- Add loading="lazy" for better performance

### 3. Limit Categories

- **Flat List**: 5-10 categories (fits one row)
- **Masonry Grid**: 12-20 categories per page
- **Carousel**: 8-15 categories (good variety without overwhelming)

### 4. Consistent Icons

Use consistent icon styles from the same Font Awesome collection (solid, regular, brands).

### 5. Meaningful Names

Keep category names short (1-2 words) for better mobile display.

## 📊 Performance Tips

1. **Use trackBy**: Already implemented for optimal *ngFor performance
2. **Lazy Load Images**: Carousel automatically lazy-loads slides
3. **Limit Animations**: Disable hover effects on mobile for better performance
4. **Optimize Data**: Load only necessary category data from API

## 🔄 Migration from Old Code

Before (inline HTML):
```html
<div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-6">
  <div *ngFor="let category of categories; let i = index">
    <!-- 30+ lines of HTML -->
  </div>
</div>
```

After (component):
```html
<app-categories-display
  [categories]="categories"
  displayStyle="flat-list"
></app-categories-display>
```

**Benefits:**
- ✅ Reduced code by ~95%
- ✅ Reusable across application
- ✅ Consistent styling
- ✅ Easier to maintain
- ✅ More features available

## 📚 Related Components

- **HeroBannerComponent**: Hero slides with auto-rotation
- **CategoryProductsComponent**: Display products from a category
- **ProductCardComponent**: Individual product display

## 🎉 Summary

The CategoriesDisplayComponent is a powerful, flexible component that:

1. **Replaces repetitive code** with a single reusable component
2. **Provides 3 display styles** for different use cases
3. **Fully customizable** via input properties
4. **Responsive and accessible** out of the box
5. **Easy to integrate** into any Angular application

Use it anywhere you need to display categories - homepage, category pages, sidebars, mega menus, and more!

## 📖 Examples in the App

Current implementation:
- **Homepage**: Top Categories section (flat-list style)

Potential usage:
- Shop page: All categories grid (masonry-grid style)
- Footer: Quick category links (flat-list, size="sm")
- Sidebar: Category navigation (flat-list, compact)
- Featured section: Trending categories (carousel style)

---

**Created:** November 2025  
**Component Version:** 1.0.0  
**Angular Version:** 18+
