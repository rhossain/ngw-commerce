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
    // WordPress Application Password Authentication
    // Create Application Password: WordPress Admin → Users → Your Profile → Application Passwords
    
    const authHeader = 'Basic ' + btoa(credentials.username + ':' + credentials.password);
    const wpApiUrl = 'https://woocommerce.rshossain.com/wp-json/wp/v2/users/me';
    
    // Authenticate with WordPress to verify credentials
    return this.api.http.get<any>(wpApiUrl, {
      headers: { 'Authorization': authHeader },
      withCredentials: true
    }).pipe(
      tap((wpUser: any) => {
        console.log('WordPress user authenticated:', wpUser);
        
        // Store WordPress authentication header for future requests
        this.storage.setItem('wp_auth_header', authHeader);
        
        // Store user data
        const user: User = {
          id: wpUser.id,
          email: wpUser.email || '',
          first_name: wpUser.first_name || '',
          last_name: wpUser.last_name || '',
          username: wpUser.username || credentials.username,
          billing: {
            first_name: wpUser.first_name || '',
            last_name: wpUser.last_name || '',
            address_1: '',
            city: '',
            state: '',
            postcode: '',
            country: ''
          },
          shipping: {
            first_name: wpUser.first_name || '',
            last_name: wpUser.last_name || '',
            address_1: '',
            city: '',
            state: '',
            postcode: '',
            country: ''
          }
        };
        
        this.storage.setItem('currentUser', user);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(error => {
        console.error('WordPress authentication error:', error);
        return throwError(() => new Error('Invalid WordPress credentials. Please use Application Password from WordPress Admin → Users → Your Profile'));
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