import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
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
    // Client-side login: Search for customer by email
    // Note: WooCommerce REST API doesn't have a login endpoint
    // In production, you'd use JWT authentication or WordPress REST API
    
    return this.api.get<any[]>('/customers', { email: credentials.username }).pipe(
      map(customers => {
        console.log('Customer search result:', customers);
        
        if (customers && customers.length > 0) {
          const customer = customers[0];
          
          // Client-side password storage is NOT secure
          // This is just for development/demo purposes
          const storedPassword = this.storage.getItem<string>(`password_${customer.email}`);
          
          if (storedPassword === credentials.password) {
            const user: User = {
              id: customer.id,
              email: customer.email,
              first_name: customer.first_name,
              last_name: customer.last_name,
              billing: customer.billing,
              shipping: customer.shipping,
              username: customer.email
            };
            
            this.storage.setItem('currentUser', user);
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
            
            return { success: true, user };
          } else {
            throw new Error('Invalid password');
          }
        } else {
          throw new Error('Customer not found');
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Invalid email or password'));
      })
    );
  }

  register(userData: RegisterRequest): Observable<any> {
    // Use WooCommerce customers API to create new customer
    const customerData = {
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.email, // Use email as username
      billing: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email
      },
      shipping: {
        first_name: userData.first_name,
        last_name: userData.last_name
      }
    };
    
    return this.api.post<any>('/customers', customerData).pipe(
      tap(customer => {
        console.log('Customer created:', customer);
        
        // Store password locally (NOT SECURE - for development only)
        this.storage.setItem(`password_${customer.email}`, userData.password);
        
        const user: User = {
          id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          billing: customer.billing,
          shipping: customer.shipping,
          username: customer.email
        };
        
        this.storage.setItem('currentUser', user);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }),
      map(customer => ({ 
        success: true, 
        message: 'Registration successful',
        user: customer 
      })),
      catchError(error => {
        console.error('Registration error:', error);
        
        // Handle specific WooCommerce errors
        if (error.error?.code === 'registration-error-email-exists') {
          return throwError(() => ({ 
            error: { message: 'An account with this email already exists' }
          }));
        }
        
        return throwError(() => ({ 
          error: { message: error.error?.message || 'Registration failed. Please try again.' }
        }));
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