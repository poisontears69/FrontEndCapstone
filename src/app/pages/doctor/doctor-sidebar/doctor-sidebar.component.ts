import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-doctor-sidebar',
  templateUrl: './doctor-sidebar.component.html',
  styleUrls: ['./doctor-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DoctorSidebarComponent {
  // Menu items for the doctor sidebar
  menuItems = [
    {
      name: 'Dashboard',
      icon: 'fas fa-chart-line',
      route: '/doctor/dashboard'
    },
    {
      name: 'Calendar',
      icon: 'fas fa-calendar-alt',
      route: '/doctor/calendar'
    },
    {
      name: 'Queue',
      icon: 'fas fa-users',
      route: '/doctor/queue'
    },
    {
      name: 'Patients',
      icon: 'fas fa-hospital-user',
      route: '/doctor/patients'
    },
    {
      name: 'Messages',
      icon: 'fas fa-comment-medical',
      route: '/doctor/messages'
    },
    {
      name: 'Profile',
      icon: 'fas fa-user-md',
      route: '/doctor/profile'
    },
    {
      name: 'Clinics',
      icon: 'fas fa-clinic-medical',
      route: '/doctor/clinics'
    },
    {
      name: 'Settings',
      icon: 'fas fa-cog',
      route: '/doctor/settings'
    }
  ];
} 