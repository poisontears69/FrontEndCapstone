import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

interface HealthMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  date: Date;
  status: 'normal' | 'warning' | 'critical';
  change?: {
    value: number;
    direction: 'up' | 'down';
  };
}

interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar: string;
  date: Date;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

interface Activity {
  id: string;
  type: 'appointment' | 'prescription' | 'message' | 'payment' | 'document';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  providers: [DatePipe]
})
export class PatientDashboardComponent implements OnInit {
  // Current date for header
  today = new Date();
  
  // Health Metrics
  healthMetrics: HealthMetric[] = [];
  
  // Appointments
  upcomingAppointments: Appointment[] = [];
  
  // Activities
  recentActivities: Activity[] = [];
  
  // Loading States
  loadingMetrics = true;
  loadingAppointments = true;
  loadingActivities = true;
  
  // Error States
  errorMetrics = false;
  errorAppointments = false;
  errorActivities = false;
  
  constructor() {}
  
  ngOnInit(): void {
    this.loadHealthMetrics();
    this.loadUpcomingAppointments();
    this.loadRecentActivities();
  }
  
  // Load Health Metrics
  loadHealthMetrics(): void {
    // Simulate API call
    setTimeout(() => {
      this.healthMetrics = [
        {
          id: 'health-1',
          name: 'Blood Pressure',
          value: '120/80',
          unit: 'mmHg',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          status: 'normal',
          change: {
            value: 5,
            direction: 'down'
          }
        },
        {
          id: 'health-2',
          name: 'Heart Rate',
          value: '72',
          unit: 'bpm',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'normal'
        },
        {
          id: 'health-3',
          name: 'Blood Glucose',
          value: '110',
          unit: 'mg/dL',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: 'warning',
          change: {
            value: 8,
            direction: 'up'
          }
        },
        {
          id: 'health-4',
          name: 'Body Weight',
          value: '165',
          unit: 'lbs',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          status: 'normal',
          change: {
            value: 2,
            direction: 'down'
          }
        },
        {
          id: 'health-5',
          name: 'BMI',
          value: '23.5',
          unit: '',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          status: 'normal'
        },
        {
          id: 'health-6',
          name: 'Cholesterol',
          value: '210',
          unit: 'mg/dL',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          status: 'warning',
          change: {
            value: 15,
            direction: 'up'
          }
        }
      ];
      
      this.loadingMetrics = false;
    }, 1000);
  }
  
  // Load Upcoming Appointments
  loadUpcomingAppointments(): void {
    // Simulate API call
    setTimeout(() => {
      this.upcomingAppointments = [
        {
          id: 'apt-1',
          doctorName: 'Dr. Sarah Johnson',
          doctorSpecialty: 'Cardiologist',
          doctorAvatar: 'assets/avatars/avatar-2.jpg',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          status: 'upcoming',
          notes: 'Annual heart checkup'
        },
        {
          id: 'apt-2',
          doctorName: 'Dr. Michael Brown',
          doctorSpecialty: 'General Practitioner',
          doctorAvatar: 'assets/avatars/avatar-3.jpg',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          status: 'upcoming',
          notes: 'Regular health checkup'
        },
        {
          id: 'apt-3',
          doctorName: 'Dr. Emily Wilson',
          doctorSpecialty: 'Dermatologist',
          doctorAvatar: 'assets/avatars/avatar-4.jpg',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          status: 'upcoming'
        }
      ];
      
      this.loadingAppointments = false;
    }, 1200);
  }
  
  // Load Recent Activities
  loadRecentActivities(): void {
    // Simulate API call
    setTimeout(() => {
      this.recentActivities = [
        {
          id: 'activity-1',
          type: 'appointment',
          title: 'Appointment Completed',
          description: 'Checkup with Dr. John Smith',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          icon: 'fas fa-calendar-check'
        },
        {
          id: 'activity-2',
          type: 'prescription',
          title: 'Prescription Renewed',
          description: 'Lisinopril 10mg - 30 day supply',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          icon: 'fas fa-prescription'
        },
        {
          id: 'activity-3',
          type: 'message',
          title: 'Message from Dr. Wilson',
          description: 'Follow-up on your lab results',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          icon: 'fas fa-comment-medical'
        },
        {
          id: 'activity-4',
          type: 'payment',
          title: 'Payment Processed',
          description: 'Insurance claim for last visit - $25 copay',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          icon: 'fas fa-credit-card'
        },
        {
          id: 'activity-5',
          type: 'document',
          title: 'Document Uploaded',
          description: 'Lab results from Quest Diagnostics',
          timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
          icon: 'fas fa-file-medical'
        }
      ];
      
      this.loadingActivities = false;
    }, 1500);
  }
  
  // Helper Methods
  getMetricStatusClass(status: 'normal' | 'warning' | 'critical'): string {
    switch (status) {
      case 'normal': return 'status-normal';
      case 'warning': return 'status-warning';
      case 'critical': return 'status-critical';
      default: return '';
    }
  }
  
  getActivityTypeClass(type: string): string {
    switch (type) {
      case 'appointment': return 'activity-appointment';
      case 'prescription': return 'activity-prescription';
      case 'message': return 'activity-message';
      case 'payment': return 'activity-payment';
      case 'document': return 'activity-document';
      default: return '';
    }
  }
} 