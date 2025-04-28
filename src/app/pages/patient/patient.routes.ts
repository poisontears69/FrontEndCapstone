import { Routes } from '@angular/router';
import { PatientLayoutComponent } from './patient-layout/patient-layout.component';
import { PatientHomeComponent } from './home/patient-home.component';

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
      
      // Routes will be added as components are created
      // {
      //   path: 'doctors',
      //   component: PatientDoctorsComponent
      // },
      // {
      //   path: 'messages',
      //   component: PatientMessagesComponent
      // },
      // {
      //   path: 'files',
      //   component: PatientFilesComponent
      // },
      // {
      //   path: 'settings',
      //   component: PatientSettingsComponent
      // },

      // Default fallback
      {
        path: '**',
        redirectTo: 'home'
      }
    ]
  }
]; 