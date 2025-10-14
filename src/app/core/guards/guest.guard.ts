import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Guest Guard - Protects routes that should only be accessible to unauthenticated users
 * E.g., login and register pages
 * Redirects to profile page if user is already authenticated
 */
export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      }
      
      // Redirect authenticated users to their profile
      router.navigate(['/account/profile']);
      return false;
    })
  );
};