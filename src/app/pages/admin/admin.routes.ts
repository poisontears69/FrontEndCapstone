import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    children: [
      // Placeholder for admin dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      
      // Routes will be added as components are created
      // {
      //   path: 'dashboard',
      //   component: AdminDashboardComponent
      // },
      // {
      //   path: 'users',
      //   component: UserManagementComponent
      // },

      // Default fallback
      {
        path: '**',
        redirectTo: ''
      }
    ]
  }
]; 