# MegaMart Landing Page - Quick Reference

## Running the Application

```bash
# Start the development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

The new landing page is now your homepage at `http://localhost:4200/`

## Key Components

### Hero Banner
- 3 rotating slides (5-second interval)
- Manual navigation with arrows
- Click dots to jump to specific slide

### Smartphone Deals
- Displays up to 5 featured products from WooCommerce
- Auto-calculates discounts and savings
- Second product has special "featured" styling
- Click any card to view product details

### Top Categories
- 7 predefined categories with icons
- Links to filtered product pages
- Hover effect lifts the icon

### Electronics Brands
- 4 brand showcase cards
- Click to view brand-specific products
- Gradient backgrounds for visual appeal

### Daily Essentials
- 6 category cards with gradients
- Links to category-specific pages
- Icon-based visual design

## Customization

### Update Hero Slides
Edit `home.component.ts`:
```typescript
heroSlides: HeroSlide[] = [
  {
    id: 'slide-1',
    title: 'YOUR TITLE',
    subtitle: 'Your subtitle',
    description: 'UP to XX% OFF',
    active: true
  }
];
```

### Update Categories
Edit `home.component.ts`:
```typescript
topCategories: Category[] = [
  { id: 1, name: 'Category Name', slug: 'category-slug', icon: 'fa-icon-name' }
];
```

### Change Colors
Edit `home.component.css`:
```css
.hero-gradient {
  background: linear-gradient(135deg, #yourcolor1, #yourcolor2, #yourcolor3);
}
```

### Modify Product Count
Edit `home.component.ts` in `loadProducts()`:
```typescript
params: {
  per_page: 10, // Change this number
  featured: true,
  orderby: 'popularity'
}
```

## Font Awesome Icons

Common icons used:
- `fa-mobile-alt` - Mobile phone
- `fa-tv` - Electronics/TV
- `fa-clock` - Watches
- `fa-shopping-basket` - Shopping
- `fa-carrot` - Vegetables
- `fa-apple-alt` - Fruits
- `fab fa-apple` - Apple brand
- `fa-chevron-right` - Arrow right
- `fa-chevron-left` - Arrow left

Find more at: https://fontawesome.com/icons

## Tailwind Classes Quick Reference

### Spacing
- `p-4` - Padding all sides
- `px-4` - Padding horizontal
- `py-4` - Padding vertical
- `m-4` - Margin all sides
- `gap-4` - Grid/flex gap

### Layout
- `flex` - Flexbox
- `grid` - CSS Grid
- `grid-cols-5` - 5 columns
- `items-center` - Align items center
- `justify-between` - Space between

### Sizing
- `w-full` - Width 100%
- `h-48` - Height 12rem
- `max-w-7xl` - Max width container
- `text-2xl` - Font size 2xl

### Colors
- `bg-white` - White background
- `text-cyan-500` - Cyan text
- `border-gray-300` - Gray border

### Effects
- `shadow-md` - Medium shadow
- `hover:shadow-xl` - XL shadow on hover
- `rounded-xl` - Extra large border radius
- `transition` - Smooth transitions

## Common Tasks

### Add a New Section
1. Add data structure in component TypeScript
2. Add HTML template section
3. Add CSS styling if needed
4. Test responsive behavior

### Change Auto-Slide Speed
Edit `home.component.ts`:
```typescript
startSlideShow(): void {
  this.slideInterval = setInterval(() => {
    this.nextSlide();
  }, 5000); // Change 5000 to desired milliseconds
}
```

### Disable Auto-Slide
Comment out in `ngOnInit()`:
```typescript
ngOnInit(): void {
  this.loadProducts();
  // this.startSlideShow(); // Commented out
  this.subscribeToProducts();
}
```

### Add More Daily Essentials
Edit `home.component.ts`:
```typescript
dailyEssentials: DailyEssential[] = [
  // ... existing items
  { id: '7', name: 'New Item', icon: 'fa-icon', discount: 'UP to 50% OFF', category: 'new-category' }
];
```

Update grid in HTML:
```html
<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-5">
  <!-- lg:grid-cols-7 instead of lg:grid-cols-6 -->
</div>
```

## Troubleshooting

### Products Not Showing
1. Check browser console for errors
2. Verify WooCommerce API is accessible
3. Check NgRx store state in Redux DevTools
4. Ensure products exist in WooCommerce

### Icons Not Displaying
1. Check Font Awesome CDN link in `index.html`
2. Verify icon class names are correct
3. Check browser network tab for CDN loading

### Styles Not Applied
1. Run `npm start` to rebuild
2. Clear browser cache (Ctrl/Cmd + Shift + R)
3. Check Tailwind CSS is configured
4. Verify CSS file is imported in component

### Hero Not Auto-Sliding
1. Check browser console for errors
2. Verify `startSlideShow()` is called in `ngOnInit()`
3. Check if `slideInterval` is being cleared prematurely

## File Locations

```
Landing Page Files:
├── src/app/core/models/landing.model.ts       # Type definitions
├── src/app/features/home/home.component.ts    # Component logic
├── src/app/features/home/home.component.html  # Template
├── src/app/features/home/home.component.css   # Styles
├── src/index.html                             # Font Awesome CDN
└── docs/MEGAMART-LANDING-INTEGRATION.md       # Full documentation
```

## Support Resources

- **Angular Docs**: https://angular.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Font Awesome**: https://fontawesome.com/icons
- **NgRx Store**: https://ngrx.io/guide/store
- **WooCommerce API**: https://woocommerce.github.io/woocommerce-rest-api-docs/

## Next Steps

1. Start the app: `npm start`
2. Visit: `http://localhost:4200`
3. Test all sections and links
4. Customize content for your needs
5. Add real product data in WooCommerce
6. Test on mobile devices
7. Deploy to production

Happy coding! 🚀
