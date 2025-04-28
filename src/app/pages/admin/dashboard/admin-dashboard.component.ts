import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AdminDashboardComponent implements OnInit {
  // Dashboard statistics
  totalUsers: number = 0;
  totalDoctors: number = 0;
  totalPatients: number = 0;
  pendingVerifications: number = 0;

  constructor() { }

  ngOnInit(): void {
    // TODO: Fetch real data from services
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Simulating API response with mock data
    // This will be replaced with actual API calls
    setTimeout(() => {
      this.totalUsers = 1250;
      this.totalDoctors = 385;
      this.totalPatients = 865;
      this.pendingVerifications = 24;
    }, 500);
  }
} 