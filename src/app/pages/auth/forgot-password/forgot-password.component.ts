import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // This would be replaced with an actual auth service call
    setTimeout(() => {
      const { email } = this.forgotPasswordForm.value;
      
      // In a real app, this would send a reset link to the user's email
      console.log('Password reset requested for:', email);
      
      this.successMessage = 'Password reset instructions have been sent to your email.';
      this.isLoading = false;
    }, 1500); // Simulate network request
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
} 