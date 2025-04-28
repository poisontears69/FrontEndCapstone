import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-of-service',
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TermsOfServiceComponent {
  currentYear = new Date().getFullYear();
} 