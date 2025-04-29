import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Doctor, Education, Experience, Award, ContactInfo, specializations, languages, DocumentInfo, DoctorDocuments } from '../models/doctor.model';
import { DoctorProfileService } from '../services/doctor-profile.service';
import { HttpErrorResponse } from '@angular/common/http';

interface CredentialFile {
  name: string;
  file: File | null;
}

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class DoctorProfileComponent implements OnInit {
  profileForm!: FormGroup;
  educationForm!: FormGroup;
  experienceForm!: FormGroup;
  awardsForm!: FormGroup;
  contactForm!: FormGroup;
  
  doctor: Doctor | null = null;
  activeTab = 'basic';
  specializations = specializations;
  languagesList = languages;
  
  isLoading = false;
  imageLoading = false;
  saveSuccess = false;
  saveError = '';
  successMessage: string = '';
  
  // Profile image
  profileImage: string | null = null;
  uploadedImage: File | null = null;
  
  // Dynamic forms indexing
  editingEducationIndex: number | null = null;
  editingExperienceIndex: number | null = null;
  editingAwardIndex: number | null = null;
  
  // Credentials files
  credentials: { [key: string]: File | null } = {
    license: null,
    certificate: null,
    affiliation: null,
    additional: null
  };
  
  // Document verification
  documentTypes = ['license', 'diploma', 'certification', 'additional'];
  documentLoading: {[key: string]: boolean} = {};
  
  // Add verificationStatus property with correct type
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'not_submitted' | undefined;
  
  constructor(
    private fb: FormBuilder,
    private doctorProfileService: DoctorProfileService
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadDoctorProfile();
    this.setupFileInputListeners();
    this.loadDocuments();
  }

  initForms(): void {
    // Basic profile form
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required]],
      title: ['', [Validators.required]],
      specialization: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(500)]],
      languages: [[]],
      consultationFee: [0, [Validators.min(0)]],
      availability: this.fb.group({
        consultationHours: [''],
        maxPatientsPerDay: [0, [Validators.min(0)]],
        acceptingNewPatients: [true]
      })
    });
    
    // Education form (for adding/editing)
    this.educationForm = this.fb.group({
      degree: ['', [Validators.required]],
      institution: ['', [Validators.required]],
      year: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]]
    });
    
    // Experience form (for adding/editing)
    this.experienceForm = this.fb.group({
      position: ['', [Validators.required]],
      institution: ['', [Validators.required]],
      startYear: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      endYear: [''],
      current: [false],
      description: ['']
    });
    
    // Awards form (for adding/editing)
    this.awardsForm = this.fb.group({
      title: ['', [Validators.required]],
      year: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      issuer: ['', [Validators.required]]
    });
    
    // Contact info form
    this.contactForm = this.fb.group({
      contactInfo: this.fb.group({
        email: ['', [Validators.email]],
        phone: ['', [Validators.pattern(/^[0-9+\-\s]+$/)]],
        website: ['', [Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)]]
      }),
      socialMedia: this.fb.group({
        facebook: [''],
        twitter: [''],
        linkedin: [''],
        instagram: ['']
      })
    });
  }

  loadDoctorProfile(): void {
    this.isLoading = true;
    this.doctorProfileService.getProfile().subscribe({
      next: (doctor: Doctor) => {
        this.doctor = doctor;
        this.patchForms(doctor);
        this.profileImage = doctor.profilePicture || null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading doctor profile', error);
        this.isLoading = false;
      }
    });
  }

  patchForms(doctor: Doctor): void {
    // Patch basic profile form
    this.profileForm.patchValue({
      fullName: doctor.fullName || '',
      title: doctor.title || '',
      specialization: doctor.specialization || '',
      description: doctor.description || '',
      languages: doctor.languages || [],
      consultationFee: doctor.consultationFee || 0,
      availability: {
        consultationHours: doctor.availability?.consultationHours || '',
        maxPatientsPerDay: doctor.availability?.maxPatientsPerDay || 0,
        acceptingNewPatients: doctor.availability?.acceptingNewPatients !== false
      }
    });
    
    // Patch contact form
    this.contactForm.patchValue({
      contactInfo: {
        email: doctor.contactInfo?.email || '',
        phone: doctor.contactInfo?.phone || '',
        website: doctor.contactInfo?.website || ''
      },
      socialMedia: {
        facebook: doctor.socialMedia?.facebook || '',
        twitter: doctor.socialMedia?.twitter || '',
        linkedin: doctor.socialMedia?.linkedin || '',
        instagram: doctor.socialMedia?.instagram || ''
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.isLoading = true;
    this.saveSuccess = false;
    this.saveError = '';

    const doctorProfile: Doctor = {
      ...this.doctor,
      ...this.profileForm.value,
      isVerified: this.doctor?.isVerified || false,
      contactInfo: this.contactForm.get('contactInfo')?.value,
      socialMedia: this.contactForm.get('socialMedia')?.value
    };

    this.doctorProfileService.updateProfile(doctorProfile).subscribe({
      next: () => {
        if (this.uploadedImage) {
          this.uploadProfileImage(this.uploadedImage);
        } else {
          this.isLoading = false;
          this.saveSuccess = true;
          setTimeout(() => this.saveSuccess = false, 3000);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.saveError = 'Error saving profile. Please try again.';
        console.error('Error saving profile', error);
      }
    });
  }

  uploadProfileImage(file: File): void {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    this.isLoading = true;
    this.saveError = '';
    
    this.doctorProfileService.uploadProfileImage(formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (this.doctor) {
          this.doctor.profilePicture = response.imageUrl;
        }
        this.successMessage = 'Profile image uploaded successfully!';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.saveError = 'Error uploading profile image. Please try again.';
        console.error('Error uploading profile image', error);
      }
    });
  }
  
  onProfileImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImage = e.target.result;
        this.uploadProfileImage(file);
      };
      reader.readAsDataURL(file);
    }
  }
  
  // Education CRUD
  addEducation(): void {
    if (this.educationForm.invalid) {
      this.markFormGroupTouched(this.educationForm);
      return;
    }
    
    const education: Education = this.educationForm.value;
    
    if (this.editingEducationIndex !== null) {
      // Edit existing
      if (!this.doctor?.education) this.doctor!.education = [];
      this.doctor!.education[this.editingEducationIndex] = education;
    } else {
      // Add new
      if (!this.doctor?.education) this.doctor!.education = [];
      this.doctor!.education.push(education);
    }
    
    this.updateProfile();
    this.resetEducationForm();
  }
  
  editEducation(index: number): void {
    if (!this.doctor?.education || index >= this.doctor.education.length) return;
    
    const education = this.doctor.education[index];
    this.educationForm.patchValue(education);
    this.editingEducationIndex = index;
  }
  
  deleteEducation(index: number): void {
    if (!this.doctor?.education || index >= this.doctor.education.length) return;
    
    if (confirm('Are you sure you want to delete this education record?')) {
      this.doctor.education.splice(index, 1);
      this.updateProfile();
    }
  }
  
  resetEducationForm(): void {
    this.educationForm.reset({
      degree: '',
      institution: '',
      year: ''
    });
    this.editingEducationIndex = null;
  }
  
  // Experience CRUD
  addExperience(): void {
    if (this.experienceForm.invalid) {
      this.markFormGroupTouched(this.experienceForm);
      return;
    }
    
    const experience: Experience = this.experienceForm.value;
    
    // If current is checked, clear end year
    if (experience.current) {
      experience.endYear = undefined;
    }
    
    if (this.editingExperienceIndex !== null) {
      // Edit existing
      if (!this.doctor?.experience) this.doctor!.experience = [];
      this.doctor!.experience[this.editingExperienceIndex] = experience;
    } else {
      // Add new
      if (!this.doctor?.experience) this.doctor!.experience = [];
      this.doctor!.experience.push(experience);
    }
    
    this.updateProfile();
    this.resetExperienceForm();
  }
  
  editExperience(index: number): void {
    if (!this.doctor?.experience || index >= this.doctor.experience.length) return;
    
    const experience = this.doctor.experience[index];
    this.experienceForm.patchValue(experience);
    this.editingExperienceIndex = index;
  }
  
  deleteExperience(index: number): void {
    if (!this.doctor?.experience || index >= this.doctor.experience.length) return;
    
    if (confirm('Are you sure you want to delete this experience record?')) {
      this.doctor.experience.splice(index, 1);
      this.updateProfile();
    }
  }
  
  resetExperienceForm(): void {
    this.experienceForm.reset({
      position: '',
      institution: '',
      startYear: '',
      endYear: '',
      current: false,
      description: ''
    });
    this.editingExperienceIndex = null;
  }
  
  // Awards CRUD
  addAward(): void {
    if (this.awardsForm.invalid) {
      this.markFormGroupTouched(this.awardsForm);
      return;
    }
    
    const award: Award = this.awardsForm.value;
    
    if (this.editingAwardIndex !== null) {
      // Edit existing
      if (!this.doctor?.awards) this.doctor!.awards = [];
      this.doctor!.awards[this.editingAwardIndex] = award;
    } else {
      // Add new
      if (!this.doctor?.awards) this.doctor!.awards = [];
      this.doctor!.awards.push(award);
    }
    
    this.updateProfile();
    this.resetAwardForm();
  }
  
  editAward(index: number): void {
    if (!this.doctor?.awards || index >= this.doctor.awards.length) return;
    
    const award = this.doctor.awards[index];
    this.awardsForm.patchValue(award);
    this.editingAwardIndex = index;
  }
  
  deleteAward(index: number): void {
    if (!this.doctor?.awards || index >= this.doctor.awards.length) return;
    
    if (confirm('Are you sure you want to delete this award?')) {
      this.doctor.awards.splice(index, 1);
      this.updateProfile();
    }
  }
  
  resetAwardForm(): void {
    this.awardsForm.reset({
      title: '',
      year: '',
      issuer: ''
    });
    this.editingAwardIndex = null;
  }
  
  // Helper method to update profile
  updateProfile(): void {
    if (!this.doctor) return;
    
    this.isLoading = true;
    this.saveSuccess = false;
    this.saveError = '';
    
    this.doctorProfileService.updateProfile(this.doctor).subscribe({
      next: () => {
        this.isLoading = false;
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.saveError = 'Error updating profile. Please try again.';
        console.error('Error updating profile', error);
      }
    });
  }
  
  switchTab(tab: string): void {
    this.activeTab = tab;
  }
  
  setupFileInputListeners(): void {
    // Set up event listeners for file inputs
    const fileInputIds = ['license', 'certificate', 'affiliation', 'additional'];
    
    fileInputIds.forEach(id => {
      const fileInput = document.getElementById(id) as HTMLInputElement;
      if (fileInput) {
        fileInput.addEventListener('change', (event) => {
          const files = (event.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            this.credentials[id] = files[0];
          }
        });
      }
    });
  }
  
  submitCredentials(): void {
    this.isLoading = true;
    
    // Create FormData
    const formData = new FormData();
    
    // Append all files to form data
    Object.entries(this.credentials).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });
    
    // Check if any files were added
    let hasFiles = false;
    for (const value of formData.values()) {
      hasFiles = true;
      break;
    }
    
    if (!hasFiles) {
      alert('Please upload at least one credential document');
      this.isLoading = false;
      return;
    }
    
    // Call service to upload credentials
    this.doctorProfileService.uploadCredentials(formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.saveError = 'Error uploading credentials. Please try again.';
        console.error('Error uploading credentials', error);
      }
    });
  }
  
  // Recursively mark all controls in a form group as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  loadDocuments(): void {
    this.doctorProfileService.getDocuments().subscribe({
      next: (documents) => {
        if (this.doctor) {
          this.doctor.documents = documents;
        }
      },
      error: (error) => {
        console.error('Error loading documents', error);
      }
    });
  }
  
  saveAwards(): void {
    if (!this.doctor?.awards) return;
    
    this.isLoading = true;
    this.saveError = '';
    
    this.doctorProfileService.updateAwards(this.doctor.awards).subscribe({
      next: (updatedDoctor) => {
        this.doctor = updatedDoctor;
        this.isLoading = false;
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.saveError = 'Error updating awards. Please try again.';
        console.error('Error updating awards', error);
      }
    });
  }
  
  saveContactInfo(): void {
    if (this.contactForm.invalid) {
      this.markFormGroupTouched(this.contactForm);
      return;
    }
    
    this.isLoading = true;
    this.saveError = '';
    
    const contactInfo = {
      contactInfo: this.contactForm.get('contactInfo')?.value,
      socialMedia: this.contactForm.get('socialMedia')?.value
    };
    
    this.doctorProfileService.updateContactInfo(contactInfo).subscribe({
      next: (updatedDoctor) => {
        this.doctor = updatedDoctor;
        this.isLoading = false;
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.saveError = 'Error updating contact information. Please try again.';
        console.error('Error updating contact information', error);
      }
    });
  }
  
  // Verification methods
  uploadDocument(event: Event, documentType: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      this.documentLoading[documentType] = true;
      this.successMessage = '';
      this.saveError = '';
      
      this.doctorProfileService.uploadDocument(documentType, file).subscribe({
        next: (documentInfo: DocumentInfo) => {
          this.documentLoading[documentType] = false;
          this.successMessage = `${documentType} document uploaded successfully.`;
          
          // Update doctor object with the new document
          if (!this.doctor!.documents) {
            this.doctor!.documents = {} as DoctorDocuments;
          }
          
          // Use type assertion to avoid index signature error
          (this.doctor!.documents as any)[documentType] = documentInfo;
          
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.documentLoading[documentType] = false;
          this.saveError = `Error uploading ${documentType} document. Please try again.`;
          console.error('Error uploading document', error);
        }
      });
    }
  }
  
  deleteDocument(documentId: string, documentType: string): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentLoading[documentType] = true;
      
      this.doctorProfileService.deleteDocument(documentId).subscribe({
        next: () => {
          this.documentLoading[documentType] = false;
          this.successMessage = `${documentType} document deleted successfully.`;
          
          // Remove from doctor object
          if (this.doctor?.documents) {
            // Use type assertion to avoid index signature error
            delete (this.doctor.documents as any)[documentType];
          }
          
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.documentLoading[documentType] = false;
          this.saveError = `Error deleting ${documentType} document. Please try again.`;
          console.error('Error deleting document', error);
        }
      });
    }
  }
  
  canSubmitVerification(): boolean {
    if (!this.doctor?.documents) return false;
    
    // Require at least license and diploma
    return !!this.doctor.documents.license && !!this.doctor.documents.diploma;
  }
  
  getVerificationStatusText(): string {
    if (!this.doctor) return 'Not Available';
    
    switch(this.doctor.verificationStatus) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Submitted';
    }
  }
  
  getVerificationStatusClass(): string {
    if (!this.doctor) return '';
    
    switch(this.doctor.verificationStatus) {
      case 'verified':
        return 'status-verified';
      case 'pending':
        return 'status-pending';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-not-submitted';
    }
  }
  
  checkVerificationStatus(): void {
    this.doctorProfileService.getVerificationStatus().subscribe({
      next: (response) => {
        if (this.doctor) {
          // Cast response.status to the correct type
          this.doctor.verificationStatus = response.status as 'pending' | 'verified' | 'rejected' | 'not_submitted';
          this.successMessage = response.message;
          setTimeout(() => this.successMessage = '', 5000);
        }
      },
      error: (error) => {
        console.error('Error checking verification status', error);
        this.saveError = 'Error checking verification status. Please try again.';
      }
    });
  }

  onSubmitVerification(): void {
    this.isLoading = true;
    this.doctorProfileService.requestVerification().subscribe(
      response => {
        this.isLoading = false;
        this.verificationStatus = 'pending'; // Use correct enum value
        this.successMessage = 'Verification request submitted successfully!';
      },
      error => {
        this.isLoading = false;
        this.saveError = error.message || 'Failed to submit verification request. Please try again.';
      }
    );
  }

  // Helper methods to check array lengths safely in templates
  hasEducation(): boolean {
    return !!this.doctor?.education && this.doctor.education.length > 0;
  }

  hasNoEducation(): boolean {
    return !this.doctor?.education || this.doctor.education.length === 0;
  }

  hasExperience(): boolean {
    return !!this.doctor?.experience && this.doctor.experience.length > 0;
  }

  hasNoExperience(): boolean {
    return !this.doctor?.experience || this.doctor.experience.length === 0;
  }

  hasAwards(): boolean {
    return !!this.doctor?.awards && this.doctor.awards.length > 0;
  }

  hasNoAwards(): boolean {
    return !this.doctor?.awards || this.doctor.awards.length === 0;
  }
}