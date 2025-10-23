import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { CartService } from './cart.service';
import { Order, CheckoutRequest, CheckoutResponse, OrderLineItem } from '../models/order.model';
import { Cart, CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(
    private api: ApiService,
    private cartService: CartService
  ) {}

  getPaymentMethods(): Observable<any> {
    // Mock payment methods for now - in production this should come from WooCommerce
    return of({
      success: true,
      payment_methods: [
        {
          id: 'cod',
          title: 'Cash on Delivery',
          description: 'Pay with cash upon delivery.',
          enabled: true
        },
        {
          id: 'bacs',
          title: 'Direct Bank Transfer',
          description: 'Make your payment directly into our bank account.',
          enabled: true
        },
        {
          id: 'cheque',
          title: 'Check Payments',
          description: 'Please send a check to Store Name, Store Street, Store Town, Store State / County, Store Postcode.',
          enabled: true
        }
      ]
    });
  }

  getShippingMethods(address: any): Observable<any> {
    // Mock shipping methods - in production this should come from WooCommerce based on shipping zones
    return of({
      success: true,
      shipping_methods: [
        {
          package_id: 0,
          name: 'Shipping',
          methods: [
            {
              id: 'flat_rate',
              method_id: 'flat_rate',
              method_title: 'Flat Rate',
              label: 'Flat Rate',
              cost: '10.00',
              description: 'Standard shipping with flat rate'
            },
            {
              id: 'free_shipping',
              method_id: 'free_shipping',
              method_title: 'Free Shipping',
              label: 'Free Shipping',
              cost: '0',
              description: 'Free shipping for orders over $100'
            },
            {
              id: 'local_pickup',
              method_id: 'local_pickup',
              method_title: 'Local Pickup',
              label: 'Local Pickup',
              cost: '0',
              description: 'Pick up from store location'
            }
          ]
        }
      ]
    });
  }

  processCheckout(checkoutData: any): Observable<CheckoutResponse> {
    // Get current cart
    const cart = (this.cartService as any).cartSubject?.value as Cart | null;
    
    if (!cart || cart.cart_items.length === 0) {
      return of({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Convert cart items to order line items
    const line_items: OrderLineItem[] = cart.cart_items.map((item: CartItem) => ({
      product_id: item.product_id,
      variation_id: item.variation_id || 0,
      quantity: item.quantity,
      name: item.product.name,
      subtotal: item.line_subtotal.toString(),
      subtotal_tax: '0.00',
      total: item.line_total.toString(),
      total_tax: '0.00',
      sku: item.product.sku,
      price: item.product.price,
      meta_data: Object.keys(item.variation || {}).map(key => ({
        key: key,
        value: item.variation[key]
      }))
    }));

    // Prepare shipping line
    const shipping_lines = checkoutData.shipping_method ? [{
      method_id: checkoutData.shipping_method.method_id,
      method_title: checkoutData.shipping_method.method_title || checkoutData.shipping_method.label,
      total: checkoutData.shipping_method.cost?.toString() || '0.00'
    }] : [];

    // Prepare order data for WooCommerce API
    const orderData = {
      payment_method: checkoutData.payment_method,
      payment_method_title: this.getPaymentMethodTitle(checkoutData.payment_method),
      set_paid: false,
      billing: checkoutData.billing,
      shipping: checkoutData.shipping,
      line_items: line_items,
      shipping_lines: shipping_lines,
      customer_note: checkoutData.order_comments || '',
      status: 'pending'
    };

    console.log('Creating order with data:', orderData);

    // Create order via WooCommerce REST API
    return this.api.post<Order>('/orders', orderData).pipe(
      map((order: Order) => ({
        success: true,
        order_id: order.id as number,
        order: order,
        message: 'Order placed successfully',
        payment_result: {
          result: 'success',
          redirect_url: order.payment_method === 'stripe' ? '/payment/stripe' : undefined
        }
      })),
      catchError(error => {
        console.error('Order creation error:', error);
        return of({
          success: false,
          message: error.error?.message || 'Failed to create order'
        });
      })
    );
  }

  private getPaymentMethodTitle(methodId: string): string {
    const methods: { [key: string]: string } = {
      'cod': 'Cash on Delivery',
      'bacs': 'Direct Bank Transfer',
      'cheque': 'Check Payments',
      'stripe': 'Credit Card (Stripe)',
      'paypal': 'PayPal'
    };
    return methods[methodId] || methodId;
  }

  getOrders(page: number = 1, perPage: number = 10): Observable<any> {
    return this.api.get(`/orders?page=${page}&per_page=${perPage}&orderby=date&order=desc`).pipe(
      map((orders: any) => ({
        success: true,
        orders: Array.isArray(orders) ? orders : []
      })),
      catchError(error => {
        console.error('Error loading orders:', error);
        return of({ success: false, orders: [] });
      })
    );
  }

  getOrderById(orderId: number): Observable<Order> {
    return this.api.get<Order>(`/orders/${orderId}`).pipe(
      catchError(error => {
        console.error('Error loading order:', error);
        throw error;
      })
    );
  }

  cancelOrder(orderId: number): Observable<any> {
    return this.api.put(`/orders/${orderId}`, { status: 'cancelled' });
  }

  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.api.put<Order>(`/orders/${orderId}`, { status });
  }
}
