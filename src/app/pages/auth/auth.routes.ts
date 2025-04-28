import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent
      },
      // These routes will be implemented later
      /*
      {
        path: 'reset-password',
        loadComponent: () => import('./reset-password/reset-password.component')
          .then(m => m.ResetPasswordComponent),
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./verify-email/verify-email.component')
          .then(m => m.VerifyEmailComponent),
      },
      */
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: 'login'
      }
    ]
  }
]; 