import { Routes } from '@angular/router';
import { DoctorLayoutComponent } from './doctor-layout/doctor-layout.component';
import { DoctorDashboardComponent } from './dashboard/doctor-dashboard.component';
import { DoctorPatientsComponent } from './patients/doctor-patients.component';
import { DoctorSettingsComponent } from './settings/doctor-settings.component';
import { DoctorProfileComponent } from './profile/doctor-profile.component';
import { DoctorCalendarComponent } from './calendar/doctor-calendar.component';
import { DoctorMessagesComponent } from './messages/doctor-messages.component';

export const DOCTOR_ROUTES: Routes = [
  {
    path: '',
    component: DoctorLayoutComponent,
    children: [
      // Default route redirects to dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      
      // Dashboard
      {
        path: 'dashboard',
        component: DoctorDashboardComponent
      },
      
      // Appointments
      // {
      //   path: 'appointments',
      //   component: DoctorAppointmentsComponent
      // },
      
      // Patients
      {
        path: 'patients',
        component: DoctorPatientsComponent
      },
      
      // Settings
      {
        path: 'settings',
        component: DoctorSettingsComponent
      },
      
      // Profile
      {
        path: 'profile',
        component: DoctorProfileComponent
      },
      
      // Calendar
      {
        path: 'calendar',
        component: DoctorCalendarComponent
      },
      
      // Messages
      {
        path: 'messages',
        component: DoctorMessagesComponent
      },

      // Default fallback
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  }
]; 