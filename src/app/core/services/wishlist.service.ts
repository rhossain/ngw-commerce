import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Product } from '../models/product.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistSubject = new BehaviorSubject<Product[]>([]);
  public wishlist$ = this.wishlistSubject.asObservable();
  
  private wishlistIdsSubject = new BehaviorSubject<number[]>([]);

  constructor(
    private api: ApiService,
    private storage: StorageService
  ) {
    this.loadWishlist();
  }

  loadWishlist(): void {
    // Load wishlist from localStorage (client-side storage)
    const wishlistIds = this.storage.getItem<number[]>('wishlistIds') || [];
    this.wishlistIdsSubject.next(wishlistIds);
    
    if (wishlistIds.length > 0) {
      // Fetch full product details for wishlist items
      this.fetchWishlistProducts(wishlistIds);
    } else {
      this.wishlistSubject.next([]);
    }
  }

  private fetchWishlistProducts(productIds: number[]): void {
    // Fetch products in batches or individually
    const productRequests = productIds.map(id => 
      this.api.get<Product>(`/products/${id}`).pipe(
        catchError(error => {
          console.error(`Error fetching product ${id}:`, error);
          return of(null);
        })
      )
    );

    // Use forkJoin to fetch all products
    if (productRequests.length > 0) {
      import('rxjs').then(rxjs => {
        rxjs.forkJoin(productRequests).subscribe((products: (Product | null)[]) => {
          const validProducts = products.filter((p): p is Product => p !== null);
          this.wishlistSubject.next(validProducts);
          this.storage.setItem('wishlist', validProducts);
        });
      });
    }
  }

  addToWishlist(productId: number): Observable<any> {
    const currentIds = this.wishlistIdsSubject.value;
    
    if (!currentIds.includes(productId)) {
      // Add to wishlist IDs
      const newIds = [...currentIds, productId];
      this.wishlistIdsSubject.next(newIds);
      this.storage.setItem('wishlistIds', newIds);
      
      // Fetch the product and add to wishlist
      return this.api.get<Product>(`/products/${productId}`).pipe(
        tap(product => {
          const currentProducts = this.wishlistSubject.value;
          this.wishlistSubject.next([...currentProducts, product]);
          this.storage.setItem('wishlist', [...currentProducts, product]);
        }),
        map(() => ({ success: true, message: 'Added to wishlist' })),
        catchError(error => {
          console.error('Error adding to wishlist:', error);
          return of({ success: false, message: 'Failed to add to wishlist' });
        })
      );
    }
    
    return of({ success: true, message: 'Already in wishlist' });
  }

  removeFromWishlist(productId: number): Observable<any> {
    const currentIds = this.wishlistIdsSubject.value;
    const newIds = currentIds.filter(id => id !== productId);
    
    this.wishlistIdsSubject.next(newIds);
    this.storage.setItem('wishlistIds', newIds);
    
    const currentProducts = this.wishlistSubject.value;
    const newProducts = currentProducts.filter(p => p.id !== productId);
    this.wishlistSubject.next(newProducts);
    this.storage.setItem('wishlist', newProducts);
    
    return of({ success: true, message: 'Removed from wishlist' });
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistIdsSubject.value.includes(productId);
  }

  getWishlistCount(): number {
    return this.wishlistIdsSubject.value.length;
  }

  clearWishlist(): Observable<any> {
    this.wishlistIdsSubject.next([]);
    this.wishlistSubject.next([]);
    this.storage.removeItem('wishlistIds');
    this.storage.removeItem('wishlist');
    
    return of({ success: true, message: 'Wishlist cleared' });
  }
}