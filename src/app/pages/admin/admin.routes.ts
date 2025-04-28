import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      // Default route redirects to dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      
      // Dashboard route
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      },
      
      // Add additional admin routes as needed
      // {
      //   path: 'verify-doctor',
      //   component: VerifyDoctorComponent
      // },
      // {
      //   path: 'manage-users',
      //   component: ManageUsersComponent
      // },

      // Default fallback
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  }
]; 