import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface PrivacySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface ConnectedAccount {
  id: string;
  provider: string;
  accountName: string;
  connected: boolean;
  icon: string;
}

@Component({
  selector: 'app-patient-settings',
  templateUrl: './patient-settings.component.html',
  styleUrls: ['./patient-settings.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class PatientSettingsComponent implements OnInit {
  // Active tab
  activeTab: 'notifications' | 'privacy' | 'accounts' | 'appearance' = 'notifications';
  
  // Notification settings
  notificationSettings: NotificationSetting[] = [];
  
  // Privacy settings
  privacySettings: PrivacySetting[] = [];
  
  // Connected accounts
  connectedAccounts: ConnectedAccount[] = [];
  
  // Appearance settings
  darkMode = false;
  fontSize = 'medium';
  fontSizeOptions = [
    { id: 'small', name: 'Small' },
    { id: 'medium', name: 'Medium' },
    { id: 'large', name: 'Large' }
  ];
  
  // Password change form
  passwordForm: FormGroup;
  
  // Data export request
  exportRequested = false;
  
  // Loading & save states
  loading = true;
  saving = false;
  
  // Success and error messages
  successMessage = '';
  errorMessage = '';
  
  constructor(private fb: FormBuilder) {
    // Initialize password form
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }
  
  ngOnInit(): void {
    this.loadSettings();
  }
  
  // Load settings data
  loadSettings(): void {
    this.loading = true;
    
    // Simulate API call delay
    setTimeout(() => {
      this.notificationSettings = this.generateMockNotificationSettings();
      this.privacySettings = this.generateMockPrivacySettings();
      this.connectedAccounts = this.generateMockConnectedAccounts();
      
      // Load appearance settings from localStorage if available
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode) {
        this.darkMode = savedDarkMode === 'true';
      }
      
      const savedFontSize = localStorage.getItem('fontSize');
      if (savedFontSize) {
        this.fontSize = savedFontSize;
      }
      
      this.loading = false;
    }, 1000);
  }
  
  // Set active tab
  setActiveTab(tab: 'notifications' | 'privacy' | 'accounts' | 'appearance'): void {
    this.activeTab = tab;
    this.clearMessages();
  }
  
  // Update notification setting
  updateNotificationSetting(setting: NotificationSetting): void {
    // In a real app, this would call an API
    this.saveChanges('Notification preferences updated successfully');
  }
  
  // Update privacy setting
  updatePrivacySetting(setting: PrivacySetting): void {
    // In a real app, this would call an API
    this.saveChanges('Privacy settings updated successfully');
  }
  
  // Toggle connected account
  toggleConnectedAccount(account: ConnectedAccount): void {
    account.connected = !account.connected;
    
    // In a real app, this would either connect or disconnect the account
    const message = account.connected
      ? `${account.provider} account connected successfully`
      : `${account.provider} account disconnected`;
    
    this.saveChanges(message);
  }
  
  // Request data export
  requestDataExport(): void {
    this.exportRequested = true;
    this.saveChanges('Data export requested. You will receive an email with your data within 48 hours.');
  }
  
  // Toggle dark mode
  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode.toString());
    
    // Apply dark mode to the document
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    this.saveChanges('Appearance settings updated successfully');
  }
  
  // Change font size
  changeFontSize(size: string): void {
    this.fontSize = size;
    localStorage.setItem('fontSize', size);
    
    // Apply font size to the document
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${size}`);
    
    this.saveChanges('Font size updated successfully');
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
  
  // Helper methods
  private saveChanges(message: string): void {
    this.saving = true;
    
    // Simulate API call
    setTimeout(() => {
      this.successMessage = message;
      this.saving = false;
    }, 800);
  }
  
  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
  
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
  
  // Password match validator
  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return newPassword === confirmPassword ? null : { mismatch: true };
  }
  
  // Generate mock data
  private generateMockNotificationSettings(): NotificationSetting[] {
    return [
      {
        id: 'appointment-reminder',
        name: 'Appointment Reminders',
        description: 'Receive reminders about upcoming appointments',
        email: true,
        sms: true,
        push: true
      },
      {
        id: 'appointment-updates',
        name: 'Appointment Updates',
        description: 'Get notified when an appointment is rescheduled or canceled',
        email: true,
        sms: true,
        push: true
      },
      {
        id: 'doctor-messages',
        name: 'Doctor Messages',
        description: 'Receive messages from your healthcare providers',
        email: true,
        sms: false,
        push: true
      },
      {
        id: 'prescription-updates',
        name: 'Prescription Updates',
        description: 'Get notified about prescription refills and updates',
        email: true,
        sms: false,
        push: false
      },
      {
        id: 'test-results',
        name: 'Test Results',
        description: 'Get notified when new test results are available',
        email: true,
        sms: false,
        push: true
      },
      {
        id: 'billing-updates',
        name: 'Billing & Payment',
        description: 'Receive invoices and payment confirmations',
        email: true,
        sms: false,
        push: false
      },
      {
        id: 'health-tips',
        name: 'Health Tips & Reminders',
        description: 'Receive personalized health tips and reminders',
        email: false,
        sms: false,
        push: false
      }
    ];
  }
  
  private generateMockPrivacySettings(): PrivacySetting[] {
    return [
      {
        id: 'profile-visibility',
        name: 'Profile Visibility',
        description: 'Allow doctors to view your profile when searching for patients',
        enabled: true
      },
      {
        id: 'sharing-medical-history',
        name: 'Medical History Sharing',
        description: 'Share your medical history with new doctors automatically',
        enabled: true
      },
      {
        id: 'third-party-sharing',
        name: 'Third-Party Data Sharing',
        description: 'Allow anonymized data to be shared with research partners',
        enabled: false
      },
      {
        id: 'location-tracking',
        name: 'Location Services',
        description: 'Use your location to find nearby healthcare services',
        enabled: true
      },
      {
        id: 'cookies',
        name: 'Analytics Cookies',
        description: 'Allow cookies to improve your experience and our services',
        enabled: true
      },
      {
        id: 'two-factor',
        name: 'Two-Factor Authentication',
        description: 'Require verification code when logging in from new devices',
        enabled: false
      }
    ];
  }
  
  private generateMockConnectedAccounts(): ConnectedAccount[] {
    return [
      {
        id: 'google',
        provider: 'Google',
        accountName: 'johndoe@gmail.com',
        connected: true,
        icon: 'fab fa-google'
      },
      {
        id: 'facebook',
        provider: 'Facebook',
        accountName: 'John Doe',
        connected: false,
        icon: 'fab fa-facebook'
      },
      {
        id: 'apple',
        provider: 'Apple',
        accountName: 'john.doe@icloud.com',
        connected: false,
        icon: 'fab fa-apple'
      },
      {
        id: 'fitbit',
        provider: 'Fitbit',
        accountName: 'JohnD2023',
        connected: true,
        icon: 'fab fa-fitbit'
      },
      {
        id: 'insurance',
        provider: 'Insurance Provider',
        accountName: 'HealthPlus Insurance',
        connected: true,
        icon: 'fas fa-heartbeat'
      }
    ];
  }
} 