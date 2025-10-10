import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  
  // Check if this is a Custom Reviews API request (requires WordPress auth)
  if (req.url.includes('/wp-json/custom/v1/reviews')) {
    const wpAuthHeader = storage.getItem<string>('wp_auth_header');
    
    if (wpAuthHeader) {
      // Add WordPress Authorization header
      const authReq = req.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          'Authorization': wpAuthHeader
        }
      });
      return next(authReq);
    }
  }
  
  // Default: just set content type
  const authReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
    }
  });

  return next(authReq);
};