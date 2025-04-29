import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  medicalInfo: {
    allergies: string[];
    chronicConditions: string[];
    currentMedications: string[];
    pastSurgeries: string[];
    familyHistory: string[];
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    expiryDate: Date;
  };
  avatar: string;
}

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class PatientProfileComponent implements OnInit {
  // User profile data
  patientProfile: PatientProfile | null = null;

  // Active tab
  activeTab: 'personal' | 'medical' | 'security' = 'personal';
  
  // Edit mode flags
  editingPersonalInfo = false;
  editingMedicalInfo = false;
  editingContact = false;
  editingInsurance = false;
  
  // Forms
  personalInfoForm: FormGroup;
  contactInfoForm: FormGroup;
  medicalInfoForm: FormGroup;
  insuranceInfoForm: FormGroup;
  passwordForm: FormGroup;
  
  // Loading states
  loading = true;
  saving = false;
  
  // Success and error messages
  successMessage = '';
  errorMessage = '';
  
  constructor(private fb: FormBuilder) {
    // Initialize forms
    this.personalInfoForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      bloodGroup: ['']
    });
    
    this.contactInfoForm = this.fb.group({
      phoneNumber: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['', Validators.required],
      emergencyName: ['', Validators.required],
      emergencyRelationship: ['', Validators.required],
      emergencyPhone: ['', Validators.required]
    });
    
    this.medicalInfoForm = this.fb.group({
      allergies: [''],
      chronicConditions: [''],
      currentMedications: [''],
      pastSurgeries: [''],
      familyHistory: ['']
    });
    
    this.insuranceInfoForm = this.fb.group({
      provider: ['', Validators.required],
      policyNumber: ['', Validators.required],
      groupNumber: [''],
      expiryDate: ['', Validators.required]
    });
    
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator.bind(this)
    });
  }
  
  ngOnInit(): void {
    this.loadPatientProfile();
  }
  
  // Load patient profile
  loadPatientProfile(): void {
    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.patientProfile = this.generateMockPatientProfile();
      this.populateForms();
      this.loading = false;
    }, 1000);
  }
  
  // Populate forms with profile data
  populateForms(): void {
    if (!this.patientProfile) return;
    
    this.personalInfoForm.patchValue({
      firstName: this.patientProfile.firstName,
      lastName: this.patientProfile.lastName,
      email: this.patientProfile.email,
      dateOfBirth: this.formatDateForInput(this.patientProfile.dateOfBirth),
      gender: this.patientProfile.gender,
      bloodGroup: this.patientProfile.bloodGroup
    });
    
    this.contactInfoForm.patchValue({
      phoneNumber: this.patientProfile.phoneNumber,
      street: this.patientProfile.address.street,
      city: this.patientProfile.address.city,
      state: this.patientProfile.address.state,
      zipCode: this.patientProfile.address.zipCode,
      country: this.patientProfile.address.country,
      emergencyName: this.patientProfile.emergencyContact.name,
      emergencyRelationship: this.patientProfile.emergencyContact.relationship,
      emergencyPhone: this.patientProfile.emergencyContact.phoneNumber
    });
    
    this.medicalInfoForm.patchValue({
      allergies: this.patientProfile.medicalInfo.allergies.join(', '),
      chronicConditions: this.patientProfile.medicalInfo.chronicConditions.join(', '),
      currentMedications: this.patientProfile.medicalInfo.currentMedications.join(', '),
      pastSurgeries: this.patientProfile.medicalInfo.pastSurgeries.join(', '),
      familyHistory: this.patientProfile.medicalInfo.familyHistory.join(', ')
    });
    
    this.insuranceInfoForm.patchValue({
      provider: this.patientProfile.insurance.provider,
      policyNumber: this.patientProfile.insurance.policyNumber,
      groupNumber: this.patientProfile.insurance.groupNumber,
      expiryDate: this.formatDateForInput(this.patientProfile.insurance.expiryDate)
    });
  }
  
  // Format date for input field
  formatDateForInput(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
  
  // Set active tab
  setActiveTab(tab: 'personal' | 'medical' | 'security'): void {
    this.activeTab = tab;
    this.clearMessages();
  }
  
  // Start editing sections
  startEditingPersonalInfo(): void {
    this.editingPersonalInfo = true;
    this.clearMessages();
  }
  
  startEditingContact(): void {
    this.editingContact = true;
    this.clearMessages();
  }
  
  startEditingMedicalInfo(): void {
    this.editingMedicalInfo = true;
    this.clearMessages();
  }
  
  startEditingInsurance(): void {
    this.editingInsurance = true;
    this.clearMessages();
  }
  
  // Cancel editing
  cancelEditing(section: string): void {
    if (section === 'personal') {
      this.editingPersonalInfo = false;
      this.populateForms(); // Reset form values
    } else if (section === 'contact') {
      this.editingContact = false;
      this.populateForms();
    } else if (section === 'medical') {
      this.editingMedicalInfo = false;
      this.populateForms();
    } else if (section === 'insurance') {
      this.editingInsurance = false;
      this.populateForms();
    }
    
    this.clearMessages();
  }
  
  // Save profile data
  savePersonalInfo(): void {
    if (this.personalInfoForm.invalid) {
      this.markFormGroupTouched(this.personalInfoForm);
      return;
    }
    
    this.saving = true;
    
    // Simulate API call
    setTimeout(() => {
      if (this.patientProfile) {
        const formValue = this.personalInfoForm.value;
        this.patientProfile.firstName = formValue.firstName;
        this.patientProfile.lastName = formValue.lastName;
        this.patientProfile.email = formValue.email;
        this.patientProfile.dateOfBirth = new Date(formValue.dateOfBirth);
        this.patientProfile.gender = formValue.gender;
        this.patientProfile.bloodGroup = formValue.bloodGroup;
      }
      
      this.editingPersonalInfo = false;
      this.successMessage = 'Personal information updated successfully';
      this.saving = false;
    }, 1000);
  }
  
  saveContactInfo(): void {
    if (this.contactInfoForm.invalid) {
      this.markFormGroupTouched(this.contactInfoForm);
      return;
    }
    
    this.saving = true;
    
    // Simulate API call
    setTimeout(() => {
      if (this.patientProfile) {
        const formValue = this.contactInfoForm.value;
        this.patientProfile.phoneNumber = formValue.phoneNumber;
        this.patientProfile.address = {
          street: formValue.street,
          city: formValue.city,
          state: formValue.state,
          zipCode: formValue.zipCode,
          country: formValue.country
        };
        this.patientProfile.emergencyContact = {
          name: formValue.emergencyName,
          relationship: formValue.emergencyRelationship,
          phoneNumber: formValue.emergencyPhone
        };
      }
      
      this.editingContact = false;
      this.successMessage = 'Contact information updated successfully';
      this.saving = false;
    }, 1000);
  }
  
  saveMedicalInfo(): void {
    if (this.medicalInfoForm.invalid) {
      this.markFormGroupTouched(this.medicalInfoForm);
      return;
    }
    
    this.saving = true;
    
    // Simulate API call
    setTimeout(() => {
      if (this.patientProfile) {
        const formValue = this.medicalInfoForm.value;
        this.patientProfile.medicalInfo = {
          allergies: this.stringToArray(formValue.allergies),
          chronicConditions: this.stringToArray(formValue.chronicConditions),
          currentMedications: this.stringToArray(formValue.currentMedications),
          pastSurgeries: this.stringToArray(formValue.pastSurgeries),
          familyHistory: this.stringToArray(formValue.familyHistory)
        };
      }
      
      this.editingMedicalInfo = false;
      this.successMessage = 'Medical information updated successfully';
      this.saving = false;
    }, 1000);
  }
  
  saveInsuranceInfo(): void {
    if (this.insuranceInfoForm.invalid) {
      this.markFormGroupTouched(this.insuranceInfoForm);
      return;
    }
    
    this.saving = true;
    
    // Simulate API call
    setTimeout(() => {
      if (this.patientProfile) {
        const formValue = this.insuranceInfoForm.value;
        this.patientProfile.insurance = {
          provider: formValue.provider,
          policyNumber: formValue.policyNumber,
          groupNumber: formValue.groupNumber,
          expiryDate: new Date(formValue.expiryDate)
        };
      }
      
      this.editingInsurance = false;
      this.successMessage = 'Insurance information updated successfully';
      this.saving = false;
    }, 1000);
  }
  
  // Change password
  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }
    
    this.saving = true;
    
    // Simulate API call
    setTimeout(() => {
      // Mock validation for current password
      if (this.passwordForm.value.currentPassword !== 'password123') {
        this.errorMessage = 'Current password is incorrect';
        this.saving = false;
        return;
      }
      
      this.successMessage = 'Password changed successfully';
      this.passwordForm.reset();
      this.saving = false;
    }, 1000);
  }
  
  // Upload profile picture (mock implementation)
  uploadProfilePicture(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      
      // Mock implementation - in real app would upload to server
      const reader = new FileReader();
      reader.onload = (e) => {
        if (this.patientProfile && e.target?.result) {
          this.patientProfile.avatar = e.target.result as string;
          this.successMessage = 'Profile picture updated successfully';
        }
      };
      reader.readAsDataURL(file);
    }
  }
  
  // Helper methods
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
  
  stringToArray(str: string): string[] {
    return str.split(',')
      .map(item => item.trim())
      .filter(item => item !== '');
  }
  
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
  
  // Password match validator
  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return newPassword === confirmPassword ? null : { mismatch: true };
  }
  
  // Generate mock patient profile
  private generateMockPatientProfile(): PatientProfile {
    return {
      id: 'patient-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1 (555) 123-4567',
      dateOfBirth: new Date(1985, 5, 15),
      gender: 'male',
      bloodGroup: 'O+',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'California',
        zipCode: '12345',
        country: 'United States'
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phoneNumber: '+1 (555) 987-6543'
      },
      medicalInfo: {
        allergies: ['Penicillin', 'Peanuts'],
        chronicConditions: ['Hypertension', 'Asthma'],
        currentMedications: ['Lisinopril 10mg', 'Albuterol inhaler'],
        pastSurgeries: ['Appendectomy (2010)'],
        familyHistory: ['Diabetes (Father)', 'Heart Disease (Grandfather)']
      },
      insurance: {
        provider: 'HealthPlus Insurance',
        policyNumber: 'HP12345678',
        groupNumber: 'GP987654',
        expiryDate: new Date(2024, 11, 31)
      },
      avatar: 'assets/avatars/avatar-1.jpg'
    };
  }
} 