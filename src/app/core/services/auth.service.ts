import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private api: ApiService,
    private storage: StorageService
  ) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const user = this.storage.getItem<User>('currentUser');
    if (user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(credentials: LoginRequest): Observable<any> {
    return this.api.post<{ success: boolean; message: string; user: User }>('/account/login', credentials)
      .pipe(
        tap(response => {
          if (response.success && response.user) {
            this.storage.setItem('currentUser', response.user);
            this.currentUserSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          throw error;
        })
      );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.api.post<{ success: boolean; message: string; user: User }>('/account/register', userData)
      .pipe(
        tap(response => {
          if (response.success && response.user) {
            this.storage.setItem('currentUser', response.user);
            this.currentUserSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);
          }
        }),
        catchError(error => {
          console.error('Registration error:', error);
          throw error;
        })
      );
  }

  logout(): void {
    this.storage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}