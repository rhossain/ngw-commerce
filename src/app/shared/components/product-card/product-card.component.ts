import { Component, Input, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product, ProductAttribute } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { AuthModalService } from '../../../core/services/auth-modal.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent implements OnInit {
  @Input() product!: Product;

  // Inline variant selection properties
  showVariantSelector = false;
  selectedAttributes: { [key: string]: string } = {};
  selectedVariation: any = null;
  
  // Display properties that get updated to trigger change detection
  displayPrice: string = '';
  displayRegularPrice: string = '';
  displayImage: string = '';
  displayOnSale: boolean = false;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private authModalService: AuthModalService,
    private toastr: ToastrService,
    private ngZone: NgZone
  ) {}

  // Initialize display properties
  ngOnInit(): void {
    this.updateDisplayProperties();
  }

  // Update all display properties at once
  updateDisplayProperties(): void {
    if (this.selectedVariation) {
      this.displayPrice = this.selectedVariation.on_sale && this.selectedVariation.sale_price
        ? this.selectedVariation.sale_price
        : this.selectedVariation.price;
      this.displayRegularPrice = this.selectedVariation.regular_price;
      this.displayImage = this.selectedVariation.image?.src || this.getMainProductImage();
      this.displayOnSale = this.selectedVariation.on_sale;
    } else {
      this.displayPrice = this.getPriceDisplay();
      this.displayRegularPrice = this.getRegularPriceDisplay();
      this.displayImage = this.getMainProductImage();
      this.displayOnSale = this.isOnSale();
    }
  }

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    // For variable products, use the selected variation
    if (this.isVariableProduct()) {
      this.addVariableProductToCart(event);
      return;
    }

    // For simple products
    if (!this.product.purchasable) {
      this.toastr.error('This product is not available for purchase');
      return;
    }

    this.cartService.addToCart({
      product_id: this.product.id,
      quantity: 1
    }).subscribe({
      next: () => {
        this.toastr.success('Product added to cart!');
      },
      error: (error) => {
        this.toastr.error('Failed to add product to cart');
        console.error('Add to cart error:', error);
      }
    });
  }

  addVariableProductToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.selectedVariation) {
      this.toastr.warning('Please select all product options');
      return;
    }

    if (this.selectedVariation.stock_status === 'outofstock') {
      this.toastr.error('This variation is out of stock');
      return;
    }

    this.cartService.addToCart({
      product_id: this.product.id,
      variation_id: this.selectedVariation.id,
      quantity: 1,
      variation: this.selectedAttributes
    }).subscribe({
      next: () => {
        this.toastr.success('Product added to cart!');
        // Reset selection after adding to cart
        this.showVariantSelector = false;
        this.selectedAttributes = {};
        this.selectedVariation = null;
        this.updateDisplayProperties(); // Reset display to default product
      },
      error: (error) => {
        this.toastr.error('Failed to add product to cart');
        console.error('Add to cart error:', error);
      }
    });
  }

  toggleVariantSelector(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showVariantSelector = !this.showVariantSelector;
    
    if (this.showVariantSelector) {
      // Initialize empty attributes when opening
      const attributes = this.getVariationAttributes();
      attributes.forEach(attr => {
        if (!this.selectedAttributes[attr.name]) {
          this.selectedAttributes[attr.name] = '';
        }
      });
    } else {
      // Reset selections when closing
      this.selectedAttributes = {};
      this.selectedVariation = null;
    }
  }

  onAttributeChange(attributeName: string): void {
    this.findMatchingVariation();
    
    // Force update inside Angular zone to trigger change detection
    this.ngZone.run(() => {
      this.updateDisplayProperties();
    });
  }

  findMatchingVariation(): void {
    if (!this.product.variations || this.product.variations.length === 0) {
      this.selectedVariation = null;
      return;
    }

    // Check if all required attributes are selected
    const requiredAttributes = this.getVariationAttributes();
    const allSelected = requiredAttributes.every(attr => 
      this.selectedAttributes[attr.name] && this.selectedAttributes[attr.name] !== ''
    );

    if (!allSelected) {
      this.selectedVariation = null;
      return;
    }

    // Find matching variation
    this.selectedVariation = this.product.variations.find(variation => {
      
      // Check if this variation matches all selected attributes
      const matches = requiredAttributes.every(attr => {
        const selectedValue = this.selectedAttributes[attr.name];
        
        if (!selectedValue || selectedValue === '') {
          return true; // Not selected yet, so it matches by default
        }
        
        // Find the matching attribute in the variation's attributes array
        let variationValue: string | undefined;
        
        if (Array.isArray(variation.attributes)) {
          // WooCommerce stores attributes as an array of objects: [{name: "Colors", option: "Black"}]
          const matchingAttr = variation.attributes.find((va: any) => {
            // Match by name (case-insensitive)
            return va.name && va.name.toLowerCase() === attr.name.toLowerCase();
          });
          
          if (matchingAttr) {
            variationValue = matchingAttr.option;
          }
        } else {
          // Fallback: try object keys (old format)
          const possibleKeys = [
            attr.name,
            attr.name.toLowerCase(),
            `attribute_${attr.name.toLowerCase()}`,
            `attribute_pa_${attr.name.toLowerCase().replace(/\s+/g, '-')}`,
            `pa_${attr.name.toLowerCase().replace(/\s+/g, '-')}`
          ];
          
          for (const key of possibleKeys) {
            if (variation.attributes[key] !== undefined) {
              variationValue = variation.attributes[key];
              break;
            }
          }
        }
        
        // If variation has no value or empty string, it means "any" option matches
        if (!variationValue || variationValue === '') {
          return true;
        }
        
        // Case-insensitive comparison
        return variationValue.toLowerCase() === selectedValue.toLowerCase();
      });
      
      return matches;
    }) || null;
  }

  getVariationAttributes(): ProductAttribute[] {
    if (!this.product.attributes) return [];
    return this.product.attributes.filter(attr => attr.variation);
  }

  canAddVariableToCart(): boolean {
    return !!this.selectedVariation && 
           this.selectedVariation.stock_status !== 'outofstock' &&
           this.selectedVariation.purchasable !== false;
  }

  getDisplayPrice(): string {
    console.log('getDisplayPrice called, selectedVariation:', this.selectedVariation?.id);
    // If a variation is selected, show its price
    if (this.selectedVariation) {
      const price = this.selectedVariation.on_sale && this.selectedVariation.sale_price
        ? this.selectedVariation.sale_price
        : this.selectedVariation.price;
      console.log('Returning variation price:', price);
      return price;
    }

    // Otherwise show the default price display
    const defaultPrice = this.getPriceDisplay();
    console.log('Returning default price:', defaultPrice);
    return defaultPrice;
  }

  getDisplayRegularPrice(): string {
    if (this.selectedVariation) {
      return this.selectedVariation.regular_price;
    }
    return this.getRegularPriceDisplay();
  }

  isSelectedVariationOnSale(): boolean {
    if (this.selectedVariation) {
      return this.selectedVariation.on_sale;
    }
    return this.isOnSale();
  }

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    // Check if user is authenticated
    const isAuthenticated = this.authService.getCurrentUser() !== null;
    
    if (!isAuthenticated) {
      this.toastr.info('Please login to add items to your wishlist');
      this.authModalService.open('login');
      return;
    }

    if (this.isInWishlist()) {
      this.wishlistService.removeFromWishlist(this.product.id).subscribe({
        next: () => {
          this.toastr.info('Removed from wishlist');
        },
        error: (error) => {
          this.toastr.error('Failed to update wishlist');
          console.error('Wishlist error:', error);
        }
      });
    } else {
      this.wishlistService.addToWishlist(this.product.id).subscribe({
        next: () => {
          this.toastr.success('Added to wishlist!');
        },
        error: (error) => {
          this.toastr.error('Failed to update wishlist');
          console.error('Wishlist error:', error);
        }
      });
    }
  }

  isInWishlist(): boolean {
    return this.wishlistService.isInWishlist(this.product.id);
  }

  getMainProductImage(): string {
    return this.product.images && this.product.images.length > 0
      ? this.product.images[0].src
      : 'https://placeholder-image-service.onrender.com/image/400x400?prompt=Product placeholder image showing generic item&id=placeholder-001&customer_id=cus_TA1YAkwFiIX1gw';
  }

  getMainImage(): string {
    console.log('getMainImage called, selectedVariation:', this.selectedVariation?.id);
    // If a variation is selected and has an image, show it
    if (this.selectedVariation && this.selectedVariation.image && this.selectedVariation.image.src) {
      console.log('Returning variation image:', this.selectedVariation.image.src);
      return this.selectedVariation.image.src;
    }
    
    // Otherwise show the main product image
    const defaultImage = this.product.images && this.product.images.length > 0
      ? this.product.images[0].src
      : 'https://placeholder-image-service.onrender.com/image/400x400?prompt=Product placeholder image showing generic item&id=placeholder-001&customer_id=cus_TA1YAkwFiIX1gw';
    console.log('Returning default image:', defaultImage);
    return defaultImage;
  }

  getPriceDisplay(): string {
    // For variable products, show price range
    if (this.product.type === 'variable' && this.product.variations && this.product.variations.length > 0) {
      const prices = this.product.variations
        .map(v => parseFloat(v.price))
        .filter(p => !isNaN(p) && p > 0);

      if (prices.length === 0) {
        return '0.00';
      }

      const min = Math.min(...prices).toFixed(2);
      const max = Math.max(...prices).toFixed(2);

      return min === max ? min : `${min} - ${max}`;
    }

    // For simple products
    return this.product.on_sale && this.product.sale_price 
      ? this.product.sale_price 
      : (this.product.price || this.product.regular_price || '0.00');
  }

  getRegularPriceDisplay(): string {
    // For variable products, show regular price range
    if (this.product.type === 'variable' && this.product.variations && this.product.variations.length > 0) {
      const regularPrices = this.product.variations
        .map(v => parseFloat(v.regular_price))
        .filter(p => !isNaN(p) && p > 0);

      if (regularPrices.length === 0) {
        return '0.00';
      }

      const min = Math.min(...regularPrices).toFixed(2);
      const max = Math.max(...regularPrices).toFixed(2);

      return min === max ? min : `${min} - ${max}`;
    }

    // For simple products
    return this.product.regular_price || this.product.price || '0.00';
  }

  hasValidPrice(): boolean {
    if (this.product.type === 'variable' && this.product.variations && this.product.variations.length > 0) {
      return this.product.variations.some(v => v.price && parseFloat(v.price) > 0);
    }
    
    const priceToCheck = this.product.price || this.product.regular_price;
    return !!priceToCheck && (parseFloat(priceToCheck) > 0);
  }

  isOnSale(): boolean {
    // For variable products, check if any variation is on sale
    if (this.product.type === 'variable' && this.product.variations && this.product.variations.length > 0) {
      return this.product.variations.some(v => v.on_sale);
    }
    
    return this.product.on_sale;
  }

  isVariableProduct(): boolean {
    return this.product.type === 'variable' && 
           this.product.variations && 
           this.product.variations.length > 0;
  }
}
