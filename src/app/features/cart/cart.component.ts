import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Cart, CartItem } from '../../core/models/cart.model';
import { CartService } from '../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { SavedCartService } from '../../core/services/saved-cart.service';
import { ShippingEstimateService } from '../../core/services/shipping-estimate.service';
import { environment } from '../../../environments/environment';

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

  // Configurable thresholds (could be externalized later)
  freeShippingThreshold = environment.freeShippingThreshold;
  savedCartExists = false;
  syncingSavedCart = false;

  constructor(
    private cartService: CartService,
    private toastr: ToastrService,
    private authService: AuthService,
    private savedCartService: SavedCartService,
    private shippingEstimateService: ShippingEstimateService
  ) {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit(): void {
    this.cartService.loadCart();
    const user = this.authService.getCurrentUser();
    if (user && this.savedCartService.getSavedCartForUser(user.id)) {
      this.savedCartExists = true;
    }
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

  variationKeys(variation: Record<string, any> | null | undefined): string[] {
    if (!variation) return [];
    return Object.keys(variation);
  }

  // Derived summary helpers (using current cart snapshot)
  private currentCart(): Cart | null { return (this.cartService as any).cartSubject?.value || null; }

  get itemsCount(): number { return this.currentCart()?.items_count || 0; }
  get cartSubtotal(): number { return +(this.currentCart()?.totals.subtotal || 0); }
  get discountTotal(): number { return +(this.currentCart()?.totals.discount_total || 0); }
  get total(): number { return +(this.currentCart()?.totals.total || 0); }
  get savingsPercent(): number { return this.cartSubtotal > 0 ? +( (this.discountTotal / this.cartSubtotal) * 100 ).toFixed(2) : 0; }
  get hasSavings(): boolean { return this.discountTotal > 0; }
  get qualifiesFreeShipping(): boolean { return this.cartSubtotal >= this.freeShippingThreshold; }
  get regularSubtotal(): number { return this.cartSubtotal + this.discountTotal; }
  get savingsAmount(): number { return this.discountTotal; }
  get estimatedShipping(): number { return this.shippingEstimateService.estimate(this.cartSubtotal); }

  saveForLater(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.toastr.error('Please log in to save your cart');
      return;
    }
    const cart = this.currentCart();
    if (!cart || cart.cart_items.length === 0) {
      this.toastr.info('Cart is empty');
      return;
    }
    this.savedCartService.saveCartForUser(user.id, cart);
    this.savedCartExists = true;
    this.toastr.success('Cart saved for later');
    this.syncingSavedCart = true;
    this.savedCartService.syncToServer(user.id, cart).subscribe(() => this.syncingSavedCart = false);
  }

  restoreSavedCart(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    const saved = this.savedCartService.restoreSavedCart(user.id);
    if (!saved) {
      this.toastr.info('No saved cart found');
      return;
    }
    // Replace current cart in storage directly
    (this.cartService as any).cartSubject.next(saved);
    localStorage.setItem('cart', JSON.stringify(saved));
    this.toastr.success('Saved cart restored');
  }

  clearSavedCart(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    this.savedCartService.clearSavedCartForUser(user.id);
    this.savedCartExists = false;
    this.toastr.success('Saved cart cleared');
  }
}