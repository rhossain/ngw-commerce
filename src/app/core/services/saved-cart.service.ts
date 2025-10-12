import { Injectable } from '@angular/core';
import { Cart } from '../models/cart.model';
import { StorageService } from './storage.service';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SavedCartService {
  private STORAGE_KEY_PREFIX = 'saved_cart_';

  constructor(private storage: StorageService, private api: ApiService) {}

  saveCartForUser(userId: number, cart: Cart): void {
    this.storage.setItem(this.key(userId), cart);
  }

  getSavedCartForUser(userId: number): Cart | null {
    return this.storage.getItem<Cart>(this.key(userId));
  }

  clearSavedCartForUser(userId: number): void {
    this.storage.removeItem(this.key(userId));
  }

  restoreSavedCart(userId: number): Cart | null {
    return this.getSavedCartForUser(userId);
  }

  // Remote sync (placeholder - backend endpoint must accept GET/POST for customer meta)
  syncToServer(userId: number, cart: Cart): Observable<boolean> {
    return this.api.post<any>(environment.savedCartSyncUrl, { userId, cart }).pipe(
      map(() => true),
      catchError(err => {
        console.warn('Failed to sync saved cart to server', err);
        return of(false);
      })
    );
  }

  fetchFromServer(userId: number): Observable<Cart | null> {
    return this.api.get<any>(`${environment.savedCartSyncUrl}?userId=${userId}`, {}, { skipLoading: true }).pipe(
      map(resp => resp?.cart || null),
      catchError(err => {
        console.warn('Failed to fetch saved cart from server', err);
        return of(null);
      })
    );
  }

  private key(userId: number): string {
    return `${this.STORAGE_KEY_PREFIX}${userId}`;
  }
}
