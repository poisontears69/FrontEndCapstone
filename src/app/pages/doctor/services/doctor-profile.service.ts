import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Doctor, DocumentInfo, DoctorDocuments } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorProfileService {
  private apiUrl = 'http://localhost:8080/api/doctors';

  constructor(private http: HttpClient) { }

  // Get doctor profile
  getProfile(): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/profile`)
      .pipe(
        catchError(error => {
          console.error('Error fetching doctor profile:', error);
          throw error;
        })
      );
  }

  // Update doctor profile
  updateProfile(doctor: Doctor): Observable<Doctor> {
    return this.http.put<Doctor>(`${this.apiUrl}/profile`, doctor)
      .pipe(
        catchError(error => {
          console.error('Error updating doctor profile:', error);
          throw error;
        })
      );
  }

  // Request verification
  requestVerification(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/request-verification`, {})
      .pipe(
        catchError(error => {
          console.error('Error requesting verification:', error);
          throw error;
        })
      );
  }

  // Upload credentials
  uploadCredentials(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upload-credentials`, formData)
      .pipe(
        catchError(error => {
          console.error('Error uploading credentials:', error);
          throw error;
        })
      );
  }

  // Upload document
  uploadDocument(documentType: string, file: File): Observable<DocumentInfo> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    return this.http.post<DocumentInfo>(`${this.apiUrl}/documents/upload`, formData)
      .pipe(
        catchError(error => {
          console.error(`Error uploading ${documentType}:`, error);
          throw error;
        })
      );
  }

  // Get verification status
  getVerificationStatus(): Observable<{status: string, message: string}> {
    return this.http.get<{status: string, message: string}>(`${this.apiUrl}/verification-status`)
      .pipe(
        catchError(error => {
          console.error('Error fetching verification status:', error);
          throw error;
        })
      );
  }

  // Get documents
  getDocuments(): Observable<DoctorDocuments> {
    return this.http.get<DoctorDocuments>(`${this.apiUrl}/documents`)
      .pipe(
        catchError(error => {
          console.error('Error fetching documents:', error);
          throw error;
        })
      );
  }

  // Delete document
  deleteDocument(documentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/documents/${documentId}`)
      .pipe(
        catchError(error => {
          console.error('Error deleting document:', error);
          throw error;
        })
      );
  }

  // Update awards
  updateAwards(awards: any[]): Observable<Doctor> {
    return this.http.put<Doctor>(`${this.apiUrl}/awards`, { awards })
      .pipe(
        catchError(error => {
          console.error('Error updating awards:', error);
          throw error;
        })
      );
  }

  // Update contact information
  updateContactInfo(contactInfo: any): Observable<Doctor> {
    return this.http.put<Doctor>(`${this.apiUrl}/contact-info`, contactInfo)
      .pipe(
        catchError(error => {
          console.error('Error updating contact information:', error);
          throw error;
        })
      );
  }

  // Add uploadProfileImage method
  uploadProfileImage(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/profile/image`, formData)
      .pipe(
        catchError(error => {
          console.error('Error uploading profile image:', error);
          throw error;
        })
      );
  }
} 