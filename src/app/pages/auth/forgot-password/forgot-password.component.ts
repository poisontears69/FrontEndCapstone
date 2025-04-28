import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, ForgotPasswordRequest } from '../../../core/services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule]
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
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

    const forgotPasswordRequest: ForgotPasswordRequest = {
      email: this.forgotPasswordForm.value.email
    };

    this.authService.forgotPassword(forgotPasswordRequest).subscribe({
      next: (response) => {
        this.successMessage = 'Password reset instructions have been sent to your email.';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Forgot password error', error);
        this.errorMessage = error.error?.message || 'Failed to send reset instructions. Please try again.';
        this.isLoading = false;
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
  
  navigateToHome(): void {
    this.router.navigate(['/home']);
  }
} 