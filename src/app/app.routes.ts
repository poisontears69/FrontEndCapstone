import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Common routes
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  
  // Patient routes
  { 
    path: 'patient', 
    canActivate: [authGuard, roleGuard(['patient'])],
    loadChildren: () => import('./pages/patient/patient.routes')
      .then(m => m.PATIENT_ROUTES) 
  },
  
  // Doctor routes
  { 
    path: 'doctor', 
    canActivate: [authGuard, roleGuard(['doctor'])],
    loadChildren: () => import('./pages/doctor/doctor.routes')
      .then(m => m.DOCTOR_ROUTES) 
  },
  
  // Admin routes
  { 
    path: 'admin', 
    canActivate: [authGuard, roleGuard(['admin'])],
    loadChildren: () => import('./pages/admin/admin.routes')
      .then(m => m.ADMIN_ROUTES) 
  },
  
  // Authentication routes
  { 
    path: 'auth', 
    loadChildren: () => import('./pages/auth/auth.routes')
      .then(m => m.AUTH_ROUTES) 
  },
  
  // Fallback route
  { path: '**', redirectTo: 'home' }
];
