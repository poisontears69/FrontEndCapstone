import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export type UserRole = 'patient' | 'doctor' | 'admin';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    
    // First check if the user is authenticated
    const isAuthenticated = authService.isLoggedIn();
    
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url }
      });
      return false;
    }
    
    // Then check if the user has the required role
    const userRole = authService.currentUserValue?.role as UserRole;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirect based on user role
      if (authService.currentUserValue?.role === 'patient') {
        router.navigate(['/patient']);
      } else if (authService.currentUserValue?.role === 'doctor') {
        router.navigate(['/doctor']);
      } else if (authService.currentUserValue?.role === 'admin') {
        router.navigate(['/admin']);
      } else {
        // Default fallback
        router.navigate(['/']);
      }
      return false;
    }
    
    return true;
  };
};