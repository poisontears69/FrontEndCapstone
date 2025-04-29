import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Patient, PatientGroup } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'http://localhost:8080/api/doctors/patients';

  constructor(private http: HttpClient) { }

  // Get all patients
  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching patients:', error);
        // Return mock data for development
        return of(this.getMockPatients());
      })
    );
  }

  // Get patient by ID
  getPatient(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching patient with ID ${id}:`, error);
        throw error;
      })
    );
  }

  // Group patients by the first letter of their name
  groupPatientsByAlphabet(patients: Patient[]): PatientGroup[] {
    // Sort patients by name
    const sortedPatients = [...patients].sort((a, b) => 
      a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase())
    );
    
    // Group by first letter
    const groups: { [key: string]: Patient[] } = {};
    
    sortedPatients.forEach(patient => {
      const firstLetter = patient.fullName.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(patient);
    });
    
    // Convert to array of PatientGroup
    return Object.keys(groups).sort().map(letter => ({
      letter,
      patients: groups[letter]
    }));
  }

  // Search patients
  searchPatients(query: string, patients: Patient[]): Patient[] {
    if (!query || query.trim() === '') {
      return patients;
    }
    
    const queryLower = query.toLowerCase().trim();
    
    return patients.filter(patient => 
      patient.fullName.toLowerCase().includes(queryLower) ||
      patient.email.toLowerCase().includes(queryLower) ||
      patient.phone.toLowerCase().includes(queryLower)
    );
  }

  // Mock data for development
  private getMockPatients(): Patient[] {
    return [
      {
        id: '1',
        fullName: 'Anna Garcia',
        email: 'anna.garcia@example.com',
        phone: '+1 (555) 123-4567',
        dateOfBirth: '1985-06-15',
        gender: 'Female',
        profilePicture: 'assets/images/patients/patient1.jpg',
        lastVisit: '2023-05-10',
        upcomingAppointment: '2023-06-20'
      },
      {
        id: '2',
        fullName: 'Brian Johnson',
        email: 'brian.johnson@example.com',
        phone: '+1 (555) 987-6543',
        dateOfBirth: '1976-11-23',
        gender: 'Male',
        profilePicture: 'assets/images/patients/patient2.jpg',
        lastVisit: '2023-04-28'
      },
      {
        id: '3',
        fullName: 'Carlos Rodriguez',
        email: 'carlos.r@example.com',
        phone: '+1 (555) 234-5678',
        dateOfBirth: '1990-02-14',
        gender: 'Male',
        profilePicture: 'assets/images/patients/patient3.jpg',
        lastVisit: '2023-05-15',
        upcomingAppointment: '2023-06-15'
      },
      {
        id: '4',
        fullName: 'Diana Smith',
        email: 'diana.smith@example.com',
        phone: '+1 (555) 345-6789',
        dateOfBirth: '1982-09-30',
        gender: 'Female',
        profilePicture: 'assets/images/patients/patient4.jpg',
        lastVisit: '2023-05-05',
      },
      {
        id: '5',
        fullName: 'Emma Williams',
        email: 'emma.w@example.com',
        phone: '+1 (555) 456-7890',
        dateOfBirth: '1995-07-12',
        gender: 'Female',
        profilePicture: 'assets/images/patients/patient5.jpg',
        upcomingAppointment: '2023-06-18'
      },
      {
        id: '6',
        fullName: 'Frank Anderson',
        email: 'frank.a@example.com',
        phone: '+1 (555) 567-8901',
        dateOfBirth: '1979-03-25',
        gender: 'Male',
        profilePicture: 'assets/images/patients/patient6.jpg',
        lastVisit: '2023-04-20',
      },
      {
        id: '7',
        fullName: 'Grace Chen',
        email: 'grace.chen@example.com',
        phone: '+1 (555) 678-9012',
        dateOfBirth: '1988-12-08',
        gender: 'Female',
        profilePicture: 'assets/images/patients/patient7.jpg',
        lastVisit: '2023-05-02',
        upcomingAppointment: '2023-06-25'
      },
      {
        id: '8',
        fullName: 'Henry Wilson',
        email: 'henry.w@example.com',
        phone: '+1 (555) 789-0123',
        dateOfBirth: '1970-08-17',
        gender: 'Male',
        profilePicture: 'assets/images/patients/patient8.jpg',
        lastVisit: '2023-05-12',
      },
      {
        id: '9',
        fullName: 'Isabella Martinez',
        email: 'isabella.m@example.com',
        phone: '+1 (555) 890-1234',
        dateOfBirth: '1992-01-30',
        gender: 'Female',
        profilePicture: 'assets/images/patients/patient9.jpg',
        lastVisit: '2023-04-25',
        upcomingAppointment: '2023-06-10'
      },
      {
        id: '10',
        fullName: 'Jacob Thompson',
        email: 'jacob.t@example.com',
        phone: '+1 (555) 901-2345',
        dateOfBirth: '1983-05-20',
        gender: 'Male',
        profilePicture: 'assets/images/patients/patient10.jpg',
        lastVisit: '2023-05-18',
      },
      {
        id: '11',
        fullName: 'Kevin Lee',
        email: 'kevin.lee@example.com',
        phone: '+1 (555) 012-3456',
        dateOfBirth: '1987-09-10',
        gender: 'Male',
        profilePicture: 'assets/images/patients/patient11.jpg',
        lastVisit: '2023-05-09',
      },
      {
        id: '12',
        fullName: 'Laura Davis',
        email: 'laura.d@example.com',
        phone: '+1 (555) 321-6547',
        dateOfBirth: '1991-03-15',
        gender: 'Female',
        profilePicture: 'assets/images/patients/patient12.jpg',
        lastVisit: '2023-05-14',
        upcomingAppointment: '2023-06-22'
      },
      {
        id: '13',
        fullName: 'Michael Brown',
        email: 'michael.b@example.com',
        phone: '+1 (555) 654-3210',
        dateOfBirth: '1975-11-05',
        gender: 'Male',
        profilePicture: 'assets/images/patients/patient13.jpg',
        lastVisit: '2023-05-01',
      },
      {
        id: '14',
        fullName: 'Natalie Wilson',
        email: 'natalie.w@example.com',
        phone: '+1 (555) 987-6540',
        dateOfBirth: '1993-07-25',
        gender: 'Female',
        profilePicture: 'assets/images/patients/patient14.jpg',
        upcomingAppointment: '2023-06-12'
      },
      {
        id: '15',
        fullName: 'Oliver Harris',
        email: 'oliver.h@example.com',
        phone: '+1 (555) 246-8024',
        dateOfBirth: '1980-02-18',
        gender: 'Male',
        profilePicture: 'assets/images/patients/patient15.jpg',
        lastVisit: '2023-05-11',
      },
      {
        id: '16',
        fullName: 'Patricia Clark',
        email: 'patricia.c@example.com',
        phone: '+1 (555) 135-7924',
        dateOfBirth: '1989-12-03',
        gender: 'Female',
        profilePicture: 'assets/images/patients/patient16.jpg',
        lastVisit: '2023-04-30',
        upcomingAppointment: '2023-06-28'
      },
      {
        id: '17',
        fullName: 'Robert Young',
        email: 'robert.y@example.com',
        phone: '+1 (555) 864-2097',
        dateOfBirth: '1978-08-27',
        gender: 'Male',
        profilePicture: 'assets/images/patients/patient17.jpg',
        lastVisit: '2023-05-06',
      },
      {
        id: '18',
        fullName: 'Sophia White',
        email: 'sophia.w@example.com',
        phone: '+1 (555) 753-9510',
        dateOfBirth: '1994-04-12',
        gender: 'Female',
        profilePicture: 'assets/images/patients/patient18.jpg',
        lastVisit: '2023-05-19',
        upcomingAppointment: '2023-06-15'
      },
      {
        id: '19',
        fullName: 'Thomas Walker',
        email: 'thomas.w@example.com',
        phone: '+1 (555) 642-0853',
        dateOfBirth: '1981-10-15',
        gender: 'Male',
        profilePicture: 'assets/images/patients/patient19.jpg',
        lastVisit: '2023-05-03',
      },
      {
        id: '20',
        fullName: 'Victoria Allen',
        email: 'victoria.a@example.com',
        phone: '+1 (555) 531-7942',
        dateOfBirth: '1986-06-08',
        gender: 'Female',
        profilePicture: 'assets/images/patients/patient20.jpg',
        lastVisit: '2023-05-17',
        upcomingAppointment: '2023-06-30'
      }
    ];
  }
} 