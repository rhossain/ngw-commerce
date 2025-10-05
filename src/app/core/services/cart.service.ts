import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Cart, AddToCartRequest } from '../models/cart.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(
    private api: ApiService,
    private storage: StorageService
  ) {
    this.loadCart();
  }

  loadCart(): void {
    this.api.get<{ success: boolean; cart_items: any[]; totals: any; coupons: string[]; items_count: number; needs_shipping: boolean; needs_payment: boolean }>('/cart')
      .subscribe({
        next: (response) => {
          if (response.success) {
            const cart: Cart = {
              cart_items: response.cart_items,
              totals: response.totals,
              coupons: response.coupons,
              items_count: response.items_count,
              needs_shipping: response.needs_shipping,
              needs_payment: response.needs_payment
            };
            this.cartSubject.next(cart);
            this.storage.setItem('cart', cart);
          }
        },
        error: (error) => {
          console.error('Error loading cart:', error);
          // Load from local storage as fallback
          const cachedCart = this.storage.getItem<Cart>('cart');
          if (cachedCart) {
            this.cartSubject.next(cachedCart);
          }
        }
      });
  }

  addToCart(request: AddToCartRequest): Observable<any> {
    return this.api.post('/cart/add', request).pipe(
      tap(() => this.loadCart())
    );
  }

  updateCartItem(cartItemKey: string, quantity: number): Observable<any> {
    return this.api.put('/cart/update', { cart_item_key: cartItemKey, quantity }).pipe(
      tap(() => this.loadCart())
    );
  }

  removeFromCart(cartItemKey: string): Observable<any> {
    return this.api.delete(`/cart/remove/${cartItemKey}`).pipe(
      tap(() => this.loadCart())
    );
  }

  clearCart(): Observable<any> {
    return this.api.delete('/cart/clear').pipe(
      tap(() => this.loadCart())
    );
  }

  applyCoupon(couponCode: string): Observable<any> {
    return this.api.post('/cart/coupon', { coupon_code: couponCode }).pipe(
      tap(() => this.loadCart())
    );
  }

  removeCoupon(couponCode: string): Observable<any> {
    return this.api.delete(`/cart/coupon/${couponCode}`).pipe(
      tap(() => this.loadCart())
    );
  }

  getCartItemsCount(): number {
    return this.cartSubject.value?.items_count || 0;
  }

  getCartTotal(): string {
    return this.cartSubject.value?.totals.total || '0';
  }
}