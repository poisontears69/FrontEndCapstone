import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DashboardService, DashboardData, ClinicStats } from '../services/dashboard.service';
import { Doctor } from '../models/doctor.model';
import { AppointmentService } from '../services/appointment.service';
import { Appointment, AppointmentStatus, AppointmentType, PaymentStatus } from '../models/appointment.model';
import { MessageService, Message } from '../../../core/services/message.service';

// Interfaces for dashboard metrics
interface ActivityItem {
  label: string;
  value: number;
}

interface ActivitySummary {
  totalAppointments: number;
  newPatients: number;
  completionRate: number;
}

interface RevenueSummary {
  totalRevenue: number;
  consultationRevenue: number;
  procedureRevenue: number;
  otherRevenue: number;
  trend: number;
}

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DatePipe]
})
export class DoctorDashboardComponent implements OnInit {
  isLoading = true;
  error = '';
  
  // Doctor data
  dashboardData!: DashboardData;
  doctorFullName = '';
  doctorTitle = '';
  doctorSpecialization = '';
  profilePicture = '';
  
  // Date
  currentDate = new Date();
  formattedDate = '';
  
  // Stats 
  totalPatients = 0;
  appointmentsToday = 0;
  pendingRequests = 0;
  messagesUnread = 0;
  patientTrend = 5; // Percentage growth from last month
  
  // Clinics
  clinics: ClinicStats[] = [];
  
  // Appointment related
  todayAppointments: Appointment[] = [];
  showAppointmentModal = false;
  selectedAppointment: Appointment | null = null;
  
  // Messages
  recentMessages: Message[] = [];
  
  // Activity chart
  activityPeriod: 'week' | 'month' = 'week';
  activityData: ActivityItem[] = [];
  activitySummary: ActivitySummary = {
    totalAppointments: 0,
    newPatients: 0,
    completionRate: 0
  };
  
  // Revenue stats
  revenuePeriod: 'week' | 'month' = 'week';
  revenueSummary: RevenueSummary = {
    totalRevenue: 0,
    consultationRevenue: 0,
    procedureRevenue: 0,
    otherRevenue: 0,
    trend: 0
  };
  
  // Expose Math for use in template
  Math = Math;
  
  constructor(
    private dashboardService: DashboardService,
    private appointmentService: AppointmentService,
    private messageService: MessageService,
    private datePipe: DatePipe,
    private router: Router
  ) {
    this.formattedDate = this.datePipe.transform(this.currentDate, 'EEEE, MMMM d, y') || '';
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadTodayAppointments();
    this.loadRecentMessages();
    this.loadActivityData();
    this.loadRevenueData();
  }
  
  loadDashboardData(): void {
    this.isLoading = true;
    
    this.dashboardService.getDashboardData().subscribe({
      next: (data: DashboardData) => {
        this.dashboardData = data;
        this.doctorFullName = data.doctor.fullName || 'Doctor';
        this.doctorTitle = data.doctor.title;
        this.doctorSpecialization = data.doctor.specialization;
        this.profilePicture = data.doctor.profilePicture || 'assets/images/default-doctor.png';
        
        this.totalPatients = data.totalPatients;
        this.appointmentsToday = data.todayAppointments;
        this.pendingRequests = data.pendingRequests;
        this.messagesUnread = data.unreadMessages;
        
        this.clinics = data.clinics;
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.error = 'Failed to load dashboard data. Please try again later.';
        this.isLoading = false;
        
        // For development, we'll provide mock data if there's an error
        this.provideMockData();
      }
    });
  }
  
  loadTodayAppointments(): void {
    const today = new Date().toISOString().split('T')[0];
    this.appointmentService.getAppointmentsByDate(today).subscribe({
      next: (appointments) => {
        this.todayAppointments = appointments.slice(0, 5); // Get only the first 5 appointments
      },
      error: (error) => {
        console.error('Error loading today appointments:', error);
        this.todayAppointments = []; // Set to empty array if error
      }
    });
  }
  
  loadRecentMessages(): void {
    this.messageService.getChatThreads().subscribe({
      next: (threads) => {
        // Get threads with the most recent messages
        const filteredThreads = threads
          .filter(thread => thread.lastMessage)
          .sort((a, b) => {
            const dateA = new Date(a.lastMessage?.timestamp || 0);
            const dateB = new Date(b.lastMessage?.timestamp || 0);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 3); // Get top 3 threads
          
        // Extract messages from threads
        this.recentMessages = filteredThreads
          .map(thread => thread.lastMessage!)
          .filter(message => message !== undefined);
      },
      error: (error) => {
        console.error('Error loading recent messages:', error);
        this.recentMessages = [];
      }
    });
  }
  
  loadActivityData(): void {
    const period = this.activityPeriod;
    
    // Here we would typically call an API to get this data
    // For now, we'll generate mock data
    
    if (period === 'week') {
      // Generate week activity data (last 7 days)
      const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      this.activityData = weekdays.map(day => ({
        label: day,
        value: Math.floor(Math.random() * 10) + 3 // Random value between 3-12
      }));
      
      this.activitySummary = {
        totalAppointments: this.activityData.reduce((sum, item) => sum + item.value, 0),
        newPatients: Math.floor(Math.random() * 5) + 2,
        completionRate: Math.floor(Math.random() * 20) + 80 // 80-100%
      };
    } else {
      // Generate month activity data (last 4 weeks)
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      this.activityData = weeks.map(week => ({
        label: week,
        value: Math.floor(Math.random() * 30) + 15 // Random value between 15-45
      }));
      
      this.activitySummary = {
        totalAppointments: this.activityData.reduce((sum, item) => sum + item.value, 0),
        newPatients: Math.floor(Math.random() * 15) + 5,
        completionRate: Math.floor(Math.random() * 15) + 80 // 80-95%
      };
    }
  }
  
  loadRevenueData(): void {
    const period = this.revenuePeriod;
    
    // Mock data for revenue metrics
    if (period === 'week') {
      const consultationRevenue = Math.floor(Math.random() * 15000) + 10000;
      const procedureRevenue = Math.floor(Math.random() * 25000) + 15000;
      const otherRevenue = Math.floor(Math.random() * 5000) + 1000;
      
      this.revenueSummary = {
        consultationRevenue,
        procedureRevenue,
        otherRevenue,
        totalRevenue: consultationRevenue + procedureRevenue + otherRevenue,
        trend: Math.floor(Math.random() * 20) - 5 // Random between -5 and 15
      };
    } else {
      const consultationRevenue = Math.floor(Math.random() * 50000) + 30000;
      const procedureRevenue = Math.floor(Math.random() * 80000) + 50000;
      const otherRevenue = Math.floor(Math.random() * 20000) + 5000;
      
      this.revenueSummary = {
        consultationRevenue,
        procedureRevenue,
        otherRevenue,
        totalRevenue: consultationRevenue + procedureRevenue + otherRevenue,
        trend: Math.floor(Math.random() * 25) - 5 // Random between -5 and 20
      };
    }
  }
  
  provideMockData(): void {
    this.doctorFullName = 'Dr. Jane Smith';
    this.doctorTitle = 'MD';
    this.doctorSpecialization = 'Cardiology';
    this.profilePicture = 'assets/images/default-doctor.png';
    
    this.totalPatients = 124;
    this.appointmentsToday = 8;
    this.pendingRequests = 3;
    this.messagesUnread = 5;
    
    this.clinics = [
      {
        id: '1',
        name: 'Main Street Clinic',
        imageUrl: 'assets/images/clinic1.jpg',
        patientsBooked: 5
      },
      {
        id: '2',
        name: 'Metro Health Center',
        imageUrl: 'assets/images/clinic2.jpg',
        patientsBooked: 3
      }
    ];
  }
  
  navigateToProfile(): void {
    this.router.navigate(['/doctor/profile']);
  }
  
  navigateToClinic(clinicId: string): void {
    this.router.navigate(['/doctor/clinics'], { queryParams: { id: clinicId } });
  }
  
  navigateToQueue(): void {
    this.router.navigate(['/doctor/queue']);
  }
  
  // Activity chart methods
  setActivityPeriod(period: 'week' | 'month'): void {
    this.activityPeriod = period;
    this.loadActivityData();
  }
  
  getActivityBarHeight(value: number): number {
    const maxValue = Math.max(...this.activityData.map(item => item.value));
    return (value / maxValue) * 100;
  }
  
  // Revenue stats methods
  setRevenuePeriod(period: 'week' | 'month'): void {
    this.revenuePeriod = period;
    this.loadRevenueData();
  }
  
  getRevenuePercentage(value: number): number {
    return (value / this.revenueSummary.totalRevenue) * 100;
  }
  
  // Appointment methods
  viewAppointmentDetails(appointmentId: string, event?: Event): void {
    if (event) event.stopPropagation();
    
    this.appointmentService.getAppointment(appointmentId).subscribe({
      next: (appointment) => {
        this.selectedAppointment = appointment;
        this.showAppointmentModal = true;
      },
      error: (error) => {
        console.error('Error loading appointment details:', error);
      }
    });
  }
  
  closeAppointmentModal(): void {
    this.showAppointmentModal = false;
    this.selectedAppointment = null;
  }
  
  checkInAppointment(appointmentId: string): void {
    this.updateAppointmentStatus(appointmentId, AppointmentStatus.CHECKED_IN);
  }
  
  completeAppointment(appointmentId: string): void {
    this.updateAppointmentStatus(appointmentId, AppointmentStatus.COMPLETED);
  }
  
  cancelAppointment(appointmentId: string): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.updateAppointmentStatus(appointmentId, AppointmentStatus.CANCELLED);
    }
  }
  
  updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): void {
    this.appointmentService.updateAppointmentStatus(appointmentId, status).subscribe({
      next: (appointment) => {
        // Update the local appointment data to reflect the change
        if (this.selectedAppointment && this.selectedAppointment.id === appointmentId) {
          this.selectedAppointment = appointment;
        }
        
        // Update the appointment in todayAppointments list
        const index = this.todayAppointments.findIndex(a => a.id === appointmentId);
        if (index !== -1) {
          this.todayAppointments[index] = appointment;
        }
        
        // Reload dashboard data to update counts
        this.loadDashboardData();
      },
      error: (error) => {
        console.error('Error updating appointment status:', error);
      }
    });
  }
  
  // Appointment helper methods
  canCheckIn(appointment: Appointment): boolean {
    return appointment.status === AppointmentStatus.SCHEDULED || 
           appointment.status === AppointmentStatus.CONFIRMED;
  }
  
  canComplete(appointment: Appointment): boolean {
    return appointment.status === AppointmentStatus.CHECKED_IN;
  }
  
  // Formatting and styling methods
  formatAppointmentStatus(status: AppointmentStatus | undefined): string {
    if (!status) return '';
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
  
  formatAppointmentType(type: AppointmentType | undefined): string {
    if (!type) return '';
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
  
  formatPaymentStatus(status: PaymentStatus | undefined): string {
    if (!status) return '';
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
  
  getAppointmentStatusClass(status: AppointmentStatus | undefined): string {
    if (!status) return '';
    return `status-${status.toLowerCase()}`;
  }
  
  getAppointmentTypeClass(type: AppointmentType | undefined): string {
    if (!type) return '';
    return `type-${type.toLowerCase()}`;
  }
  
  getPaymentStatusClass(status: PaymentStatus | undefined): string {
    if (!status) return '';
    return `payment-${status.toLowerCase()}`;
  }
} 