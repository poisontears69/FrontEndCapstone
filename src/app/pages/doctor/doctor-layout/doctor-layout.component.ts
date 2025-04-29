import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DoctorSidebarComponent } from '../doctor-sidebar/doctor-sidebar.component';

@Component({
  selector: 'app-doctor-layout',
  templateUrl: './doctor-layout.component.html',
  styleUrls: ['./doctor-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, DoctorSidebarComponent]
})
export class DoctorLayoutComponent {
  // The current year for footer copyright
  currentYear: number = new Date().getFullYear();
} 