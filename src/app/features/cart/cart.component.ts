import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Cart, CartItem } from '../../core/models/cart.model';
import { CartService } from '../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart$: Observable<Cart | null>;
  updatingItems: Set<string> = new Set();
  couponCode = '';
  applyingCoupon = false;
Object: any;

  constructor(
    private cartService: CartService,
    private toastr: ToastrService
  ) {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit(): void {
    this.cartService.loadCart();
  }

  updateQuantity(cartItemKey: string, quantity: number): void {
    if (quantity < 1) {
      this.removeItem(cartItemKey);
      return;
    }

    this.updatingItems.add(cartItemKey);
    this.cartService.updateCartItem(cartItemKey, quantity).subscribe({
      next: () => {
        this.updatingItems.delete(cartItemKey);
        this.toastr.success('Cart updated');
      },
      error: (error) => {
        this.updatingItems.delete(cartItemKey);
        this.toastr.error('Failed to update cart');
        console.error('Update cart error:', error);
      }
    });
  }

  removeItem(cartItemKey: string): void {
    this.cartService.removeFromCart(cartItemKey).subscribe({
      next: () => {
        this.toastr.success('Item removed from cart');
      },
      error: (error) => {
        this.toastr.error('Failed to remove item');
        console.error('Remove item error:', error);
      }
    });
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.toastr.success('Cart cleared');
        },
        error: (error) => {
          this.toastr.error('Failed to clear cart');
          console.error('Clear cart error:', error);
        }
      });
    }
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) {
      this.toastr.error('Please enter a coupon code');
      return;
    }

    this.applyingCoupon = true;
    this.cartService.applyCoupon(this.couponCode).subscribe({
      next: () => {
        this.applyingCoupon = false;
        this.couponCode = '';
        this.toastr.success('Coupon applied successfully!');
      },
      error: (error) => {
        this.applyingCoupon = false;
        this.toastr.error('Invalid coupon code');
        console.error('Apply coupon error:', error);
      }
    });
  }

  removeCoupon(couponCode: string): void {
    this.cartService.removeCoupon(couponCode).subscribe({
      next: () => {
        this.toastr.success('Coupon removed');
      },
      error: (error) => {
        this.toastr.error('Failed to remove coupon');
        console.error('Remove coupon error:', error);
      }
    });
  }

  isUpdating(cartItemKey: string): boolean {
    return this.updatingItems.has(cartItemKey);
  }

  getItemSubtotal(item: CartItem): number {
    return parseFloat(item.product.price) * item.quantity;
  }
}