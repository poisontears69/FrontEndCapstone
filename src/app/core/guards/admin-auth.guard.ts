import { CanActivateFn } from '@angular/router';
import { roleGuard } from './role.guard';
 
// A specialized guard for admin routes
export const adminGuard: CanActivateFn = (route, state) => {
  return roleGuard(['admin'])(route, state);
}; 