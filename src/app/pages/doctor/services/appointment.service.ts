import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Appointment, AppointmentStatus, AppointmentType, PaymentStatus } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:8080/api/doctors/appointments';

  constructor(private http: HttpClient) { }

  // Get all appointments
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching appointments:', error);
        // Return mock data for development
        return of(this.generateMockAppointments());
      })
    );
  }

  // Get appointments for a specific date
  getAppointmentsByDate(date: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/date/${date}`).pipe(
      catchError(error => {
        console.error(`Error fetching appointments for date ${date}:`, error);
        // Filter mock data by date
        const appointments = this.generateMockAppointments().filter(
          appointment => appointment.date === date
        );
        return of(appointments);
      })
    );
  }

  // Get appointments within a date range
  getAppointmentsByDateRange(startDate: string, endDate: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/range?start=${startDate}&end=${endDate}`).pipe(
      catchError(error => {
        console.error(`Error fetching appointments for date range:`, error);
        // Filter mock data by date range
        const start = new Date(startDate);
        const end = new Date(endDate);
        const appointments = this.generateMockAppointments().filter(appointment => {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate >= start && appointmentDate <= end;
        });
        return of(appointments);
      })
    );
  }

  // Get appointment by ID
  getAppointment(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching appointment with ID ${id}:`, error);
        const appointment = this.generateMockAppointments().find(a => a.id === id);
        if (appointment) {
          return of(appointment);
        }
        throw new Error('Appointment not found');
      })
    );
  }

  // Create a new appointment
  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, appointment).pipe(
      catchError(error => {
        console.error('Error creating appointment:', error);
        // Mock response - just return the appointment with a generated ID
        const newAppointment = {
          ...appointment,
          id: this.generateId()
        };
        return of(newAppointment);
      })
    );
  }

  // Update an appointment
  updateAppointment(id: string, appointment: Appointment): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}`, appointment).pipe(
      catchError(error => {
        console.error(`Error updating appointment with ID ${id}:`, error);
        // Mock response - just return the updated appointment
        return of(appointment);
      })
    );
  }

  // Delete an appointment
  deleteAppointment(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error deleting appointment with ID ${id}:`, error);
        // Mock response - return success
        return of(true);
      })
    );
  }

  // Change appointment status
  updateAppointmentStatus(id: string, status: AppointmentStatus): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      catchError(error => {
        console.error(`Error updating status for appointment ${id}:`, error);
        // Mock response - find the appointment and update its status
        const appointments = this.generateMockAppointments();
        const appointmentIndex = appointments.findIndex(a => a.id === id);
        if (appointmentIndex >= 0) {
          const updatedAppointment = {
            ...appointments[appointmentIndex],
            status
          };
          return of(updatedAppointment);
        }
        throw new Error('Appointment not found');
      })
    );
  }

  // Generate random ID for mock data
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Generate mock appointment data
  private generateMockAppointments(): Appointment[] {
    // Today's date and the next 14 days
    const dates = [];
    const today = new Date();
    
    // Include today and generate dates for the next 14 days
    for (let i = -7; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    }
    
    // Patient names for mock data
    const patients = [
      { id: '1', name: 'Anna Garcia', avatar: 'assets/images/patients/patient1.jpg' },
      { id: '2', name: 'Brian Johnson', avatar: 'assets/images/patients/patient2.jpg' },
      { id: '3', name: 'Carlos Rodriguez', avatar: 'assets/images/patients/patient3.jpg' },
      { id: '4', name: 'Diana Smith', avatar: 'assets/images/patients/patient4.jpg' },
      { id: '5', name: 'Emma Williams', avatar: 'assets/images/patients/patient5.jpg' },
      { id: '6', name: 'Frank Anderson', avatar: 'assets/images/patients/patient6.jpg' },
      { id: '7', name: 'Grace Chen', avatar: 'assets/images/patients/patient7.jpg' },
      { id: '8', name: 'Henry Wilson', avatar: 'assets/images/patients/patient8.jpg' },
      { id: '9', name: 'Isabella Martinez', avatar: 'assets/images/patients/patient9.jpg' },
      { id: '10', name: 'Jacob Thompson', avatar: 'assets/images/patients/patient10.jpg' }
    ];
    
    // Appointment reasons
    const reasons = [
      'Annual check-up',
      'Flu symptoms',
      'Headache and dizziness',
      'Follow-up on medication',
      'Chronic pain management',
      'Skin rash evaluation',
      'Blood pressure monitoring',
      'Diabetes check',
      'Thyroid evaluation',
      'Heart palpitations',
      'Digestive issues',
      'Respiratory problems',
      'Persistent cough',
      'Joint pain'
    ];
    
    // Clinic names
    const clinics = [
      { id: 'clinic1', name: 'Main Street Clinic' },
      { id: 'clinic2', name: 'City Center Medical' },
      { id: 'clinic3', name: 'Westside Health Center' }
    ];
    
    // Generate 30-50 random appointments across the date range
    const appointments: Appointment[] = [];
    const appointmentCount = Math.floor(Math.random() * 20) + 30; // 30-50 appointments
    
    for (let i = 0; i < appointmentCount; i++) {
      const dateIndex = Math.floor(Math.random() * dates.length);
      const date = dates[dateIndex];
      
      // Generate a random time between 8:00 AM and 5:00 PM
      const hour = Math.floor(Math.random() * 9) + 8; // 8 AM to 5 PM
      const minute = Math.random() < 0.5 ? '00' : '30'; // Only 00 or 30 minutes
      const startTime = `${hour.toString().padStart(2, '0')}:${minute}`;
      
      // End time is 30 minutes after start time
      const endHour = minute === '30' ? hour + 1 : hour;
      const endMinute = minute === '30' ? '00' : '30';
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute}`;
      
      // Random patient
      const patientIndex = Math.floor(Math.random() * patients.length);
      const patient = patients[patientIndex];
      
      // Random clinic
      const clinicIndex = Math.floor(Math.random() * clinics.length);
      const clinic = clinics[clinicIndex];
      
      // Random reason
      const reasonIndex = Math.floor(Math.random() * reasons.length);
      const reason = reasons[reasonIndex];
      
      // Random appointment type
      const appointmentTypes = Object.values(AppointmentType);
      const typeIndex = Math.floor(Math.random() * appointmentTypes.length);
      const type = appointmentTypes[typeIndex];
      
      // Random status - weight towards SCHEDULED/CONFIRMED for future dates
      let status: AppointmentStatus;
      const appointmentDate = new Date(date);
      const isToday = appointmentDate.toDateString() === today.toDateString();
      const isPast = appointmentDate < today;
      
      if (isPast) {
        // Past appointments are either COMPLETED, CANCELLED, or NO_SHOW
        const pastStatuses = [
          AppointmentStatus.COMPLETED, 
          AppointmentStatus.COMPLETED, 
          AppointmentStatus.COMPLETED, 
          AppointmentStatus.CANCELLED, 
          AppointmentStatus.NO_SHOW
        ];
        status = pastStatuses[Math.floor(Math.random() * pastStatuses.length)];
      } else if (isToday) {
        // Today's appointments could be in any status
        const todayStatuses = [
          AppointmentStatus.SCHEDULED,
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.CHECKED_IN,
          AppointmentStatus.COMPLETED,
          AppointmentStatus.CANCELLED
        ];
        status = todayStatuses[Math.floor(Math.random() * todayStatuses.length)];
      } else {
        // Future appointments are typically SCHEDULED or CONFIRMED
        status = Math.random() < 0.7 
          ? AppointmentStatus.SCHEDULED 
          : AppointmentStatus.CONFIRMED;
      }
      
      // Payment status based on appointment status
      let paymentStatus: PaymentStatus;
      if (status === AppointmentStatus.COMPLETED) {
        paymentStatus = PaymentStatus.PAID;
      } else if (status === AppointmentStatus.CANCELLED) {
        paymentStatus = Math.random() < 0.5 ? PaymentStatus.REFUNDED : PaymentStatus.WAIVED;
      } else if (status === AppointmentStatus.CONFIRMED || status === AppointmentStatus.CHECKED_IN) {
        paymentStatus = PaymentStatus.PAID;
      } else {
        paymentStatus = PaymentStatus.PENDING;
      }
      
      // Random payment amount between $50 and $300
      const paymentAmount = Math.floor(Math.random() * 250) + 50;
      
      // Generate the appointment
      appointments.push({
        id: this.generateId(),
        patientId: patient.id,
        patientName: patient.name,
        patientAvatar: patient.avatar,
        date,
        startTime,
        endTime,
        status,
        type,
        notes: Math.random() < 0.3 ? 'Patient requested specific medication. Follow up on test results.' : undefined,
        reason,
        clinicId: clinic.id,
        clinicName: clinic.name,
        isNewPatient: Math.random() < 0.2, // 20% chance of being a new patient
        paymentStatus,
        paymentAmount
      });
    }
    
    // Sort appointments by date and time
    return appointments.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    });
  }
} 