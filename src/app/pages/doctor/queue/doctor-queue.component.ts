import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  Appointment, 
  AppointmentStatus, 
  AppointmentType, 
  PaymentStatus,
  appointmentStatusColors,
  appointmentTypeColors
} from '../models/appointment.model';
import { AppointmentService } from '../services/appointment.service';
import { interval, Subscription } from 'rxjs';

declare var bootstrap: any; // For Bootstrap modal

@Component({
  selector: 'app-doctor-queue',
  templateUrl: './doctor-queue.component.html',
  styleUrls: ['./doctor-queue.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class DoctorQueueComponent implements OnInit, OnDestroy {
  // Expose enums to the template
  AppointmentStatus = AppointmentStatus;
  AppointmentType = AppointmentType;
  PaymentStatus = PaymentStatus;

  // Queue data
  allAppointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  todayAppointments: Appointment[] = [];
  
  // UI state
  isLoading = true;
  viewMode: 'queue' | 'timeline' = 'queue';
  expandedAppointmentId: string | null = null;
  selectedDate: Date = new Date();
  selectedStatusFilter: string | null = null;
  searchQuery: string = '';
  
  // Timeline view
  timelineHours: string[] = [];
  currentTime: Date = new Date();
  currentTimePosition: number = 0;
  private timerSubscription?: Subscription;
  
  // Add appointment form
  appointmentForm: FormGroup;
  appointmentModal: any;
  
  // Dropdown options
  statusList = Object.values(AppointmentStatus);
  appointmentTypes = Object.values(AppointmentType);
  paymentStatusOptions = Object.values(PaymentStatus);

  constructor(
    private appointmentService: AppointmentService,
    private fb: FormBuilder
  ) {
    this.initTimelineHours();
    this.appointmentForm = this.createAppointmentForm();
  }

  ngOnInit(): void {
    this.loadAppointments();
    this.setupTimers();
    this.setupModal();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  // Data loading methods
  loadAppointments(): void {
    this.isLoading = true;
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    
    this.appointmentService.getAppointmentsByDate(dateStr).subscribe({
      next: (appointments) => {
        this.allAppointments = this.sortAppointmentsByTime(appointments);
        this.applyFilters();
        this.loadTodayAppointments();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.isLoading = false;
      }
    });
  }

  loadTodayAppointments(): void {
    const today = new Date().toISOString().split('T')[0];
    
    if (this.isToday(this.selectedDate)) {
      // If selected date is today, we already have the data
      this.todayAppointments = [...this.allAppointments];
    } else {
      // Load today's appointments separately
      this.appointmentService.getAppointmentsByDate(today).subscribe({
        next: (appointments) => {
          this.todayAppointments = appointments;
        },
        error: (error) => {
          console.error('Error loading today\'s appointments:', error);
        }
      });
    }
  }

  refreshQueue(): void {
    this.loadAppointments();
  }

  // Filter and search methods
  applyFilters(): void {
    let filtered = [...this.allAppointments];
    
    // Apply status filter
    if (this.selectedStatusFilter) {
      filtered = filtered.filter(a => a.status === this.selectedStatusFilter);
    }
    
    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.patientName.toLowerCase().includes(query) || 
        a.reason?.toLowerCase().includes(query) ||
        a.type.toLowerCase().includes(query)
      );
    }
    
    this.filteredAppointments = this.sortAppointmentsByTime(filtered);
  }

  filterByStatus(status: string | null): void {
    this.selectedStatusFilter = status;
    this.applyFilters();
  }

  // Appointment actions
  updateAppointmentStatus(appointmentId: string, newStatus: AppointmentStatus, event: Event): void {
    event.stopPropagation(); // Prevent appointment collapse toggle
    
    this.appointmentService.updateAppointmentStatus(appointmentId, newStatus).subscribe({
      next: (updatedAppointment) => {
        // Update appointment in lists
        this.updateAppointmentInLists(updatedAppointment);
        
        // Reapply filters to update the view
        this.applyFilters();
      },
      error: (error) => {
        console.error(`Error updating appointment status to ${newStatus}:`, error);
      }
    });
  }

  updateAppointmentInLists(updatedAppointment: Appointment): void {
    // Update in allAppointments
    const index = this.allAppointments.findIndex(a => a.id === updatedAppointment.id);
    if (index !== -1) {
      this.allAppointments[index] = updatedAppointment;
    }
    
    // Update in todayAppointments if present
    const todayIndex = this.todayAppointments.findIndex(a => a.id === updatedAppointment.id);
    if (todayIndex !== -1) {
      this.todayAppointments[todayIndex] = updatedAppointment;
    }
  }

  // Helper methods
  getAppointmentsByStatus(status: AppointmentStatus): Appointment[] {
    return this.allAppointments.filter(a => a.status === status);
  }

  getStatusClass(status: AppointmentStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  getAppointmentTypeStyle(type: AppointmentType): { backgroundColor: string } {
    const color = appointmentTypeColors[type] || '#888';
    return { backgroundColor: color };
  }

  // UI interaction methods
  toggleAppointmentDetails(appointmentId: string): void {
    if (this.expandedAppointmentId === appointmentId) {
      this.expandedAppointmentId = null;
    } else {
      this.expandedAppointmentId = appointmentId;
    }
  }

  setViewMode(mode: 'queue' | 'timeline'): void {
    this.viewMode = mode;
  }

  previousDay(): void {
    const prevDate = new Date(this.selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    this.selectedDate = prevDate;
    this.loadAppointments();
  }

  nextDay(): void {
    const nextDate = new Date(this.selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    this.selectedDate = nextDate;
    this.loadAppointments();
  }

  selectToday(): void {
    this.selectedDate = new Date();
    this.loadAppointments();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  // Timeline methods
  initTimelineHours(): void {
    this.timelineHours = [];
    for (let i = 8; i <= 17; i++) {
      this.timelineHours.push(`${i}:00`);
    }
  }

  setupTimers(): void {
    // Update current time every minute
    this.updateCurrentTime();
    this.timerSubscription = interval(60000).subscribe(() => {
      this.updateCurrentTime();
    });
  }

  updateCurrentTime(): void {
    this.currentTime = new Date();
    
    // Calculate position for current time indicator
    const now = this.currentTime;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    // Timeline runs from 8:00 (480 mins) to 17:00 (1020 mins) - 540 mins total
    const startMinutes = 8 * 60;
    const endMinutes = 17 * 60;
    const timelineRange = endMinutes - startMinutes;
    
    // Calculate position as percentage
    if (totalMinutes < startMinutes) {
      this.currentTimePosition = 0;
    } else if (totalMinutes > endMinutes) {
      this.currentTimePosition = 100;
    } else {
      this.currentTimePosition = ((totalMinutes - startMinutes) / timelineRange) * 100;
    }
  }

  getAppointmentPosition(appointment: Appointment): number {
    const startTime = this.parseTimeToMinutes(appointment.startTime);
    const timelineStart = 8 * 60; // 8:00 AM
    const timelineEnd = 17 * 60; // 5:00 PM
    const timelineRange = timelineEnd - timelineStart;
    
    return ((startTime - timelineStart) / timelineRange) * 100;
  }

  getAppointmentWidth(appointment: Appointment): number {
    const startTime = this.parseTimeToMinutes(appointment.startTime);
    const endTime = this.parseTimeToMinutes(appointment.endTime);
    const duration = endTime - startTime;
    
    const timelineRange = (17 - 8) * 60; // 9 hours in minutes
    
    return (duration / timelineRange) * 100;
  }

  // Add walk-in appointment
  createAppointmentForm(): FormGroup {
    return this.fb.group({
      patientName: ['', Validators.required],
      startTime: [this.formatCurrentTime(), Validators.required],
      type: [AppointmentType.CONSULTATION, Validators.required],
      reason: [''],
      isNewPatient: [false],
      paymentStatus: [PaymentStatus.PENDING],
      paymentAmount: [0],
      notes: ['']
    });
  }

  setupModal(): void {
    // Wait for DOM to be ready
    setTimeout(() => {
      const modalElement = document.getElementById('addAppointmentModal');
      if (modalElement) {
        this.appointmentModal = new bootstrap.Modal(modalElement);
      }
    }, 0);
  }

  openAddAppointmentModal(): void {
    if (this.appointmentModal) {
      this.appointmentModal.show();
    }
  }

  saveAppointment(): void {
    if (this.appointmentForm.invalid) {
      return;
    }
    
    const formValue = this.appointmentForm.value;
    
    // Calculate endTime (30 minutes after startTime)
    const endTime = this.calculateEndTime(formValue.startTime);
    
    const newAppointment: Appointment = {
      id: '', // Will be assigned by the service
      patientId: `temp-${Date.now()}`, // Temporary ID for walk-ins
      patientName: formValue.patientName,
      date: this.selectedDate.toISOString().split('T')[0],
      startTime: formValue.startTime,
      endTime: endTime,
      status: AppointmentStatus.CHECKED_IN, // Default for walk-ins
      type: formValue.type,
      reason: formValue.reason,
      isNewPatient: formValue.isNewPatient,
      paymentStatus: formValue.paymentStatus,
      paymentAmount: formValue.paymentAmount,
      notes: formValue.notes
    };
    
    this.appointmentService.createAppointment(newAppointment).subscribe({
      next: (createdAppointment) => {
        // Add the new appointment to the lists
        this.allAppointments.push(createdAppointment);
        if (this.isToday(this.selectedDate)) {
          this.todayAppointments.push(createdAppointment);
        }
        
        // Apply filters to update view
        this.applyFilters();
        
        // Close the modal
        if (this.appointmentModal) {
          this.appointmentModal.hide();
        }
      },
      error: (error) => {
        console.error('Error creating appointment:', error);
      }
    });
  }

  // Utility methods
  parseTimeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  formatCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(Math.floor(now.getMinutes() / 5) * 5).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    
    let endHour = hours;
    let endMinute = minutes + 30;
    
    if (endMinute >= 60) {
      endHour += 1;
      endMinute -= 60;
    }
    
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
  }

  sortAppointmentsByTime(appointments: Appointment[]): Appointment[] {
    return [...appointments].sort((a, b) => {
      // First sort by status priority
      const statusPriority = this.getStatusPriority(a.status) - this.getStatusPriority(b.status);
      if (statusPriority !== 0) return statusPriority;
      
      // Then by time
      return this.parseTimeToMinutes(a.startTime) - this.parseTimeToMinutes(b.startTime);
    });
  }

  getStatusPriority(status: AppointmentStatus): number {
    // Define priority order for statuses (lower number = higher priority)
    const priorities: {[key in AppointmentStatus]: number} = {
      [AppointmentStatus.CHECKED_IN]: 1,
      [AppointmentStatus.CONFIRMED]: 2,
      [AppointmentStatus.SCHEDULED]: 3,
      [AppointmentStatus.COMPLETED]: 4,
      [AppointmentStatus.CANCELLED]: 5,
      [AppointmentStatus.NO_SHOW]: 6
    };
    
    return priorities[status] || 99;
  }

  getWaitingTime(appointment: Appointment): string {
    const apptTime = this.parseTime(appointment.startTime);
    const now = new Date();
    
    // If it's not for today or the appointment time is in the future
    if (!this.isToday(this.selectedDate) || now < apptTime) {
      return '';
    }
    
    const diffMs = now.getTime() - apptTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 0) return 'Soon';
    if (diffMins < 60) return `${diffMins}m`;
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  }

  parseTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(this.selectedDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  
  // Placeholder methods - to be implemented
  openPatientNotes(appointment: Appointment, event: Event): void {
    event.stopPropagation();
    alert(`Opening medical notes for ${appointment.patientName}`);
  }

  scheduleFollowUp(appointment: Appointment, event: Event): void {
    event.stopPropagation();
    alert(`Schedule follow-up for ${appointment.patientName}`);
  }

  rescheduleAppointment(appointment: Appointment, event: Event): void {
    event.stopPropagation();
    alert(`Reschedule appointment for ${appointment.patientName}`);
  }

  editAppointment(appointment: Appointment, event: Event): void {
    event.stopPropagation();
    alert(`Edit appointment for ${appointment.patientName}`);
  }
} 