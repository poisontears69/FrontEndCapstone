import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PatientSidebarComponent } from '../patient-sidebar/patient-sidebar.component';

@Component({
  selector: 'app-patient-layout',
  templateUrl: './patient-layout.component.html',
  styleUrls: ['./patient-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, PatientSidebarComponent]
})
export class PatientLayoutComponent {
  // The current year for footer copyright
  currentYear: number = new Date().getFullYear();
} 