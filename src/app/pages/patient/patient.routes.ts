import { Routes } from '@angular/router';

export const PATIENT_ROUTES: Routes = [
  {
    path: '',
    children: [
      // Placeholder for patient dashboard
      {
        path: '',
        redirectTo: 'appointments',
        pathMatch: 'full'
      },
      
      // Routes will be added as components are created
      // {
      //   path: 'book-appointment',
      //   component: BookAppointmentComponent
      // },
      // {
      //   path: 'appointments',
      //   component: PatientAppointmentsComponent
      // },

      // Default fallback
      {
        path: '**',
        redirectTo: ''
      }
    ]
  }
]; 