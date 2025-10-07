import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() product!: Product;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private toastr: ToastrService
  ) {}

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

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

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

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

  getMainImage(): string {
    return this.product.images && this.product.images.length > 0
      ? this.product.images[0].src
      : 'https://placeholder-image-service.onrender.com/image/400x400?prompt=Product placeholder image showing generic item&id=placeholder-001&customer_id=cus_TA1YAkwFiIX1gw';
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
}
