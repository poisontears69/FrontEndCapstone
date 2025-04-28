import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AdminSidebarComponent {
  // Menu items for the admin sidebar
  menuItems = [
    {
      name: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      route: '/admin/dashboard'
    },
    {
      name: 'Verify Doctor',
      icon: 'fas fa-user-md',
      route: '/admin/verify-doctor'
    },
    {
      name: 'Manage Users',
      icon: 'fas fa-users',
      route: '/admin/manage-users'
    }
  ];
} 