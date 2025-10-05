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
}