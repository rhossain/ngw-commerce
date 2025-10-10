import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../../../store/app.state';
import * as ProductActions from '../../../store/actions/product.actions';
import * as ProductSelectors from '../../../store/selectors/product.selectors';
import { Product, ProductVariation } from '../../../core/models/product.model';
import { ProductReview, ReviewCreateRequest, ReviewUpdateRequest } from '../../../core/models/review.model';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ProductService } from '../../../core/services/product.service';
import { AttributeService } from '../../../core/services/attribute.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { VariationSwatchComponent, SwatchOption } from '../../../shared/components/variation-swatch/variation-swatch.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductCardComponent, VariationSwatchComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product$: Observable<Product | null>;
  loading$: Observable<boolean>;
  
  private destroy$ = new Subject<void>();

  selectedImage = 0;
  quantity = 1;
  selectedVariation: ProductVariation | null = null;
  selectedAttributes: { [key: string]: string } = {};
  
  // Image zoom properties
  isZoomed = false;
  zoomX = 0;
  zoomY = 0;
  
  relatedProducts: Product[] = [];
  reviews: ProductReview[] = [];
  productSwatches: Map<string, SwatchOption[]> = new Map();
  
  activeTab: 'description' | 'reviews' | 'additional' = 'description';

  // Review form
  newReview = {
    rating: 5,
    content: ''
  };
  
  editingReview: ProductReview | null = null;
  
  // Review UI state
  hoveredStar: number = 0;
  isSubmittingReview = false;
  currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private productService: ProductService,
    private attributeService: AttributeService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.product$ = this.store.select(ProductSelectors.selectSelectedProduct);
    this.loading$ = this.store.select(ProductSelectors.selectProductsLoading);
    
    // Get current user ID for review ownership check
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id || null;
  }

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

  ngOnDestroy(): void {
    this.store.dispatch(ProductActions.clearProductDetail());
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProductBySlug(slug: string): void {
    this.productService.getProductBySlug(slug).subscribe({
      next: (product) => {
        this.store.dispatch(ProductActions.loadProductDetailSuccess({ product }));
      },
      error: (error) => {
        this.store.dispatch(ProductActions.loadProductDetailFailure({ error }));
        this.toastr.error('Failed to load product');
      }
    });
  }

  loadRelatedProducts(productId: number): void {
    this.productService.getRelatedProducts(productId).subscribe({
      next: (products) => {
        this.relatedProducts = products;
      },
      error: (error) => {
        console.error('Error loading related products:', error);
      }
    });
  }

  loadReviews(productId: number): void {
    this.productService.getProductReviews(productId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
      }
    });
  }

  loadProductSwatches(product: Product): void {
    console.log('Loading product swatches for:', product.name);
    
    if (product.type !== 'variable' || !product.attributes || product.attributes.length === 0) {
      console.log('Product is not variable or has no attributes');
      return;
    }

    this.attributeService.getProductSwatches(product).subscribe({
      next: (swatchMap) => {
        console.log('Swatches loaded:', swatchMap);
        // Convert SwatchData to SwatchOption for component
        this.productSwatches = new Map();
        swatchMap.forEach((swatches, attributeName) => {
          const options: SwatchOption[] = swatches.map(swatch => ({
            ...swatch,
            available: true // You can check stock status here based on variations
          }));
          this.productSwatches.set(attributeName, options);
          console.log(`Swatches for ${attributeName}:`, options);
        });
      },
      error: (error) => {
        console.error('Error loading swatches:', error);
      }
    });
  }

  onSwatchSelected(attributeName: string, swatch: SwatchOption): void {
    console.log(`Swatch selected - ${attributeName}:`, swatch.name);
    this.selectedAttributes[attributeName] = swatch.name;
    console.log('Selected attributes after swatch selection:', this.selectedAttributes);
    this.findMatchingVariation();
  }

  selectImage(index: number): void {
    this.selectedImage = index;
  }

  onImageMouseEnter(): void {
    this.isZoomed = true;
  }

  onImageMouseLeave(): void {
    this.isZoomed = false;
  }

  onImageMouseMove(event: MouseEvent): void {
    if (!this.isZoomed) return;

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Calculate cursor position relative to image (0-100%)
    this.zoomX = ((event.clientX - rect.left) / rect.width) * 100;
    this.zoomY = ((event.clientY - rect.top) / rect.height) * 100;
    
    // Keep zoom within bounds
    this.zoomX = Math.max(0, Math.min(100, this.zoomX));
    this.zoomY = Math.max(0, Math.min(100, this.zoomY));
  }

  getMainImage(product: Product): string {
    // Safety check for images array
    if (!product || !product.images || product.images.length === 0) {
      return this.getPlaceholderImage();
    }
    
    // Ensure selectedImage is within bounds
    const imageIndex = this.selectedImage < product.images.length ? this.selectedImage : 0;
    return product.images[imageIndex]?.src || this.getPlaceholderImage();
  }

  getPlaceholderImage(): string {
    // Return a data URI gray placeholder to avoid external requests
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="800"%3E%3Crect width="800" height="800" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="32" fill="%239ca3af"%3ENo Image Available%3C/text%3E%3C/svg%3E';
  }

  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onAttributeChange(attributeName: string, value: string): void {
    console.log('onAttributeChange called:', attributeName, value);
    this.selectedAttributes[attributeName] = value;
    console.log('Selected attributes:', this.selectedAttributes);
    this.findMatchingVariation();
  }

  findMatchingVariation(): void {
    console.log('findMatchingVariation called');
    console.log('Current selected attributes:', this.selectedAttributes);
    
    // Get the current product synchronously
    let currentProduct: Product | null = null;
    this.product$.pipe(takeUntil(this.destroy$)).subscribe((product: Product | null) => {
      currentProduct = product;
    });

    if (!currentProduct) {
      console.log('No product available');
      this.selectedVariation = null;
      return;
    }

    // Type guard to ensure we have a Product
    const product: Product = currentProduct;

    if (!product.variations || product.variations.length === 0) {
      console.log('No variations available');
      this.selectedVariation = null;
      return;
    }

    console.log('Available variations:', product.variations);

    // Find matching variation based on selected attributes
    const matching = product.variations.find((variation: ProductVariation) => {
      console.log('Checking variation:', variation);
      console.log('Variation attributes:', variation.attributes);
      
      // Handle both array and object formats for variation attributes
      let variationAttrs: { [key: string]: string } = {};
      
      if (Array.isArray(variation.attributes)) {
        // Convert array format to object format
        // Array format: [{name: "Colors", option: "Black"}]
        variation.attributes.forEach((attr: any) => {
          if (attr.name && attr.option) {
            variationAttrs[attr.name] = attr.option;
          }
        });
        console.log('Converted array attributes to object:', variationAttrs);
      } else {
        // Already in object format: {Colors: "Black"}
        variationAttrs = variation.attributes;
      }
      
      // Check if all selected attributes match this variation
      const matches = Object.keys(this.selectedAttributes).every(key => {
        const selectedValue = this.selectedAttributes[key];
        const variationValue = variationAttrs[key];
        
        console.log(`Comparing ${key}: selected="${selectedValue}" vs variation="${variationValue}"`);
        
        // Case-insensitive comparison
        return variationValue && 
               selectedValue && 
               variationValue.toLowerCase() === selectedValue.toLowerCase();
      });
      
      console.log('Variation matches:', matches);
      return matches;
    });

    this.selectedVariation = matching || null;
    console.log('Selected variation:', this.selectedVariation);
    
    // Update the selected image if variation has an image
    if (this.selectedVariation && this.selectedVariation.image && product.images && product.images.length > 0) {
      console.log('Updating image to variation image:', this.selectedVariation.image);
      // Find the index of the variation image in the product images array
      const imageIndex = product.images.findIndex((img: any) => 
        img.id === this.selectedVariation!.image!.id
      );
      
      if (imageIndex !== -1) {
        this.selectedImage = imageIndex;
        console.log('Updated selected image index to:', imageIndex);
      } else {
        // If variation image is not in the main images array, we need to handle it differently
        // For now, keep the current image
        console.log('Variation image not found in product images array');
      }
    }
  }

  addToCart(product: Product): void {
    if (!product.purchasable) {
      this.toastr.error('This product is not available for purchase');
      return;
    }

    const request: any = {
      product_id: product.id,
      quantity: this.quantity
    };

    if (this.selectedVariation) {
      request.variation_id = this.selectedVariation.id;
      request.variation = this.selectedAttributes;
    }

    this.cartService.addToCart(request).subscribe({
      next: () => {
        this.toastr.success('Product added to cart!');
      },
      error: (error) => {
        this.toastr.error('Failed to add product to cart');
        console.error('Add to cart error:', error);
      }
    });
  }

  toggleWishlist(product: Product): void {
    if (this.isInWishlist(product.id)) {
      this.wishlistService.removeFromWishlist(product.id).subscribe({
        next: () => {
          this.toastr.info('Removed from wishlist');
        },
        error: (error) => {
          this.toastr.error('Failed to update wishlist');
        }
      });
    } else {
      this.wishlistService.addToWishlist(product.id).subscribe({
        next: () => {
          this.toastr.success('Added to wishlist!');
        },
        error: (error) => {
          this.toastr.error('Failed to update wishlist');
        }
      });
    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  submitReview(product: Product): void {
    // Get current user info
    const currentUser = this.authService.getCurrentUser();
    
    // Debug: Log user data
    console.log('Current User Object:', currentUser);
    
    // Check if user is logged in
    if (!currentUser) {
      this.toastr.warning('Please login to submit a review');
      this.router.navigate(['/account/login'], { 
        queryParams: { returnUrl: `/products/${product.slug}` }
      });
      return;
    }

    // Validation
    if (!this.newReview.content.trim()) {
      this.toastr.error('Please write a review');
      return;
    }

    this.isSubmittingReview = true;
    
    // Build reviewer name with multiple fallbacks
    let reviewerName = '';
    if (currentUser.first_name || currentUser.last_name) {
      reviewerName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();
    }
    if (!reviewerName && currentUser.username) {
      reviewerName = currentUser.username;
    }
    if (!reviewerName && currentUser.email) {
      reviewerName = currentUser.email.split('@')[0]; // Use email username part
    }
    
    // Debug: Log what we're sending
    console.log('Reviewer Name:', reviewerName);
    console.log('Reviewer Email:', currentUser.email);
    
    const reviewRequest: ReviewCreateRequest = {
      product_id: product.id,
      review: this.newReview.content,
      rating: this.newReview.rating,
      // Send user info from Angular app
      reviewer_name: reviewerName || 'Customer',
      reviewer_email: currentUser.email || 'noemail@example.com',
      first_name: currentUser.first_name || '',
      last_name: currentUser.last_name || '',
      email: currentUser.email || ''
    };
    
    // Debug: Log full request
    console.log('Review Request:', reviewRequest);

    this.productService.addProductReview(reviewRequest).subscribe({
      next: () => {
        this.toastr.success('Review submitted successfully!');
        this.newReview = { rating: 5, content: '' };
        this.hoveredStar = 0;
        this.isSubmittingReview = false;
        this.loadReviews(product.id);
      },
      error: (error) => {
        this.isSubmittingReview = false;
        const message = error.message || 'Failed to submit review. Please try again.';
        this.toastr.error(message);
        console.error('Review submission error:', error);
      }
    });
  }
  
  startEditReview(review: ProductReview): void {
    this.editingReview = review;
    this.newReview = {
      rating: review.rating,
      content: review.review
    };
    this.activeTab = 'reviews';
    // Scroll to review form
    setTimeout(() => {
      document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  updateReview(): void {
    if (!this.editingReview) return;

    if (!this.newReview.content.trim()) {
      this.toastr.error('Please write a review');
      return;
    }

    this.isSubmittingReview = true;

    const updateRequest: ReviewUpdateRequest = {
      id: this.editingReview.id,
      review: this.newReview.content,
      rating: this.newReview.rating
    };

    this.productService.updateProductReview(updateRequest).subscribe({
      next: () => {
        this.toastr.success('Review updated successfully!');
        this.cancelEdit();
        this.isSubmittingReview = false;
        this.loadReviews(this.editingReview!.product_id);
      },
      error: (error) => {
        this.isSubmittingReview = false;
        const message = error.message || 'Failed to update review. Please try again.';
        this.toastr.error(message);
        console.error('Review update error:', error);
      }
    });
  }

  cancelEdit(): void {
    this.editingReview = null;
    this.newReview = { rating: 5, content: '' };
    this.hoveredStar = 0;
  }

  deleteReview(review: ProductReview): void {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    this.productService.deleteProductReview(review.id).subscribe({
      next: () => {
        this.toastr.success('Review deleted successfully!');
        this.loadReviews(review.product_id);
        if (this.editingReview?.id === review.id) {
          this.cancelEdit();
        }
      },
      error: (error) => {
        const message = error.message || 'Failed to delete review. Please try again.';
        this.toastr.error(message);
        console.error('Review deletion error:', error);
      }
    });
  }

  canEditReview(review: ProductReview): boolean {
    return !!this.currentUserId && review.user_id === this.currentUserId;
  }

  isLoggedIn(): boolean {
    return !!this.authService.getCurrentUser();
  }
  
  // Star rating methods
  setRating(rating: number): void {
    this.newReview.rating = rating;
  }
  
  hoverStar(star: number): void {
    this.hoveredStar = star;
  }
  
  leaveStar(): void {
    this.hoveredStar = 0;
  }

  setActiveTab(tab: 'description' | 'reviews' | 'additional'): void {
    this.activeTab = tab;
  }

  getCurrentPrice(product: Product): string {
    if (this.selectedVariation) {
      return this.selectedVariation.price;
    }
    
    // For variable products without selected variation, show price range or first variation
    if (product.type === 'variable' && product.variations && product.variations.length > 0) {
      const priceRange = this.getPriceRange(product);
      if (priceRange.min === priceRange.max) {
        return priceRange.min;
      }
      return `${priceRange.min} - ${priceRange.max}`;
    }
    
    // For simple products or fallback
    return product.on_sale && product.sale_price ? product.sale_price : (product.price || product.regular_price);
  }

  getRegularPrice(product: Product): string {
    if (this.selectedVariation) {
      return this.selectedVariation.regular_price;
    }
    
    // For variable products without selected variation
    if (product.type === 'variable' && product.variations && product.variations.length > 0) {
      const regularPrices = product.variations
        .map(v => parseFloat(v.regular_price))
        .filter(p => !isNaN(p) && p > 0);
      
      if (regularPrices.length > 0) {
        const min = Math.min(...regularPrices).toFixed(2);
        const max = Math.max(...regularPrices).toFixed(2);
        return min === max ? min : `${min} - ${max}`;
      }
    }
    
    return product.regular_price || product.price || '0.00';
  }

  isOnSale(product: Product): boolean {
    if (this.selectedVariation) {
      return this.selectedVariation.on_sale;
    }
    
    // For variable products, check if any variation is on sale
    if (product.type === 'variable' && product.variations && product.variations.length > 0) {
      return product.variations.some(v => v.on_sale);
    }
    
    return product.on_sale;
  }

  getPriceRange(product: Product): { min: string; max: string } {
    if (!product.variations || product.variations.length === 0) {
      return { min: product.price || '0.00', max: product.price || '0.00' };
    }

    const prices = product.variations
      .map(v => parseFloat(v.price))
      .filter(p => !isNaN(p) && p > 0);

    if (prices.length === 0) {
      return { min: '0.00', max: '0.00' };
    }

    const min = Math.min(...prices).toFixed(2);
    const max = Math.max(...prices).toFixed(2);

    return { min, max };
  }

  hasValidPrice(product: Product): boolean {
    if (this.selectedVariation) {
      return !!this.selectedVariation.price && parseFloat(this.selectedVariation.price) > 0;
    }
    
    if (product.type === 'variable' && product.variations && product.variations.length > 0) {
      return product.variations.some(v => v.price && parseFloat(v.price) > 0);
    }
    
    return !!(product.price || product.regular_price) && 
           (parseFloat(product.price || product.regular_price) > 0);
  }

  isPriceRange(product: Product): boolean {
    if (this.selectedVariation) {
      return false;
    }
    
    if (product.type === 'variable' && product.variations && product.variations.length > 0) {
      const priceRange = this.getPriceRange(product);
      return priceRange.min !== priceRange.max;
    }
    
    return false;
  }

  getStockStatus(product: Product): string {
    if (this.selectedVariation) {
      return this.selectedVariation.stock_status;
    }
    return product.stock_status;
  }

  canAddToCart(product: Product): boolean {
    // Check if product is out of stock
    if (this.getStockStatus(product) === 'outofstock') {
      return false;
    }

    // For variable products, a variation must be selected
    if (product.type === 'variable') {
      return !!this.selectedVariation;
    }

    // For simple products, always allow (if in stock)
    return product.purchasable !== false;
  }
}
