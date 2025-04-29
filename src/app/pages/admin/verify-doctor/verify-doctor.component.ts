import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

// Interface definitions
interface Document {
  id: string;
  name: string;
  type: string;
  status: 'valid' | 'invalid' | 'pending';
  url: string;
  uploadDate: Date;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  avatar: string;
  status: 'pending' | 'verified' | 'rejected';
  submissionDate: Date;
  documents: Document[];
}

@Component({
  selector: 'app-verify-doctor',
  templateUrl: './verify-doctor.component.html',
  styleUrls: ['./verify-doctor.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  providers: [DatePipe]
})
export class VerifyDoctorComponent implements OnInit {
  // UI State
  loading = true;
  error = false;
  errorMessage = '';
  selectedFilter = 'all';
  searchText = '';
  
  // Data
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;
  
  // Modal
  showModal = false;
  selectedDoctor: Doctor | null = null;
  verificationForm: FormGroup;
  verificationNotes = '';
  maxNotesLength = 500;
  
  // Document Verification
  processingVerification = false;
  verificationSuccess = false;
  verificationError = false;
  
  constructor(private formBuilder: FormBuilder) {
    this.verificationForm = this.formBuilder.group({
      notes: ['', [Validators.maxLength(this.maxNotesLength)]]
    });
  }
  
  ngOnInit(): void {
    this.loadDoctors();
  }
  
  // Data Loading
  loadDoctors(): void {
    this.loading = true;
    this.error = false;
    
    // Simulate API call with mock data
    setTimeout(() => {
      try {
        this.doctors = this.generateMockDoctors();
        this.applyFilters();
        this.calculateTotalPages();
        this.loading = false;
      } catch (e) {
        this.error = true;
        this.errorMessage = 'Failed to load doctor verification requests. Please try again.';
        this.loading = false;
      }
    }, 1000);
  }
  
  // Filtering & Search
  applyFilters(): void {
    let filtered = [...this.doctors];
    
    // Apply status filter
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(doctor => doctor.status === this.selectedFilter);
    }
    
    // Apply search filter
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(searchLower) ||
        doctor.email.toLowerCase().includes(searchLower) ||
        doctor.specialty.toLowerCase().includes(searchLower)
      );
    }
    
    this.filteredDoctors = filtered;
    this.calculateTotalPages();
    this.currentPage = 1;
  }
  
  onFilterChange(event: Event): void {
    this.selectedFilter = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }
  
  onSearch(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }
  
  // Pagination
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredDoctors.length / this.itemsPerPage);
  }
  
  getPaginatedDoctors(): Doctor[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredDoctors.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
  
  // Modal actions
  openModal(doctor: Doctor): void {
    this.selectedDoctor = doctor;
    this.verificationNotes = '';
    this.verificationForm.reset();
    this.showModal = true;
  }
  
  closeModal(): void {
    this.showModal = false;
    this.selectedDoctor = null;
    this.verificationSuccess = false;
    this.verificationError = false;
  }
  
  // Document Actions
  markDocumentAsValid(doc: Document): void {
    if (!this.selectedDoctor) return;
    
    const docIndex = this.selectedDoctor.documents.findIndex(d => d.id === doc.id);
    if (docIndex !== -1) {
      this.selectedDoctor.documents[docIndex].status = 'valid';
    }
  }
  
  markDocumentAsInvalid(doc: Document): void {
    if (!this.selectedDoctor) return;
    
    const docIndex = this.selectedDoctor.documents.findIndex(d => d.id === doc.id);
    if (docIndex !== -1) {
      this.selectedDoctor.documents[docIndex].status = 'invalid';
    }
  }
  
  viewDocument(doc: Document): void {
    window.open(doc.url, '_blank');
  }
  
  // Verification Actions
  approveDoctor(): void {
    if (!this.selectedDoctor) return;
    
    this.processingVerification = true;
    this.verificationNotes = this.verificationForm.get('notes')?.value || '';
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Update doctor status
        const doctorIndex = this.doctors.findIndex(d => d.id === this.selectedDoctor?.id);
        if (doctorIndex !== -1) {
          this.doctors[doctorIndex].status = 'verified';
          this.applyFilters();
        }
        
        this.verificationSuccess = true;
        this.verificationError = false;
        
        // Close modal after delay
        setTimeout(() => {
          this.closeModal();
        }, 2000);
      } catch (e) {
        this.verificationError = true;
        this.verificationSuccess = false;
      } finally {
        this.processingVerification = false;
      }
    }, 1500);
  }
  
  rejectDoctor(): void {
    if (!this.selectedDoctor) return;
    
    this.processingVerification = true;
    this.verificationNotes = this.verificationForm.get('notes')?.value || '';
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Update doctor status
        const doctorIndex = this.doctors.findIndex(d => d.id === this.selectedDoctor?.id);
        if (doctorIndex !== -1) {
          this.doctors[doctorIndex].status = 'rejected';
          this.applyFilters();
        }
        
        this.verificationSuccess = true;
        this.verificationError = false;
        
        // Close modal after delay
        setTimeout(() => {
          this.closeModal();
        }, 2000);
      } catch (e) {
        this.verificationError = true;
        this.verificationSuccess = false;
      } finally {
        this.processingVerification = false;
      }
    }, 1500);
  }
  
  // Utilities
  getAllPendingDocuments(doctor: Doctor): number {
    return doctor.documents.filter(doc => doc.status === 'pending').length;
  }
  
  getAllValidDocuments(doctor: Doctor): number {
    return doctor.documents.filter(doc => doc.status === 'valid').length;
  }
  
  getAllInvalidDocuments(doctor: Doctor): number {
    return doctor.documents.filter(doc => doc.status === 'invalid').length;
  }
  
  isApproveDisabled(): boolean {
    if (!this.selectedDoctor) return true;
    
    // Check if all documents are verified (either valid or invalid)
    const hasPendingDocuments = this.selectedDoctor.documents.some(doc => doc.status === 'pending');
    
    return hasPendingDocuments;
  }
  
  // Mock Data Generator
  private generateMockDoctors(): Doctor[] {
    const specialties = [
      'Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 
      'Orthopedics', 'Gynecology', 'Ophthalmology', 'Psychiatry'
    ];
    
    const docTypes = [
      'Medical License', 'Board Certification', 'Diploma', 
      'Malpractice Insurance', 'Photo ID', 'Professional References'
    ];
    
    const doctors: Doctor[] = [];
    
    // Generate 15 mock doctors
    for (let i = 0; i < 15; i++) {
      const status = ['pending', 'verified', 'rejected'][Math.floor(Math.random() * 3)] as 'pending' | 'verified' | 'rejected';
      const name = `Dr. ${['John', 'Jane', 'Robert', 'Emily', 'Michael', 'Sarah', 'David', 'Jessica'][Math.floor(Math.random() * 8)]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson'][Math.floor(Math.random() * 8)]}`;
      const specialty = specialties[Math.floor(Math.random() * specialties.length)];
      
      // Generate documents
      const documents: Document[] = [];
      const numDocs = Math.floor(Math.random() * 3) + 3; // 3-5 documents per doctor
      
      for (let j = 0; j < numDocs; j++) {
        const docStatus = status === 'pending' ? 
          ['valid', 'invalid', 'pending'][Math.floor(Math.random() * 3)] as 'valid' | 'invalid' | 'pending' : 
          status === 'verified' ? 'valid' : 'invalid';
          
        documents.push({
          id: `doc-${i}-${j}`,
          name: docTypes[j % docTypes.length],
          type: ['pdf', 'jpg', 'png'][Math.floor(Math.random() * 3)],
          status: docStatus,
          url: 'assets/mock-documents/sample.pdf',
          uploadDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
        });
      }
      
      doctors.push({
        id: `doctor-${i}`,
        name,
        specialty,
        email: `${name.toLowerCase().replace('dr. ', '').replace(' ', '.')}@example.com`,
        phone: `+1 ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        avatar: `assets/avatars/doctor-${(i % 8) + 1}.jpg`,
        status,
        submissionDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        documents
      });
    }
    
    return doctors;
  }
} 