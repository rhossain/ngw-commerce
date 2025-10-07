# Variation Swatches for WooCommerce - Integration Guide

## Overview
This guide explains how to integrate the **"Variation Swatches for WooCommerce"** plugin with your Angular application.

## Prerequisites

### 1. Install WordPress Plugin
Install one of these plugins in your WordPress/WooCommerce site:
- **Variation Swatches for WooCommerce** (by RadiusTheme)
- **Variation Swatches for WooCommerce** (by WooCommerce)
- **Color or Image Variation Swatches for WooCommerce** (by Emran Ahmed)

### 2. Configure Plugin
1. Go to WordPress Admin → WooCommerce → Settings → Variation Swatches
2. Configure swatch display options
3. Edit product attributes (e.g., Color, Size)
4. Set attribute type to "Color" or "Image" or "Label"
5. For color attributes, add hex color codes
6. For image attributes, upload swatch images

---

## How It Works

### Data Flow
```
WordPress/WooCommerce (with Variation Swatches Plugin)
           ↓
WooCommerce REST API (/wp-json/wc/v3/products)
           ↓
Angular AttributeService (fetches & caches)
           ↓
VariationSwatchComponent (displays swatches)
           ↓
Product Detail Component (handles selection)
```

### API Endpoints Used

**1. Get Product with Attributes:**
```
GET /wp-json/wc/v3/products/{id}
```

Response includes:
```json
{
  "attributes": [
    {
      "id": 1,
      "name": "Color",
      "options": ["Red", "Blue", "Green"],
      "variation": true
    }
  ]
}
```

**2. Get Attribute Terms (with swatch data):**
```
GET /wp-json/wc/v3/products/attributes/{attribute_id}/terms
```

Response includes:
```json
[
  {
    "id": 23,
    "name": "Red",
    "slug": "red",
    "meta_data": [
      {
        "key": "product_attribute_color",
        "value": "#ff0000"
      }
    ]
  }
]
```

---

## Implementation

### Step 1: Service Layer (Already Created)

**File:** `src/app/core/services/attribute.service.ts`

Features:
- ✅ Fetches attribute terms from WooCommerce API
- ✅ Parses swatch meta data (color, image, type)
- ✅ Caches attribute data for performance
- ✅ Provides helper methods for swatch data

### Step 2: Component (Already Created)

**File:** `src/app/shared/components/variation-swatch/variation-swatch.component.ts`

Features:
- ✅ Displays color swatches with hex values
- ✅ Displays image swatches
- ✅ Displays label swatches
- ✅ Shows selected state
- ✅ Shows out-of-stock state
- ✅ Emits selection events

---

## Usage Example

### In Product Detail Component

**Update:** `src/app/features/products/product-detail/product-detail.component.ts`

```typescript
import { AttributeService, SwatchData } from '../../../core/services/attribute.service';
import { VariationSwatchComponent, SwatchOption } from '../../../shared/components/variation-swatch/variation-swatch.component';

export class ProductDetailComponent implements OnInit {
  productSwatches: Map<string, SwatchOption[]> = new Map();

  constructor(
    // ... existing services
    private attributeService: AttributeService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const slug = params['slug'];
      this.loadProductBySlug(slug);
    });

    this.product$.pipe(takeUntil(this.destroy$)).subscribe(product => {
      if (product) {
        this.loadProductSwatches(product);
        this.loadRelatedProducts(product.id);
        this.loadReviews(product.id);
      }
    });
  }

  loadProductSwatches(product: Product): void {
    this.attributeService.getProductSwatches(product).subscribe({
      next: (swatchMap) => {
        // Convert SwatchData to SwatchOption for component
        this.productSwatches = new Map();
        swatchMap.forEach((swatches, attributeName) => {
          const options: SwatchOption[] = swatches.map(swatch => ({
            ...swatch,
            available: true // You can check stock status here
          }));
          this.productSwatches.set(attributeName, options);
        });
      },
      error: (error) => {
        console.error('Error loading swatches:', error);
      }
    });
  }

  onSwatchSelected(attributeName: string, swatch: SwatchOption): void {
    console.log(`Selected ${attributeName}:`, swatch.name);
    this.selectedAttributes[attributeName] = swatch.name;
    this.findMatchingVariation();
  }
}
```

### In Template

**Update:** `src/app/features/products/product-detail/product-detail.component.html`

```html
<!-- Replace the existing attribute selection dropdowns with: -->

<div *ngFor="let attr of product.attributes" class="mb-6">
  <label class="block text-sm font-medium text-gray-700 mb-2">
    {{ attr.name }}
  </label>

  <!-- If swatches are available, use swatch component -->
  <app-variation-swatch
    *ngIf="productSwatches.has(attr.name)"
    [options]="productSwatches.get(attr.name)!"
    [selected]="selectedAttributes[attr.name]"
    [size]="'md'"
    (optionSelected)="onSwatchSelected(attr.name, $event)"
  ></app-variation-swatch>

  <!-- Fallback to dropdown if no swatches -->
  <select
    *ngIf="!productSwatches.has(attr.name)"
    (change)="onAttributeChange(attr.name, $any($event.target).value)"
    class="w-full px-4 py-2 border border-gray-300 rounded-md"
  >
    <option value="">Choose {{ attr.name }}</option>
    <option *ngFor="let option of attr.options" [value]="option">
      {{ option }}
    </option>
  </select>
</div>
```

---

## Testing

### 1. Test API Response

Open browser console and test:

```javascript
fetch('https://woocommerce.rshossain.com/wp-json/wc/v3/products/attributes/1/terms?consumer_key=YOUR_KEY&consumer_secret=YOUR_SECRET')
  .then(r => r.json())
  .then(console.log);
```

Check if `meta_data` includes swatch information.

### 2. Test in Angular

1. Go to a product with variations (e.g., T-Shirt with colors)
2. Open DevTools console
3. Should see logs: "Customer search result: [...]"
4. Swatches should display as colored boxes/images

---

## Swatch Meta Data Formats

Different plugins use different meta keys:

### Plugin: Variation Swatches for WooCommerce (RadiusTheme)
```json
{
  "key": "_product_attribute_color",
  "value": "#ff0000"
}
```

### Plugin: Variation Swatches (WooCommerce Official)
```json
{
  "key": "pa_color",
  "value": "#ff0000"
}
```

### Plugin: YITH WooCommerce Color and Label Variations
```json
{
  "key": "_yith_wccl_value",
  "value": "#ff0000"
}
```

The `AttributeService` handles multiple formats automatically.

---

## Customization

### Change Swatch Size

```html
<app-variation-swatch
  [size]="'sm'"  <!-- or 'md', 'lg' -->
  ...
></app-variation-swatch>
```

### Style Swatches

Edit `variation-swatch.component.ts` to customize:
- Border styles
- Hover effects
- Selection indicators
- Disabled states

### Add Tooltips

```html
<app-variation-swatch
  [options]="options"
  [title]="option.name"  <!-- Shows on hover -->
  ...
></app-variation-swatch>
```

---

## Troubleshooting

### Swatches Not Showing

**Check 1:** Verify plugin is installed and activated
```
WordPress Admin → Plugins → Variation Swatches for WooCommerce (Active)
```

**Check 2:** Verify attributes are configured as variations
```
Product → Attributes → Variation: ✓ Used for variations
```

**Check 3:** Check API response includes meta_data
```typescript
this.attributeService.getAttributeTerms(1).subscribe(console.log);
```

**Check 4:** Ensure CORS is enabled (see `.htaccess-WITH-CORS`)

### Colors Not Displaying

- Check hex codes are valid: `#ff0000` (not `ff0000`)
- Verify meta_data key matches: `product_attribute_color`
- Check browser console for errors

### Images Not Loading

- Verify image URLs are absolute: `https://...` not `/wp-content/...`
- Check image CORS headers
- Test image URL directly in browser

---

## Performance Optimization

### 1. Caching
AttributeService caches all attribute terms to reduce API calls.

### 2. Lazy Loading
Load swatches only when needed:
```typescript
loadProductSwatches(product: Product): void {
  if (product.type === 'variable') {
    // Only load for variable products
    this.attributeService.getProductSwatches(product).subscribe(...);
  }
}
```

### 3. Preload Common Attributes
```typescript
ngOnInit(): void {
  // Preload common attributes like Color, Size
  this.attributeService.getAttributeTerms(1).subscribe(); // Color
  this.attributeService.getAttributeTerms(2).subscribe(); // Size
}
```

---

## Next Steps

1. ✅ Install Variation Swatches plugin in WordPress
2. ✅ Configure product attributes with colors/images
3. ✅ Test API response includes swatch data
4. ✅ Import VariationSwatchComponent in product-detail
5. ✅ Add AttributeService to product-detail constructor
6. ✅ Update template to use swatches
7. ✅ Test swatch selection and variation matching

---

## Resources

- [WooCommerce REST API Docs](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [Variation Swatches Plugin](https://wordpress.org/plugins/woo-variation-swatches/)
- [Product Attributes](https://woocommerce.com/document/managing-product-taxonomies/)
