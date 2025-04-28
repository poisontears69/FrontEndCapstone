import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // This would be replaced with an actual auth service call
    setTimeout(() => {
      const { email, password } = this.loginForm.value;
      
      // Simplified auth logic for demonstration
      // In a real app, you would call an auth service
      if (email === 'patient@example.com' && password === 'password') {
        // Store user info in local storage
        localStorage.setItem('currentUser', JSON.stringify({
          id: '1',
          email,
          role: 'patient',
          token: 'fake-jwt-token'
        }));
        this.router.navigate(['/patient']);
      } else if (email === 'doctor@example.com' && password === 'password') {
        localStorage.setItem('currentUser', JSON.stringify({
          id: '2',
          email,
          role: 'doctor',
          token: 'fake-jwt-token'
        }));
        this.router.navigate(['/doctor']);
      } else if (email === 'admin@example.com' && password === 'password') {
        localStorage.setItem('currentUser', JSON.stringify({
          id: '3',
          email,
          role: 'admin',
          token: 'fake-jwt-token'
        }));
        this.router.navigate(['/admin']);
      } else {
        this.errorMessage = 'Invalid email or password';
      }
      
      this.isLoading = false;
    }, 1000); // Simulate network request
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }
} 