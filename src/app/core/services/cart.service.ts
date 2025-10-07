import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Cart, CartItem, AddToCartRequest } from '../models/cart.model';
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
    // Load cart from localStorage (client-side cart management)
    // WooCommerce REST API v3 doesn't have cart endpoints
    const cachedCart = this.storage.getItem<Cart>('cart');
    if (cachedCart) {
      this.cartSubject.next(cachedCart);
    } else {
      // Initialize empty cart
      const emptyCart = this.getEmptyCart();
      this.cartSubject.next(emptyCart);
      this.storage.setItem('cart', emptyCart);
    }
  }

  private getEmptyCart(): Cart {
    return {
      cart_items: [],
      totals: {
        subtotal: '0.00',
        subtotal_tax: '0.00',
        discount_total: '0.00',
        discount_tax: '0.00',
        shipping_total: '0.00',
        shipping_tax: '0.00',
        cart_contents_total: '0.00',
        cart_contents_tax: '0.00',
        fee_total: '0.00',
        fee_tax: '0.00',
        total: '0.00',
        total_tax: '0.00'
      },
      coupons: [],
      items_count: 0,
      needs_shipping: false,
      needs_payment: false
    };
  }

  addToCart(request: AddToCartRequest): Observable<any> {
    // Client-side cart management
    // Fetch product details to add to cart
    return this.api.get<any>(`/products/${request.product_id}`).pipe(
      tap((product) => {
        const currentCart = this.cartSubject.value || this.getEmptyCart();
        
        // Check if product already exists in cart
        const existingItemIndex = currentCart.cart_items.findIndex(
          (item: CartItem) => item.product_id === request.product_id && 
                  item.variation_id === (request.variation_id || 0)
        );

        if (existingItemIndex > -1) {
          // Update quantity
          currentCart.cart_items[existingItemIndex].quantity += request.quantity;
        } else {
          // Add new item
          const price = parseFloat(product.price || '0');
          const cartItem: CartItem = {
            key: `${request.product_id}_${request.variation_id || 0}_${Date.now()}`,
            product_id: request.product_id,
            variation_id: request.variation_id || 0,
            quantity: request.quantity,
            line_total: price * request.quantity,
            line_subtotal: price * request.quantity,
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              regular_price: product.regular_price,
              sale_price: product.sale_price,
              image: product.images && product.images[0] ? product.images[0].src : '',
              permalink: product.permalink,
              sku: product.sku,
              stock_status: product.stock_status,
              manage_stock: product.manage_stock,
              stock_quantity: product.stock_quantity
            },
            variation: request.variation || {}
          };
          currentCart.cart_items.push(cartItem);
        }

        // Recalculate totals
        this.recalculateTotals(currentCart);
        
        // Save to localStorage and update subject
        this.storage.setItem('cart', currentCart);
        this.cartSubject.next(currentCart);
      })
    );
  }

  private recalculateTotals(cart: Cart): void {
    let subtotal = 0;
    let itemsCount = 0;

    cart.cart_items.forEach((item: CartItem) => {
      const price = parseFloat(item.product.price || '0');
      item.line_total = price * item.quantity;
      item.line_subtotal = price * item.quantity;
      subtotal += item.line_total;
      itemsCount += item.quantity;
    });

    cart.totals.subtotal = subtotal.toFixed(2);
    cart.totals.cart_contents_total = subtotal.toFixed(2);
    cart.totals.total = subtotal.toFixed(2);
    cart.items_count = itemsCount;
    cart.needs_payment = subtotal > 0;
  }

  updateCartItem(cartItemKey: string, quantity: number): Observable<any> {
    // Client-side update
    const currentCart = this.cartSubject.value || this.getEmptyCart();
    const itemIndex = currentCart.cart_items.findIndex((item: CartItem) => item.key === cartItemKey);
    
    if (itemIndex > -1) {
      if (quantity > 0) {
        currentCart.cart_items[itemIndex].quantity = quantity;
      } else {
        // Remove item if quantity is 0
        currentCart.cart_items.splice(itemIndex, 1);
      }
      
      this.recalculateTotals(currentCart);
      this.storage.setItem('cart', currentCart);
      this.cartSubject.next(currentCart);
    }
    
    return of({ success: true });
  }

  removeFromCart(cartItemKey: string): Observable<any> {
    // Client-side remove
    const currentCart = this.cartSubject.value || this.getEmptyCart();
    currentCart.cart_items = currentCart.cart_items.filter((item: CartItem) => item.key !== cartItemKey);
    
    this.recalculateTotals(currentCart);
    this.storage.setItem('cart', currentCart);
    this.cartSubject.next(currentCart);
    
    return of({ success: true });
  }

  clearCart(): Observable<any> {
    // Client-side clear
    const emptyCart = this.getEmptyCart();
    this.storage.setItem('cart', emptyCart);
    this.cartSubject.next(emptyCart);
    
    return of({ success: true });
  }

  applyCoupon(couponCode: string): Observable<any> {
    // For now, just store the coupon code
    // In a real app, you'd validate it with the API
    const currentCart = this.cartSubject.value || this.getEmptyCart();
    
    if (!currentCart.coupons.includes(couponCode)) {
      currentCart.coupons.push(couponCode);
      // In a real implementation, you'd apply discount here
      this.storage.setItem('cart', currentCart);
      this.cartSubject.next(currentCart);
      return of({ success: true, message: 'Coupon applied' });
    }
    
    return of({ success: false, message: 'Coupon already applied' });
  }

  removeCoupon(couponCode: string): Observable<any> {
    // Client-side coupon removal
    const currentCart = this.cartSubject.value || this.getEmptyCart();
    currentCart.coupons = currentCart.coupons.filter(c => c !== couponCode);
    
    this.storage.setItem('cart', currentCart);
    this.cartSubject.next(currentCart);
    
    return of({ success: true });
  }

  getCartItemsCount(): number {
    return this.cartSubject.value?.items_count || 0;
  }

  getCartTotal(): string {
    return this.cartSubject.value?.totals.total || '0';
  }
}