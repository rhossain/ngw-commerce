# Category Products Component

A reusable Angular standalone component for displaying products by category with multiple style options.

## Quick Start

```html
<!-- Basic Grid View -->
<app-category-products 
  [categoryId]="15"
  [limit]="8"
>
</app-category-products>

<!-- Carousel View -->
<app-category-products 
  [categoryId]="15"
  [limit]="8"
  displayStyle="carousel"
  [carouselAutoplay]="true"
>
</app-category-products>

<!-- List View -->
<app-category-products 
  [categoryId]="15"
  [limit]="6"
  displayStyle="list"
>
</app-category-products>
```

## Features

✅ **3 Display Styles**: Grid, Carousel, and List  
✅ **Fully Configurable**: Category ID, limit, sorting, filtering  
✅ **Responsive Design**: Mobile-first responsive layouts  
✅ **Advanced Filtering**: Sale items, featured products  
✅ **Swiper Integration**: Smooth carousel with navigation  
✅ **Loading States**: Elegant loading, error, and empty states  

## Key Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `categoryId` | `number` | **Required** | WooCommerce category ID |
| `displayStyle` | `'carousel' \| 'grid' \| 'list'` | `'grid'` | Display layout |
| `limit` | `number` | `8` | Number of products to show |
| `heading` | `string` | `''` | Custom heading |
| `showOnSaleOnly` | `boolean` | `false` | Show only sale items |
| `showFeaturedOnly` | `boolean` | `false` | Show only featured items |

## Documentation

See the full documentation: [`/docs/CATEGORY-PRODUCTS-COMPONENT.md`](../../../../docs/CATEGORY-PRODUCTS-COMPONENT.md)

## Examples

See complete examples: [`usage-examples.html`](./usage-examples.html)
