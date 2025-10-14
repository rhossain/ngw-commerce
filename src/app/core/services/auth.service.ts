// Temporary auth service - to be moved to proper location
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject, timer, of } from 'rxjs';
import { tap, catchError, switchMap, map, filter, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';
import * as AuthActions from '../../store/actions/auth.actions';
import { selectIsLoggedIn, selectShouldRefreshToken, selectCurrentUser } from '../../store/selectors/auth.selectors';

interface AuthResponse {
  success: boolean;
  data: { jwt: string; refresh_token?: string; expires_in?: number; };
}

interface ValidateResponse {
  success: boolean;
  data: { user: User; };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  private storage = inject(StorageService);
  private store = inject(Store);
  private router = inject(Router);
  
  isAuthenticated$ = this.store.select(selectIsLoggedIn);
  currentUser$ = this.store.select(selectCurrentUser);
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private isRefreshingToken = false;

  constructor() {
    this.initializeAuth();
    this.setupAutoRefresh();
  }

  private initializeAuth(): void {
    const token = this.getStoredToken();
    const storedUser = this.getStoredUser();
    if (token) {
      const fallbackIdentifier = storedUser?.email || storedUser?.username || undefined;
      this.store.dispatch(AuthActions.validateToken());
      this.fetchUserData(token, fallbackIdentifier).subscribe({
        next: (user) => {
          this.storeUser(user);
          this.store.dispatch(AuthActions.validateTokenSuccess({ user }));
        },
        error: () => this.clearAuthData()
      });
    }
  }

  private setupAutoRefresh(): void {
    if (!environment.auth.autoRefresh) return;
    timer(0, 60000).pipe(
      switchMap(() => this.store.select(selectShouldRefreshToken).pipe(take(1))),
      filter(shouldRefresh => shouldRefresh)
    ).subscribe(() => {
      this.refreshAuthToken().subscribe({ error: () => this.logout() });
    });
  }

  login(credentials: LoginRequest): Observable<{ user: User; token: string }> {
    this.store.dispatch(AuthActions.login({ credentials }));
    const loginUrl = `${environment.apiUrl}${environment.auth.baseUrl}${environment.auth.endpoints.login}`;

    // Simple JWT Login accepts either `email` or `username`. Our form captures an email,
    // but we support both for flexibility.
    const loginPayload: Record<string, string> = {
      password: credentials.password
    };
    if (credentials.username?.includes('@')) {
      loginPayload['email'] = credentials.username;
    } else {
      loginPayload['username'] = credentials.username;
    }

    return this.http.post<AuthResponse>(loginUrl, loginPayload).pipe(
      switchMap((response) => {
        if (!response.success || !response.data.jwt) {
          return throwError(() => new Error('Invalid login response'));
        }
        const token = response.data.jwt;
        const refreshToken = response.data.refresh_token;
        const expiresIn = response.data.expires_in;
        
        // Store token first so interceptor can use it
        this.storeToken(token);
        if (refreshToken) this.storeRefreshToken(refreshToken);
        if (expiresIn) this.storeTokenExpiry(expiresIn);
        
        // Fetch user data using Simple JWT validation + WooCommerce profile
        return this.fetchUserData(token, credentials.username).pipe(
          map(user => {
            this.storeUser(user);
            this.store.dispatch(AuthActions.loginSuccess({ user, token, refreshToken, expiresIn }));
            return { user, token };
          })
        );
      }),
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        this.store.dispatch(AuthActions.loginFailure({ error: errorMessage }));
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  register(userData: RegisterRequest): Observable<{ user: User; token: string }> {
    this.store.dispatch(AuthActions.register({ userData }));
    
    // Use WordPress native user creation API (requires WooCommerce)
    // This creates a customer account which can then be used for login
    const registerUrl = `${environment.apiUrl}/wc/v3/customers`;
    
    // Prepare customer data for WooCommerce API
    const customerData = {
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.email,
      password: userData.password,
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

    // Create customer using WooCommerce API with consumer credentials
    return this.http.post<any>(registerUrl, customerData, {
      params: {
        consumer_key: environment.consumerKey,
        consumer_secret: environment.consumerSecret
      }
    }).pipe(
      switchMap(() => {
        // After successful registration, log the user in with JWT
        return this.login({ username: userData.email, password: userData.password });
      }),
      tap(({ user, token }) => {
        this.store.dispatch(AuthActions.registerSuccess({ user, token }));
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Registration failed. Please try again.';
        
        // Handle specific WooCommerce errors
        if (error.error?.code === 'registration-error-email-exists') {
          errorMessage = 'An account with this email already exists.';
        } else if (error.error?.code === 'registration-error-username-exists') {
          errorMessage = 'This email is already registered.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.store.dispatch(AuthActions.registerFailure({ error: errorMessage }));
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  refreshAuthToken(): Observable<string> {
    if (this.isRefreshingToken) {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1)
      ) as Observable<string>;
    }
    this.isRefreshingToken = true;
    this.refreshTokenSubject.next(null);
    this.store.dispatch(AuthActions.refreshToken());
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    const refreshUrl = `${environment.apiUrl}${environment.auth.baseUrl}${environment.auth.endpoints.refresh}`;
    return this.http.post<AuthResponse>(refreshUrl, { refresh_token: refreshToken }).pipe(
      tap((response) => {
        if (response.success && response.data.jwt) {
          const newToken = response.data.jwt;
          const expiresIn = response.data.expires_in;
          this.storeToken(newToken);
          if (expiresIn) this.storeTokenExpiry(expiresIn);
          this.store.dispatch(AuthActions.refreshTokenSuccess({ token: newToken, expiresIn }));
          this.refreshTokenSubject.next(newToken);
          this.isRefreshingToken = false;
        }
      }),
      map(response => response.data.jwt),
      catchError((error) => {
        this.isRefreshingToken = false;
        this.store.dispatch(AuthActions.refreshTokenFailure({ error }));
        this.logout();
        return throwError(() => error);
      })
    );
  }

  validateToken(token?: string): Observable<boolean> {
    const authToken = token || this.getStoredToken();
    if (!authToken) return of(false);
    const validateUrl = `${environment.apiUrl}${environment.auth.baseUrl}${environment.auth.endpoints.validate}`;
    return this.http.post<ValidateResponse>(validateUrl, { jwt: authToken }).pipe(
      map(response => response.success),
      catchError(() => of(false))
    );
  }

  private fetchUserData(token: string, identifier?: string): Observable<User> {
    if (identifier) {
      return this.fetchWooCustomerByEmail(identifier).pipe(
        catchError(() => this.fetchUserViaValidate(token, identifier))
      );
    }
    return this.fetchUserViaValidate(token);
  }

  private fetchUserViaValidate(token: string, identifier?: string): Observable<User> {
    const validateUrl = `${environment.apiUrl}${environment.auth.baseUrl}${environment.auth.endpoints.validate}`;
    return this.http.post<ValidateResponse>(validateUrl, { jwt: token }).pipe(
      switchMap((response) => {
        if (response.success) {
          const extractedUser = response.data?.user;
          const email = this.extractEmail(extractedUser) || identifier;

          if (email) {
            return this.fetchWooCustomerByEmail(email).pipe(
              catchError(() => {
                if (extractedUser) {
                  return of(this.normalizeWordPressUser(extractedUser));
                }
                return throwError(() => new Error('Customer profile not found'));
              })
            );
          }

          if (extractedUser) {
            return of(this.normalizeWordPressUser(extractedUser));
          }
        }

        if (identifier) {
          return this.fetchWooCustomerByEmail(identifier);
        }

        return throwError(() => new Error('Failed to validate token'));
      }),
      catchError((error: HttpErrorResponse) => {
        if (identifier) {
          return this.fetchWooCustomerByEmail(identifier);
        }
        console.error('Failed to validate token:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to validate token'));
      })
    );
  }

  private fetchWooCustomerByEmail(email: string): Observable<User> {
    return this.api.get<any[]>(`/customers`, { email }).pipe(
      map((customers) => {
        if (!customers || !customers.length) {
          throw new Error('Customer profile not found');
        }
        return this.normalizeWooCustomer(customers[0]);
      })
    );
  }

  private normalizeWooCustomer(customer: any): User {
    return {
      id: customer?.id,
      email: customer?.email,
      username: customer?.username || customer?.email,
      first_name: customer?.first_name || '',
      last_name: customer?.last_name || '',
      display_name: customer?.username || `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim() || customer?.email,
      role: Array.isArray(customer?.role) ? customer.role[0] : customer?.role,
      billing: customer?.billing,
      shipping: customer?.shipping
    };
  }

  private normalizeWordPressUser(user: any): User {
    return {
      id: user?.id || user?.ID,
      email: user?.email || user?.user_email,
      username: user?.username || user?.user_login,
      first_name: user?.first_name || user?.name || '',
      last_name: user?.last_name || '',
      display_name: user?.display_name || user?.name,
      role: Array.isArray(user?.roles) ? user.roles[0] : user?.role,
      billing: user?.billing,
      shipping: user?.shipping
    } as User;
  }

  private extractEmail(user: any): string | undefined {
    return user?.email || user?.user_email || user?.data?.user_email;
  }

  logout(): void {
    const token = this.getStoredToken();
    const refreshToken = this.getStoredRefreshToken();
    if (token) {
      const revokeUrl = `${environment.apiUrl}${environment.auth.baseUrl}${environment.auth.endpoints.revoke}`;
      const payload: Record<string, string> = { jwt: token };
      if (refreshToken) {
        payload['refresh_token'] = refreshToken;
      }

      this.http.post(revokeUrl, payload).pipe(
        catchError((error: HttpErrorResponse) => {
          console.warn('Token revoke failed (continuing logout):', error.error ?? error.message);
          return of(null);
        })
      ).subscribe();
    }
    this.clearAuthData();
    this.store.dispatch(AuthActions.logout());
    this.router.navigate(['/account/login']);
  }

  private clearAuthData(): void {
    this.storage.removeItem(environment.auth.storage.tokenKey);
    this.storage.removeItem(environment.auth.storage.refreshTokenKey);
    this.storage.removeItem(environment.auth.storage.userKey);
    this.storage.removeItem(environment.auth.storage.tokenExpiryKey);
  }

  getStoredToken(): string | null {
    return this.storage.getItem<string>(environment.auth.storage.tokenKey);
  }

  private storeToken(token: string): void {
    this.storage.setItem(environment.auth.storage.tokenKey, token);
  }

  private getStoredRefreshToken(): string | null {
    return this.storage.getItem<string>(environment.auth.storage.refreshTokenKey);
  }

  private storeRefreshToken(token: string): void {
    this.storage.setItem(environment.auth.storage.refreshTokenKey, token);
  }

  private getStoredUser(): User | null {
    return this.storage.getItem<User>(environment.auth.storage.userKey);
  }

  private storeUser(user: User): void {
    this.storage.setItem(environment.auth.storage.userKey, user);
  }

  private storeTokenExpiry(expiresIn: number): void {
    const expiry = Date.now() + (expiresIn * 1000);
    this.storage.setItem(environment.auth.storage.tokenExpiryKey, expiry);
  }

  getCurrentUser(): User | null {
    return this.getStoredUser();
  }

  getToken(): string | null {
    return this.getStoredToken();
  }
}
