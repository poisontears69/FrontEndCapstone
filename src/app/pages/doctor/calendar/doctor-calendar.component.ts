import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../services/appointment.service';
import { 
  Appointment, 
  AppointmentStatus, 
  AppointmentType, 
  PaymentStatus,
  appointmentStatusColors,
  appointmentTypeColors
} from '../models/appointment.model';
import { ClinicService } from '../services/clinic.service';
import { PatientService } from '../services/patient.service';
import { Patient } from '../models/patient.model';
import { Clinic } from '../models/clinic.model';

interface CalendarDay {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointmentCount: number;
  appointments?: Appointment[];
}

interface WeekViewDay {
  date: string;
  dayName: string;
  isToday: boolean;
}

@Component({
  selector: 'app-doctor-calendar',
  templateUrl: './doctor-calendar.component.html',
  styleUrls: ['./doctor-calendar.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class DoctorCalendarComponent implements OnInit {
  // Calendar state
  currentDate: Date = new Date();
  selectedDate: string = '';
  selectedViewMode: 'day' | 'week' | 'month' = 'month';
  
  // Calendar display data
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: CalendarDay[][] = [];
  timeSlots: string[] = [];
  weekViewDays: WeekViewDay[] = [];
  weekStartDate: Date = new Date();
  weekEndDate: Date = new Date();
  
  // Appointment data
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  selectedAppointmentId: string = '';
  selectedAppointment: Appointment | null = null;
  
  // UI state
  isLoading = false;
  error: string = '';
  showAppointmentModal = false;
  showCreateModal = false;
  isEditMode = false;
  formSubmitted = false;
  
  // Filter state
  searchTerm: string = '';
  statusFilter: string = 'all';
  typeFilter: string = 'all';
  clinicFilter: string = 'all';
  
  // Form state
  appointmentForm: FormGroup;
  
  // Dropdown options
  appointmentStatuses = Object.values(AppointmentStatus);
  appointmentTypes = Object.values(AppointmentType);
  paymentStatuses = Object.values(PaymentStatus);
  patients: { id: string, name: string }[] = [];
  clinics: { id: string, name: string }[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private clinicService: ClinicService,
    private patientService: PatientService,
    private fb: FormBuilder
  ) {
    this.appointmentForm = this.createAppointmentForm();
    this.initializeTimeSlots();
  }

  ngOnInit(): void {
    this.loadData();
    this.selectDate(this.formatDate(this.currentDate));
    this.generateCalendar();
    this.generateWeekView();
  }

  // Initialization methods
  initializeTimeSlots(): void {
    // Generate time slots from 8:00 AM to 6:00 PM
    for (let hour = 8; hour <= 18; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  }

  createAppointmentForm(): FormGroup {
    return this.fb.group({
      patientId: ['', Validators.required],
      patientName: [''],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      type: ['', Validators.required],
      clinicId: ['', Validators.required],
      clinicName: [''],
      reason: [''],
      notes: [''],
      isNewPatient: [false],
      paymentStatus: [PaymentStatus.PENDING],
      paymentAmount: [0]
    });
  }

  // Data loading methods
  loadData(): void {
    this.isLoading = true;
    this.error = '';

    // Load patients for the dropdown
    this.patientService.getPatients().subscribe({
      next: (patients: Patient[]) => {
        this.patients = patients.map(p => ({
          id: p.id,
          name: p.fullName
        }));
      },
      error: (error) => {
        console.error('Error loading patients:', error);
      }
    });

    // Load clinics for the dropdown
    this.clinicService.getClinics().subscribe({
      next: (clinics: Clinic[]) => {
        this.clinics = clinics.map(c => ({
          id: c.id!,
          name: c.name
        }));
      },
      error: (error) => {
        console.error('Error loading clinics:', error);
      }
    });

    // Load appointments for the current month
    const startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    
    this.loadAppointmentsByDateRange(
      this.formatDate(startDate),
      this.formatDate(endDate)
    );
  }

  loadAppointmentsByDateRange(startDate: string, endDate: string): void {
    this.isLoading = true;
    
    this.appointmentService.getAppointmentsByDateRange(startDate, endDate).subscribe({
      next: (appointments: Appointment[]) => {
        this.appointments = appointments;
        this.applyFilters();
        this.updateCalendarAppointments();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.error = 'Failed to load appointments. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadAppointmentsByDate(date: string): void {
    this.isLoading = true;
    
    this.appointmentService.getAppointmentsByDate(date).subscribe({
      next: (appointments: Appointment[]) => {
        // Merge with existing appointments or replace
        const existingDates = new Set(this.appointments.map(a => a.date));
        if (!existingDates.has(date)) {
          this.appointments = [...this.appointments, ...appointments];
        }
        
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error(`Error loading appointments for date ${date}:`, error);
        this.error = 'Failed to load appointments. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Calendar generation methods
  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Previous month's days to show
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    // Build the calendar grid (6 weeks maximum)
    this.calendarDays = [];
    let dayCounter = 1;
    let nextMonthCounter = 1;
    
    for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
      const week: CalendarDay[] = [];
      
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        if (weekIndex === 0 && dayIndex < startingDayOfWeek) {
          // Previous month days
          const prevMonthDay = prevMonthLastDay - (startingDayOfWeek - dayIndex - 1);
          const date = new Date(year, month - 1, prevMonthDay);
          
          week.push(this.createCalendarDay(date, false));
        } else if (dayCounter <= totalDays) {
          // Current month days
          const date = new Date(year, month, dayCounter);
          week.push(this.createCalendarDay(date, true));
          dayCounter++;
        } else {
          // Next month days
          const date = new Date(year, month + 1, nextMonthCounter);
          week.push(this.createCalendarDay(date, false));
          nextMonthCounter++;
        }
      }
      
      this.calendarDays.push(week);
      
      // If we've already filled all the days and we're at the end of a week, break
      if (dayCounter > totalDays && weekIndex >= 3) {
        break;
      }
    }
    
    this.updateCalendarAppointments();
  }

  generateWeekView(): void {
    // Calculate the start of the week (Sunday)
    const startDate = new Date(this.currentDate);
    startDate.setDate(this.currentDate.getDate() - this.currentDate.getDay());
    
    // Calculate the end of the week (Saturday)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    this.weekStartDate = new Date(startDate);
    this.weekEndDate = new Date(endDate);
    
    // Generate the week view days
    this.weekViewDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      this.weekViewDays.push({
        date: this.formatDate(date),
        dayName: this.weekDays[i],
        isToday: date.getTime() === today.getTime()
      });
    }
    
    // Load appointments for this week if we don't have them already
    this.loadAppointmentsByDateRange(
      this.formatDate(startDate),
      this.formatDate(endDate)
    );
  }

  createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      date: this.formatDate(date),
      dayNumber: date.getDate(),
      isCurrentMonth,
      isToday: date.getTime() === today.getTime(),
      appointmentCount: 0,
      appointments: []
    };
  }

  updateCalendarAppointments(): void {
    // Reset appointment counts
    this.calendarDays.forEach(week => {
      week.forEach(day => {
        day.appointmentCount = 0;
        day.appointments = [];
      });
    });
    
    // Count appointments for each day
    this.appointments.forEach(appointment => {
      // Find the day in the calendar
      for (const week of this.calendarDays) {
        for (const day of week) {
          if (day.date === appointment.date) {
            day.appointmentCount++;
            
            // Add appointment to the day
            if (!day.appointments) day.appointments = [];
            day.appointments.push(appointment);
            break;
          }
        }
      }
    });
  }

  // Navigation methods
  navigatePrevious(): void {
    if (this.selectedViewMode === 'month') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
      this.generateCalendar();
      this.loadData();
    } else if (this.selectedViewMode === 'week') {
      this.currentDate = new Date(this.currentDate);
      this.currentDate.setDate(this.currentDate.getDate() - 7);
      this.generateWeekView();
    } else {
      this.currentDate = new Date(this.currentDate);
      this.currentDate.setDate(this.currentDate.getDate() - 1);
      this.selectDate(this.formatDate(this.currentDate));
    }
  }

  navigateNext(): void {
    if (this.selectedViewMode === 'month') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
      this.generateCalendar();
      this.loadData();
    } else if (this.selectedViewMode === 'week') {
      this.currentDate = new Date(this.currentDate);
      this.currentDate.setDate(this.currentDate.getDate() + 7);
      this.generateWeekView();
    } else {
      this.currentDate = new Date(this.currentDate);
      this.currentDate.setDate(this.currentDate.getDate() + 1);
      this.selectDate(this.formatDate(this.currentDate));
    }
  }

  goToToday(): void {
    this.currentDate = new Date();
    
    if (this.selectedViewMode === 'month') {
      this.generateCalendar();
    } else if (this.selectedViewMode === 'week') {
      this.generateWeekView();
    }
    
    this.selectDate(this.formatDate(this.currentDate));
  }

  switchView(mode: 'day' | 'week' | 'month'): void {
    this.selectedViewMode = mode;
    
    if (mode === 'week') {
      this.generateWeekView();
    } else if (mode === 'month') {
      this.generateCalendar();
    }
  }

  selectDate(date: string): void {
    this.selectedDate = date;
    this.applyFilters();
    
    // If we're in day view, update the current date
    if (this.selectedViewMode === 'day') {
      this.currentDate = new Date(date);
    }
  }

  // Appointment management methods
  applyFilters(): void {
    this.filteredAppointments = this.appointments.filter(appointment => {
      // Filter by date if selected
      if (this.selectedDate && appointment.date !== this.selectedDate) {
        return false;
      }
      
      // Filter by status
      if (this.statusFilter !== 'all' && appointment.status !== this.statusFilter) {
        return false;
      }
      
      // Filter by type
      if (this.typeFilter !== 'all' && appointment.type !== this.typeFilter) {
        return false;
      }
      
      // Filter by clinic
      if (this.clinicFilter !== 'all' && appointment.clinicId !== this.clinicFilter) {
        return false;
      }
      
      // Filter by search term
      if (this.searchTerm) {
        const searchTermLower = this.searchTerm.toLowerCase();
        return appointment.patientName.toLowerCase().includes(searchTermLower) ||
               (appointment.reason && appointment.reason.toLowerCase().includes(searchTermLower)) ||
               (appointment.notes && appointment.notes.toLowerCase().includes(searchTermLower));
      }
      
      return true;
    });
    
    // Sort by time
    this.filteredAppointments.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    });
  }

  selectAppointment(id: string): void {
    this.selectedAppointmentId = id;
    this.selectedAppointment = this.appointments.find(a => a.id === id) || null;
  }

  viewAppointmentDetails(id: string): void {
    this.selectedAppointment = this.appointments.find(a => a.id === id) || null;
    if (this.selectedAppointment) {
      this.showAppointmentModal = true;
    }
  }

  closeAppointmentModal(): void {
    this.showAppointmentModal = false;
    this.selectedAppointment = null;
  }

  createAppointment(date?: string, time?: string): void {
    this.isEditMode = false;
    this.formSubmitted = false;
    
    // Reset form
    this.appointmentForm.reset({
      patientId: '',
      date: date || this.selectedDate || this.formatDate(this.currentDate),
      startTime: time || '08:00',
      endTime: this.calculateEndTime(time || '08:00'),
      type: AppointmentType.CONSULTATION,
      clinicId: '',
      reason: '',
      notes: '',
      isNewPatient: false,
      paymentStatus: PaymentStatus.PENDING,
      paymentAmount: 100
    });
    
    this.showCreateModal = true;
  }

  editAppointment(id: string): void {
    const appointment = this.appointments.find(a => a.id === id);
    if (!appointment) return;
    
    this.isEditMode = true;
    this.formSubmitted = false;
    
    // Populate form
    this.appointmentForm.patchValue({
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      type: appointment.type,
      clinicId: appointment.clinicId,
      clinicName: appointment.clinicName,
      reason: appointment.reason,
      notes: appointment.notes,
      isNewPatient: appointment.isNewPatient,
      paymentStatus: appointment.paymentStatus,
      paymentAmount: appointment.paymentAmount
    });
    
    this.showCreateModal = true;
    this.closeAppointmentModal();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  saveAppointment(): void {
    this.formSubmitted = true;
    
    if (this.appointmentForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    
    // Get patient and clinic names
    const patientId = this.appointmentForm.get('patientId')?.value;
    const patient = this.patients.find(p => p.id === patientId);
    
    const clinicId = this.appointmentForm.get('clinicId')?.value;
    const clinic = this.clinics.find(c => c.id === clinicId);
    
    // Update form with names
    this.appointmentForm.patchValue({
      patientName: patient?.name,
      clinicName: clinic?.name
    });
    
    // Create appointment object
    const appointmentData: Appointment = {
      ...this.appointmentForm.value,
      status: this.isEditMode ? this.selectedAppointment!.status : AppointmentStatus.SCHEDULED,
      id: this.isEditMode ? this.selectedAppointment!.id : ''
    };
    
    if (this.isEditMode) {
      // Update appointment
      this.appointmentService.updateAppointment(appointmentData.id, appointmentData).subscribe({
        next: (appointment: Appointment) => {
          // Update appointment in the list
          const index = this.appointments.findIndex(a => a.id === appointment.id);
          if (index !== -1) {
            this.appointments[index] = appointment;
          }
          
          this.updateCalendarAppointments();
          this.applyFilters();
          this.isLoading = false;
          this.closeCreateModal();
        },
        error: (error) => {
          console.error('Error updating appointment:', error);
          this.isLoading = false;
        }
      });
    } else {
      // Create new appointment
      this.appointmentService.createAppointment(appointmentData).subscribe({
        next: (appointment: Appointment) => {
          this.appointments.push(appointment);
          this.updateCalendarAppointments();
          this.applyFilters();
          this.isLoading = false;
          this.closeCreateModal();
        },
        error: (error) => {
          console.error('Error creating appointment:', error);
          this.isLoading = false;
        }
      });
    }
  }

  checkInAppointment(id: string): void {
    this.updateAppointmentStatus(id, AppointmentStatus.CHECKED_IN);
  }

  completeAppointment(id: string): void {
    this.updateAppointmentStatus(id, AppointmentStatus.COMPLETED);
  }

  cancelAppointment(id: string): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.updateAppointmentStatus(id, AppointmentStatus.CANCELLED);
    }
  }

  updateAppointmentStatus(id: string, status: AppointmentStatus): void {
    this.isLoading = true;
    
    this.appointmentService.updateAppointmentStatus(id, status).subscribe({
      next: (appointment: Appointment) => {
        // Update appointment in the list
        const index = this.appointments.findIndex(a => a.id === appointment.id);
        if (index !== -1) {
          this.appointments[index] = appointment;
        }
        
        // Update selected appointment if it's the same
        if (this.selectedAppointment && this.selectedAppointment.id === appointment.id) {
          this.selectedAppointment = appointment;
        }
        
        this.updateCalendarAppointments();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating appointment status:', error);
        this.isLoading = false;
      }
    });
  }

  // Helper methods for views
  getAppointmentsAtTime(date: string, time: string): Appointment[] {
    return this.appointments.filter(appointment => 
      appointment.date === date && appointment.startTime === time
    );
  }

  getAppointmentListTitle(): string {
    if (this.selectedDate) {
      const date = new Date(this.selectedDate);
      return `Appointments for ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;
    }
    return 'All Appointments';
  }

  canCheckIn(appointment: Appointment): boolean {
    return appointment.status === AppointmentStatus.SCHEDULED || 
           appointment.status === AppointmentStatus.CONFIRMED;
  }

  canComplete(appointment: Appointment): boolean {
    return appointment.status === AppointmentStatus.CHECKED_IN;
  }

  getAppointmentIndicatorColor(day: CalendarDay): string {
    if (!day.appointments || day.appointments.length === 0) {
      return '#0d6efd';
    }
    
    // If a day has multiple appointments with different statuses,
    // prioritize showing SCHEDULED or CONFIRMED
    const statuses = new Set(day.appointments.map(a => a.status));
    
    if (statuses.has(AppointmentStatus.CONFIRMED)) {
      return appointmentStatusColors[AppointmentStatus.CONFIRMED];
    } else if (statuses.has(AppointmentStatus.SCHEDULED)) {
      return appointmentStatusColors[AppointmentStatus.SCHEDULED];
    } else if (statuses.has(AppointmentStatus.CHECKED_IN)) {
      return appointmentStatusColors[AppointmentStatus.CHECKED_IN];
    } else {
      // Use the first appointment's status color
      return appointmentStatusColors[day.appointments[0].status];
    }
  }

  getStatusColor(status: AppointmentStatus): string {
    return appointmentStatusColors[status];
  }

  getTypeColor(type: AppointmentType): string {
    return appointmentTypeColors[type];
  }

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

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    let endHours = hours;
    let endMinutes = minutes + 30;
    
    if (endMinutes >= 60) {
      endHours += 1;
      endMinutes -= 60;
    }
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }
} 