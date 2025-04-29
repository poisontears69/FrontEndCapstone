import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Clinic, Schedule } from '../models/clinic.model';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {
  private apiUrl = 'http://localhost:8080/api/doctors/clinics';

  constructor(private http: HttpClient) { }

  // Get all clinics for the doctor
  getClinics(): Observable<Clinic[]> {
    return this.http.get<Clinic[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.error('Error fetching clinics:', error);
          throw error;
        })
      );
  }

  // Get a single clinic by ID
  getClinic(id: string): Observable<Clinic> {
    return this.http.get<Clinic>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching clinic with ID ${id}:`, error);
          throw error;
        })
      );
  }

  // Create a new clinic
  createClinic(clinic: Clinic): Observable<Clinic> {
    return this.http.post<Clinic>(this.apiUrl, clinic)
      .pipe(
        catchError(error => {
          console.error('Error creating clinic:', error);
          throw error;
        })
      );
  }

  // Update an existing clinic
  updateClinic(id: string, clinic: Clinic): Observable<Clinic> {
    return this.http.put<Clinic>(`${this.apiUrl}/${id}`, clinic)
      .pipe(
        catchError(error => {
          console.error(`Error updating clinic with ID ${id}:`, error);
          throw error;
        })
      );
  }

  // Delete a clinic
  deleteClinic(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error deleting clinic with ID ${id}:`, error);
          throw error;
        })
      );
  }

  // Check if schedules overlap
  checkScheduleOverlap(schedules: Schedule[]): boolean {
    // Sort schedules by day and start time
    const sortedSchedules = [...schedules].sort((a, b) => {
      // First, sort by day
      if (a.day !== b.day) {
        return a.day.localeCompare(b.day);
      }
      // Then, sort by start time
      return a.startTime.localeCompare(b.startTime);
    });

    // Check for overlaps
    for (let i = 0; i < sortedSchedules.length - 1; i++) {
      const current = sortedSchedules[i];
      const next = sortedSchedules[i + 1];

      // Skip inactive schedules
      if (!current.isActive || !next.isActive) {
        continue;
      }

      // Only check schedules on the same day
      if (current.day === next.day) {
        // Check if end time of current schedule is after start time of next schedule
        if (current.endTime > next.startTime) {
          return true; // Overlap detected
        }
      }
    }

    return false; // No overlaps
  }

  // Validate a schedule against existing schedules
  validateSchedule(newSchedule: Schedule, existingSchedules: Schedule[]): Observable<boolean> {
    // Filter out inactive schedules and schedules with the same ID (for updates)
    const activeSchedules = existingSchedules.filter(
      s => s.isActive && s.id !== newSchedule.id && s.day === newSchedule.day
    );

    // Check if the new schedule overlaps with any existing schedule
    const hasOverlap = activeSchedules.some(existing => {
      // Case 1: newSchedule starts during existing schedule
      // Case 2: newSchedule ends during existing schedule
      // Case 3: newSchedule completely contains existing schedule
      return (
        (newSchedule.startTime >= existing.startTime && newSchedule.startTime < existing.endTime) ||
        (newSchedule.endTime > existing.startTime && newSchedule.endTime <= existing.endTime) ||
        (newSchedule.startTime <= existing.startTime && newSchedule.endTime >= existing.endTime)
      );
    });

    if (hasOverlap) {
      return throwError(() => 'Schedule overlaps with an existing schedule on the same day');
    }

    return of(true);
  }
} 