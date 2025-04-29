import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Doctor } from '../models/doctor.model';
import { Clinic } from '../models/clinic.model';
import { AuthService, User } from '../../../core/services/auth.service';

export interface ClinicStats {
  id: string;
  name: string;
  imageUrl: string;
  patientsBooked: number;
}

export interface DashboardData {
  doctor: Doctor;
  user: User;
  clinics: ClinicStats[];
  todayAppointments: number;
  pendingRequests: number;
  totalPatients: number;
  unreadMessages: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/doctors';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Get dashboard data including doctor profile, clinics stats, etc.
  getDashboardData(): Observable<DashboardData> {
    return forkJoin({
      doctor: this.getDoctorProfile(),
      clinics: this.getClinicStats(),
      stats: this.getAppointmentStats()
    }).pipe(
      map(result => {
        return {
          doctor: result.doctor,
          user: this.authService.currentUserValue!,
          clinics: result.clinics,
          todayAppointments: result.stats.todayAppointments,
          pendingRequests: result.stats.pendingRequests,
          totalPatients: result.stats.totalPatients,
          unreadMessages: result.stats.unreadMessages
        };
      }),
      catchError(error => {
        console.error('Error fetching dashboard data:', error);
        throw error;
      })
    );
  }

  // Get doctor's profile
  private getDoctorProfile(): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/profile`).pipe(
      catchError(error => {
        console.error('Error fetching doctor profile:', error);
        throw error;
      })
    );
  }

  // Get stats for all clinics
  private getClinicStats(): Observable<ClinicStats[]> {
    return this.http.get<ClinicStats[]>(`${this.apiUrl}/clinics/stats`).pipe(
      catchError(error => {
        console.error('Error fetching clinic stats:', error);
        throw error;
      })
    );
  }

  // Get appointment and patient statistics
  private getAppointmentStats(): Observable<{
    todayAppointments: number;
    pendingRequests: number;
    totalPatients: number;
    unreadMessages: number;
  }> {
    return this.http.get<{
      todayAppointments: number;
      pendingRequests: number;
      totalPatients: number;
      unreadMessages: number;
    }>(`${this.apiUrl}/stats`).pipe(
      catchError(error => {
        console.error('Error fetching appointment stats:', error);
        // Return mock data for now
        return of({
          todayAppointments: 8,
          pendingRequests: 3,
          totalPatients: 124,
          unreadMessages: 5
        });
      })
    );
  }
} 