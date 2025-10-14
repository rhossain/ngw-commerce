import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip JWT auth for these endpoints:
  // 1. Authentication endpoints (login, register)
  // 2. WooCommerce API endpoints (use consumer_key/secret instead)
  // 3. WooCommerce Store API (public access)
  const skipAuthUrls = [
    '/auth',
    '/users/register',
    '/wc/v3/',           // WooCommerce REST API
    '/wc/store/v1/',     // WooCommerce Store API
    '/wc-angular/v1/'    // Custom WooCommerce endpoints
  ];

  const shouldSkipAuth = skipAuthUrls.some(url => req.url.includes(url));

  if (shouldSkipAuth) {
    return next(req);
  }

  // Get the auth token
  const token = authService.getToken();

  // Clone the request and add the Authorization header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle the request and catch errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401 || error.status === 403) {
        // Try to refresh the token
        return authService.refreshAuthToken().pipe(
          switchMap((newToken) => {
            // Retry the original request with the new token
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // If refresh fails, logout the user
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      // Pass through other errors
      return throwError(() => error);
    })
  );
};
