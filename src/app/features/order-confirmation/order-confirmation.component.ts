import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {
  order$!: Observable<Order | null>;
  orderId!: number;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      if (this.orderId) {
        this.loadOrder();
      } else {
        this.errorMessage = 'Invalid order ID';
        this.isLoading = false;
      }
    });
  }

  loadOrder(): void {
    this.isLoading = true;
    this.order$ = this.orderService.getOrderById(this.orderId).pipe(
      catchError(error => {
        console.error('Error loading order:', error);
        this.errorMessage = 'Failed to load order details';
        this.isLoading = false;
        return of(null);
      })
    );

    this.order$.subscribe(order => {
      this.isLoading = false;
      if (!order) {
        this.errorMessage = 'Order not found';
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'on-hold': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'refunded': 'bg-purple-100 text-purple-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'pending': 'Pending Payment',
      'processing': 'Processing',
      'on-hold': 'On Hold',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'refunded': 'Refunded',
      'failed': 'Failed'
    };
    return texts[status] || status;
  }

  printOrder(): void {
    window.print();
  }

  continuesShopping(): void {
    this.router.navigate(['/products']);
  }
}
