import { Routes } from '@angular/router';
import { PatientLayoutComponent } from './patient-layout/patient-layout.component';
import { PatientHomeComponent } from './home/patient-home.component';
import { PatientMessagesComponent } from './messages/patient-messages.component';

export const PATIENT_ROUTES: Routes = [
  {
    path: '',
    component: PatientLayoutComponent,
    children: [
      // Default route redirects to home
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      
      // Home route
      {
        path: 'home',
        component: PatientHomeComponent
      },
      
      // Messages route
      {
        path: 'messages',
        component: PatientMessagesComponent
      },
      
      // Dashboard route
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent)
      },
      
      // Files route
      {
        path: 'files',
        loadComponent: () => import('./files/patient-files.component').then(m => m.PatientFilesComponent)
      },
      
      // Profile route
      {
        path: 'profile',
        loadComponent: () => import('./profile/patient-profile.component').then(m => m.PatientProfileComponent)
      },
      
      // Settings route
      {
        path: 'settings',
        loadComponent: () => import('./settings/patient-settings.component').then(m => m.PatientSettingsComponent)
      },
      
      // Doctors route
      {
        path: 'doctors',
        loadComponent: () => import('./doctors/patient-doctors.component').then(m => m.PatientDoctorsComponent)
      },

      // Default fallback
      {
        path: '**',
        redirectTo: 'home'
      }
    ]
  }
]; 