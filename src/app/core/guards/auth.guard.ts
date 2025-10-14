import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard - Protects routes that require authentication
 * Checks if user is authenticated via NgRx store
 * Redirects to login page if not authenticated
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }
      
      // Store the attempted URL for redirecting after login
      const returnUrl = router.url;
      router.navigate(['/account/login'], { 
        queryParams: { returnUrl } 
      });
      return false;
    })
  );
};