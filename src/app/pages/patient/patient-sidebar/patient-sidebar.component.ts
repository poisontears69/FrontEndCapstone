import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-patient-sidebar',
  templateUrl: './patient-sidebar.component.html',
  styleUrls: ['./patient-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PatientSidebarComponent {
  // Menu items for the patient sidebar
  menuItems = [
    {
      name: 'Home',
      icon: 'fas fa-home',
      route: '/patient/home'
    },
    {
      name: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      route: '/patient/dashboard'
    },
    {
      name: 'Messages',
      icon: 'fas fa-comment-medical',
      route: '/patient/messages'
    },
    {
      name: 'Files',
      icon: 'fas fa-file-medical',
      route: '/patient/files'
    },
    {
      name: 'Profile',
      icon: 'fas fa-user',
      route: '/patient/profile'
    },
    {
      name: 'Settings',
      icon: 'fas fa-cog',
      route: '/patient/settings'
    }
  ];
} 