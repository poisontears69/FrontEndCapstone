import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-home',
  templateUrl: './patient-home.component.html',
  styleUrls: ['./patient-home.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PatientHomeComponent implements OnInit {
  showModal = false;
  currentStep = 1;
  totalSteps = 5;
  
  // Steps for the appointment booking process
  steps = [
    { number: 1, title: 'Choose a doctor', icon: 'fas fa-user-md' },
    { number: 2, title: 'Fill up form', icon: 'fas fa-clipboard-list' },
    { number: 3, title: 'Scan GCash reference', icon: 'fas fa-qrcode' },
    { number: 4, title: 'Upload payment receipt', icon: 'fas fa-file-upload' },
    { number: 5, title: 'Wait for confirmation', icon: 'fas fa-check-circle' }
  ];

  constructor() { }

  ngOnInit(): void {
    // Show the modal automatically when the component loads
    setTimeout(() => {
      this.openModal();
    }, 1000);
  }

  openModal(): void {
    this.showModal = true;
    document.body.classList.add('modal-open');
  }

  closeModal(): void {
    this.showModal = false;
    document.body.classList.remove('modal-open');
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  resetSteps(): void {
    this.currentStep = 1;
  }

  // Closes modal on backdrop click if it's not a child element
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }
} 