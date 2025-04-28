import { Routes } from '@angular/router';

export const DOCTOR_ROUTES: Routes = [
  {
    path: '',
    children: [
      // Placeholder for doctor dashboard
      {
        path: '',
        redirectTo: 'appointments',
        pathMatch: 'full'
      },
      
      // Routes will be added as components are created
      // {
      //   path: 'appointments',
      //   component: DoctorAppointmentsComponent
      // },
      // {
      //   path: 'schedule',
      //   component: ScheduleManagementComponent
      // },

      // Default fallback
      {
        path: '**',
        redirectTo: ''
      }
    ]
  }
]; 