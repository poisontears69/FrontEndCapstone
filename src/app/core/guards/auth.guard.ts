import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  // Check if the user is authenticated using the auth service
  const isAuthenticated = authService.isLoggedIn();
  
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
  
  return true;
};
 