import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { VerifyDoctorComponent } from './verify-doctor/verify-doctor.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';

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
      
      // Doctor verification route
      {
        path: 'verify-doctor',
        component: VerifyDoctorComponent
      },
      
      // User management route
      {
        path: 'manage-users',
        component: ManageUsersComponent
      },

      // Default fallback
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  }
]; 