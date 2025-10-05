import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  selectedFilter: 'all' | 'pending' | 'processing' | 'completed' | 'cancelled' = 'all';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getOrders().subscribe({
      next: (response: { success: boolean; orders: Order[] }) => {
        if (response.success) {
          this.orders = response.orders;
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  filterOrders(status: 'all' | 'pending' | 'processing' | 'completed' | 'cancelled'): void {
    this.selectedFilter = status;
  }

  get filteredOrders(): Order[] {
    if (this.selectedFilter === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.status === this.selectedFilter);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800',
      'on-hold': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  }
}