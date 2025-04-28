import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export type UserRole = 'patient' | 'doctor' | 'admin';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);
    
    // First check if the user is authenticated
    const isAuthenticated = checkIfUserIsAuthenticated();
    
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url }
      });
      return false;
    }
    
    // Then check if the user has the required role
    const userRole = getUserRole();
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirect to home page or unauthorized page if user doesn't have the required role
      router.navigate(['/']);
      return false;
    }
    
    return true;
  };
};

function checkIfUserIsAuthenticated(): boolean {
  // This is a placeholder. In a real application, you would:
  // 1. Check if there's a valid token in localStorage/sessionStorage
  // 2. Verify the token hasn't expired
  // 3. Possibly make an API call to validate the token on the server
  
  // For development, returning true to simulate an authenticated user
  return true;
}

function getUserRole(): UserRole | null {
  // This is a placeholder. In a real application, you would:
  // 1. Get the user role from the JWT token
  // 2. Or get it from a user service that stores the current user info
  
  // For development, returning 'patient' to simulate a patient user
  return 'patient';
} 