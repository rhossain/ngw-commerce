# Category Products Component

A highly reusable Angular component for displaying products by category with multiple style options including carousel, grid, and list views.

## Features

- **Multiple Display Styles**: Carousel, Grid, and List layouts
- **Fully Configurable**: Category ID, product limit, sorting, filtering
- **Responsive Design**: Mobile-first responsive layouts
- **Advanced Filtering**: Show only sale items or featured products
- **Swiper Integration**: Smooth carousel with navigation and pagination
- **Loading States**: Elegant loading, error, and empty states
- **SEO Friendly**: Semantic HTML and proper routing

## Installation

The component is already part of the shared components. Simply import it where needed:

```typescript
import { CategoryProductsComponent } from './shared/components/category-products/category-products.component';

@Component({
  // ...
  imports: [CategoryProductsComponent]
})
```

## Basic Usage

### Grid View (Default)

```html
<app-category-products 
  [categoryId]="15"
  [limit]="8"
>
</app-category-products>
```

### Carousel View

```html
<app-category-products 
  [categoryId]="15"
  [limit]="8"
  displayStyle="carousel"
  heading="Featured Electronics"
  [carouselAutoplay]="true"
  [carouselDelay]="5000"
>
</app-category-products>
```

### List View

```html
<app-category-products 
  [categoryId]="15"
  [limit]="6"
  displayStyle="list"
  heading="New Arrivals"
  [listCompact]="false"
>
</app-category-products>
```

## Configuration Options

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `categoryId` | `number` | **Required.** The WooCommerce category ID to fetch products from |

### Display Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `displayStyle` | `'carousel' \| 'grid' \| 'list'` | `'grid'` | The layout style for displaying products |
| `limit` | `number` | `8` | Maximum number of products to display |
| `heading` | `string` | `''` | Custom heading (falls back to category name) |
| `showViewAll` | `boolean` | `true` | Show "View All" link |
| `viewAllRoute` | `string` | `'/shop'` | Route for "View All" button |

### Grid View Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `gridColumns` | `number` | `4` | Number of columns on desktop (1-6) |
| `tabletColumns` | `number` | `3` | Number of columns on tablet |
| `mobileColumns` | `number` | `2` | Number of columns on mobile |

### Carousel View Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `carouselAutoplay` | `boolean` | `false` | Enable automatic slide rotation |
| `carouselDelay` | `number` | `3000` | Delay between slides in milliseconds |
| `carouselLoop` | `boolean` | `true` | Enable infinite loop |
| `carouselSlidesPerView` | `number` | `4` | Number of slides visible on desktop |
| `carouselSpaceBetween` | `number` | `20` | Space between slides in pixels |

### List View Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `listCompact` | `boolean` | `false` | Use compact list layout |

### Advanced Filtering & Sorting

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `sortBy` | `'date' \| 'popularity' \| 'rating' \| 'price'` | `'date'` | Sort products by specified field |
| `sortOrder` | `'asc' \| 'desc'` | `'desc'` | Sort order (ascending or descending) |
| `showOnSaleOnly` | `boolean` | `false` | Show only products on sale |
| `showFeaturedOnly` | `boolean` | `false` | Show only featured products |

## Advanced Examples

### Sale Products Carousel

```html
<app-category-products 
  [categoryId]="15"
  [limit]="12"
  displayStyle="carousel"
  heading="Flash Sale - Electronics"
  [showOnSaleOnly]="true"
  sortBy="price"
  sortOrder="asc"
  [carouselAutoplay]="true"
  [carouselDelay]="4000"
  [carouselSlidesPerView]="4"
>
</app-category-products>
```

### Featured Products Grid

```html
<app-category-products 
  [categoryId]="20"
  [limit]="8"
  displayStyle="grid"
  heading="Featured Products"
  [showFeaturedOnly]="true"
  [gridColumns]="4"
  sortBy="popularity"
  sortOrder="desc"
>
</app-category-products>
```

### Compact Product List

```html
<app-category-products 
  [categoryId]="25"
  [limit]="10"
  displayStyle="list"
  heading="Best Rated Products"
  [listCompact]="true"
  sortBy="rating"
  sortOrder="desc"
  [showViewAll]="false"
>
</app-category-products>
```

### Custom Grid Layout

```html
<app-category-products 
  [categoryId]="30"
  [limit]="6"
  displayStyle="grid"
  heading="New Arrivals"
  [gridColumns]="3"
  sortBy="date"
  sortOrder="desc"
  viewAllRoute="/new-arrivals"
>
</app-category-products>
```

## Use Cases

### Home Page Sections

```html
<!-- Featured Products -->
<section class="py-12 bg-white">
  <div class="container mx-auto px-4">
    <app-category-products 
      [categoryId]="15"
      [limit]="8"
      displayStyle="grid"
      heading="Featured Electronics"
      [showFeaturedOnly]="true"
    >
    </app-category-products>
  </div>
</section>

<!-- Sale Carousel -->
<section class="py-12 bg-gray-50">
  <div class="container mx-auto px-4">
    <app-category-products 
      [categoryId]="20"
      [limit]="12"
      displayStyle="carousel"
      heading="Hot Deals"
      [showOnSaleOnly]="true"
      [carouselAutoplay]="true"
    >
    </app-category-products>
  </div>
</section>
```

### Category Landing Pages

```html
<!-- Top Products -->
<app-category-products 
  [categoryId]="categoryId"
  [limit]="8"
  displayStyle="grid"
  heading="Top Products in {{ categoryName }}"
  sortBy="popularity"
  sortOrder="desc"
>
</app-category-products>

<!-- Related Products -->
<app-category-products 
  [categoryId]="categoryId"
  [limit]="4"
  displayStyle="carousel"
  heading="You May Also Like"
  [showViewAll]="false"
  [carouselSlidesPerView]="4"
>
</app-category-products>
```

### Product Detail Pages

```html
<!-- Related Products -->
<app-category-products 
  [categoryId]="product.categories[0].id"
  [limit]="4"
  displayStyle="grid"
  heading="Related Products"
  [gridColumns]="4"
  [showViewAll]="false"
>
</app-category-products>
```

### Sidebar Widget

```html
<!-- Best Sellers Widget -->
<aside class="w-full lg:w-80">
  <app-category-products 
    [categoryId]="15"
    [limit]="5"
    displayStyle="list"
    heading="Best Sellers"
    [listCompact]="true"
    sortBy="popularity"
    [showViewAll]="true"
    viewAllRoute="/shop/best-sellers"
  >
  </app-category-products>
</aside>
```

## Component Methods

### Public Methods

- **`reload()`**: Manually reload products from the API
  ```typescript
  @ViewChild(CategoryProductsComponent) categoryProducts!: CategoryProductsComponent;
  
  refreshProducts() {
    this.categoryProducts.reload();
  }
  ```

## Styling

The component uses TailwindCSS for styling and includes custom CSS for carousel animations. All styles are scoped to the component.

### Customization

You can override styles by targeting the component's CSS classes:

```css
/* Custom grid gap */
.category-products-container [class*="grid"] {
  gap: 2rem;
}

/* Custom carousel button colors */
.product-carousel::part(button-prev),
.product-carousel::part(button-next) {
  background-color: #your-color;
}
```

## Responsive Behavior

### Grid View
- **Mobile (< 640px)**: 1-2 columns
- **Tablet (640px - 1024px)**: 2-3 columns
- **Desktop (> 1024px)**: 3-6 columns (configurable)

### Carousel View
- **Mobile**: 1 slide per view
- **Tablet**: 2-3 slides per view
- **Desktop**: Configurable (1-6 slides)

### List View
- **Mobile**: Stacked layout
- **Desktop**: Side-by-side layout with image and details

## Performance Considerations

1. **Limit Products**: Keep the `limit` reasonable (8-12 for grid/carousel, 5-10 for list)
2. **Lazy Loading**: Products load only when the component initializes
3. **Change Detection**: Uses `trackBy` for optimal Angular rendering
4. **API Caching**: Leverages the ProductService which may implement caching

## Error Handling

The component handles three states:

1. **Loading**: Shows a spinner
2. **Error**: Displays an error message with icon
3. **Empty**: Shows "No products found" message

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

Requires Swiper for carousel functionality (already installed).

## Dependencies

- Angular 20+
- TailwindCSS
- Swiper (for carousel)
- ngx-toastr (via ProductCardComponent)

## Troubleshooting

### Products not loading
- Verify the `categoryId` exists in WooCommerce
- Check browser console for API errors
- Ensure ProductService is properly configured

### Carousel not working
- Ensure Swiper is registered: `register()` is called in component
- Check that `CUSTOM_ELEMENTS_SCHEMA` is included

### Styling issues
- Verify TailwindCSS is properly configured
- Check that component CSS file is being loaded
- Ensure no conflicting global styles

## Future Enhancements

Potential features for future versions:
- [ ] Pagination support for large category collections
- [ ] Filter by price range, attributes
- [ ] Multiple category support
- [ ] Drag-to-reorder for carousel
- [ ] Lazy loading images
- [ ] Virtual scrolling for large lists
- [ ] Export/share functionality

## License

Part of the ngw-commerce project.
