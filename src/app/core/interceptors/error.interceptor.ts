import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      // Don't redirect for WordPress API calls (reviews, comments)
      const isWordPressApi = req.url.includes('/wp/v2/');
      
      if (error.status === 401 && !isWordPressApi) {
        // Unauthorized - redirect to login (except for WordPress API)
        router.navigate(['/account/login']);
      } else if (error.status === 403) {
        // Forbidden
        console.error('Access forbidden');
      } else if (error.status === 404) {
        // Not found
        console.error('Resource not found');
      } else if (error.status === 500) {
        // Server error
        console.error('Server error occurred');
      }

      return throwError(() => error);
    })
  );
};