# Hero Banner Component

## Overview
A reusable, standalone Angular component for displaying hero banners with auto-rotating slides, navigation controls, and customizable options.

## Location
```
src/app/shared/components/hero-banner/
├── hero-banner.component.ts      # Component logic
├── hero-banner.component.html    # Template
├── hero-banner.component.css     # Styles
└── hero-banner.model.ts          # TypeScript interfaces
```

## Features

✅ **Auto-Rotating Slides** - Automatic slide transitions with configurable delay
✅ **Manual Navigation** - Arrow buttons and clickable dots for user control  
✅ **Responsive Design** - Adapts to mobile, tablet, and desktop screens
✅ **Flexible Configuration** - Multiple input properties for customization
✅ **Background Images** - Optional background images for each slide
✅ **CTA Buttons** - Optional call-to-action buttons with routing
✅ **Decorative Elements** - Shows decorative graphics when no background image
✅ **Accessibility** - ARIA labels and keyboard navigation support
✅ **Standalone Component** - Can be used anywhere in the application

## Basic Usage

```html
<app-hero-banner 
  [slides]="heroSlides"
  [autoPlay]="true"
  [autoPlayDelay]="5000"
  [showNavigationArrows]="true"
  [showNavigationDots]="true"
  height="lg"
>
</app-hero-banner>
```

## Input Properties

### Required Inputs

| Property | Type | Description |
|----------|------|-------------|
| `slides` | `HeroSlide[]` | Array of slide objects to display |

### Optional Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `autoPlay` | `boolean` | `true` | Enable/disable automatic slide rotation |
| `autoPlayDelay` | `number` | `5000` | Delay between slides in milliseconds |
| `showNavigationArrows` | `boolean` | `true` | Show/hide arrow navigation buttons |
| `showNavigationDots` | `boolean` | `true` | Show/hide dot indicators |
| `height` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'lg'` | Predefined height options |

### Height Options

- `sm`: 16rem (256px) on mobile, 20rem (320px) on desktop
- `md`: 20rem (320px) on mobile, 24rem (384px) on desktop
- `lg`: 24rem (384px) on mobile, 500px on desktop (default)
- `xl`: 500px on mobile, 600px on desktop

## HeroSlide Interface

```typescript
export interface HeroSlide {
  id: string;           // Unique identifier
  title: string;        // Main heading
  subtitle: string;     // Text above title
  description: string;  // Text below title
  imageUrl?: string;    // Optional background image
  ctaText?: string;     // Optional CTA button text
  ctaLink?: string;     // Optional CTA button route
  active?: boolean;     // Not used (for future expansion)
}
```

## Example Implementation

### Component TypeScript

```typescript
import { Component } from '@angular/core';
import { HeroBannerComponent } from '../../shared/components/hero-banner/hero-banner.component';
import { HeroSlide } from '../../shared/components/hero-banner/hero-banner.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroBannerComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  heroSlides: HeroSlide[] = [
    {
      id: 'slide-1',
      title: 'SMART WEARABLE.',
      subtitle: 'Best Deal Online on smart watches',
      description: 'UP to 80% OFF',
      ctaText: 'Shop Now',
      ctaLink: '/products/watches'
    },
    {
      id: 'slide-2',
      title: 'PREMIUM SMARTPHONES',
      subtitle: 'Latest technology at your fingertips',
      description: 'UP to 60% OFF',
      imageUrl: 'assets/images/smartphones-hero.jpg',
      ctaText: 'Browse Phones',
      ctaLink: '/products/mobile'
    }
  ];
}
```

### Component Template

```html
<app-hero-banner 
  [slides]="heroSlides"
  [autoPlay]="true"
  [autoPlayDelay]="5000"
  height="lg"
>
</app-hero-banner>
```

## Configuration Examples

### Disable Auto-Play

```html
<app-hero-banner 
  [slides]="heroSlides"
  [autoPlay]="false"
>
</app-hero-banner>
```

### Fast Auto-Rotation (3 seconds)

```html
<app-hero-banner 
  [slides]="heroSlides"
  [autoPlay]="true"
  [autoPlayDelay]="3000"
>
</app-hero-banner>
```

### Hide Navigation Controls

```html
<app-hero-banner 
  [slides]="heroSlides"
  [showNavigationArrows]="false"
  [showNavigationDots]="false"
>
</app-hero-banner>
```

### Extra Large Height

```html
<app-hero-banner 
  [slides]="heroSlides"
  height="xl"
>
</app-hero-banner>
```

### With Background Images

```typescript
heroSlides: HeroSlide[] = [
  {
    id: 'slide-1',
    title: 'Summer Sale',
    subtitle: 'Hot Deals This Season',
    description: 'Save up to 70%',
    imageUrl: 'https://example.com/summer-banner.jpg',
    ctaText: 'Shop Now',
    ctaLink: '/sale'
  }
];
```

## Behavior

### Auto-Play
- Automatically advances to the next slide after `autoPlayDelay` milliseconds
- Pauses when user manually navigates (but resumes auto-play after interaction)
- Stops when component is destroyed (prevents memory leaks)

### Navigation
- **Arrow Buttons**: Click left/right arrows to navigate
- **Dots**: Click any dot to jump to that slide
- **Keyboard**: (Future enhancement) Arrow keys for navigation

### Responsive
- Adjusts font sizes on mobile screens
- Hides decorative elements on mobile
- Maintains aspect ratio across devices

## Styling

### Custom Gradient Background
The default gradient can be customized in `hero-banner.component.css`:

```css
.hero-gradient {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%);
}
```

### Override Styles
You can override component styles in your parent component:

```css
::ng-deep app-hero-banner .hero-gradient {
  background: linear-gradient(135deg, #ff0000 0%, #ff6600 100%);
}
```

## Accessibility

- ✅ ARIA labels on navigation buttons
- ✅ Semantic HTML structure
- ✅ Focus indicators on interactive elements
- ✅ Alt text support for background images
- ✅ Keyboard navigation (arrows and dots)

## Performance

- Uses CSS transitions for smooth animations
- Cleanup of intervals on component destroy
- Lazy loading compatible
- Optimized for mobile devices

## Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential features to add:
- [ ] Keyboard navigation (arrow keys)
- [ ] Swipe gestures for touch devices
- [ ] Video backgrounds
- [ ] Parallax scrolling effects
- [ ] Custom transition animations
- [ ] Progress bar for auto-play
- [ ] Multiple CTA buttons per slide
- [ ] Lazy loading for images

## Troubleshooting

### Slides Not Showing
- Verify `slides` array has at least one item
- Check that slide data has required properties (`id`, `title`, `subtitle`, `description`)
- Ensure component is properly imported

### Auto-Play Not Working
- Check `autoPlay` is set to `true`
- Verify there are multiple slides (auto-play skips if only 1 slide)
- Check browser console for errors

### Images Not Loading
- Verify `imageUrl` is a valid, accessible URL
- Check CORS headers if loading from external domain
- Ensure images exist at specified paths

### Navigation Not Working
- Verify `showNavigationArrows` and `showNavigationDots` are `true`
- Check that slides array has more than 1 item (navigation hides for single slide)
- Inspect browser console for JavaScript errors

## Migration from Inline Hero Banner

If you previously had hero banner code directly in your component, here's how to migrate:

**Before:**
```typescript
// In component.ts
currentSlide = 0;
private slideInterval: any;

ngOnInit() {
  this.startSlideShow();
}

ngOnDestroy() {
  clearInterval(this.slideInterval);
}

startSlideShow() { ... }
goToSlide(index: number) { ... }
prevSlide() { ... }
nextSlide() { ... }
```

**After:**
```typescript
// In component.ts - much simpler!
import { HeroBannerComponent } from '../../shared/components/hero-banner/hero-banner.component';

// Just define your slides
heroSlides: HeroSlide[] = [ ... ];
```

**Before (HTML):**
```html
<section class="...">
  <div *ngFor="let slide of heroSlides">
    <!-- 50+ lines of HTML -->
  </div>
</section>
```

**After (HTML):**
```html
<app-hero-banner [slides]="heroSlides"></app-hero-banner>
```

## Summary

The Hero Banner component is a fully-featured, reusable solution for displaying promotional content with rotating slides. It handles all the complexity of slide management, navigation, and auto-play, allowing you to focus on your content.

### Benefits:
- 🎯 **Reusable** - Use across multiple pages
- 🧹 **Clean Code** - Reduces complexity in parent components
- 🎨 **Customizable** - Multiple configuration options
- 📱 **Responsive** - Works on all devices
- ♿ **Accessible** - ARIA labels and semantic HTML
- 🚀 **Performant** - Optimized animations and cleanup
