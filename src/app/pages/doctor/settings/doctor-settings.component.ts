import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorPlaceholderComponent } from '../shared/placeholder/doctor-placeholder.component';

@Component({
  selector: 'app-doctor-settings',
  template: `<app-doctor-placeholder title="Settings" icon="fas fa-cog"></app-doctor-placeholder>`,
  standalone: true,
  imports: [CommonModule, DoctorPlaceholderComponent]
})
export class DoctorSettingsComponent {} 