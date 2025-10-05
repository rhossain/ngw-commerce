import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private api: ApiService) {}

  getPaymentMethods(): Observable<any> {
    return this.api.get('/payment-methods');
  }

  getShippingMethods(address: any): Observable<any> {
    return this.api.post('/shipping-methods', { address });
  }

  processCheckout(checkoutData: any): Observable<any> {
    return this.api.post('/checkout', checkoutData);
  }

  getOrders(page: number = 1, perPage: number = 10): Observable<any> {
    return this.api.get(`/orders?page=${page}&per_page=${perPage}`);
  }

  getOrderById(orderId: number): Observable<any> {
    return this.api.get(`/orders/${orderId}`);
  }

  cancelOrder(orderId: number): Observable<any> {
    return this.api.post(`/orders/${orderId}/cancel`, {});
  }
}
