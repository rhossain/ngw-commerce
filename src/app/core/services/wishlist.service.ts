import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Product } from '../models/product.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistSubject = new BehaviorSubject<Product[]>([]);
  public wishlist$ = this.wishlistSubject.asObservable();

  constructor(
    private api: ApiService,
    private storage: StorageService
  ) {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.api.get<{ success: boolean; wishlist: Product[] }>('/wishlist')
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.wishlistSubject.next(response.wishlist);
            this.storage.setItem('wishlist', response.wishlist);
          }
        },
        error: (error) => {
          console.error('Error loading wishlist:', error);
          const cachedWishlist = this.storage.getItem<Product[]>('wishlist');
          if (cachedWishlist) {
            this.wishlistSubject.next(cachedWishlist);
          }
        }
      });
  }

  addToWishlist(productId: number): Observable<any> {
    return this.api.post('/wishlist/add', { product_id: productId }).pipe(
      tap(() => this.loadWishlist())
    );
  }

  removeFromWishlist(productId: number): Observable<any> {
    return this.api.delete(`/wishlist/remove/${productId}`).pipe(
      tap(() => this.loadWishlist())
    );
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistSubject.value.some(p => p.id === productId);
  }

  getWishlistCount(): number {
    return this.wishlistSubject.value.length;
  }
}