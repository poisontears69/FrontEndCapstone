import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PatientService } from '../services/patient.service';
import { Patient, PatientGroup } from '../models/patient.model';

@Component({
  selector: 'app-doctor-patients',
  templateUrl: './doctor-patients.component.html',
  styleUrls: ['./doctor-patients.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class DoctorPatientsComponent implements OnInit {
  // Patients data
  allPatients: Patient[] = [];
  filteredPatients: Patient[] = [];
  patientGroups: PatientGroup[] = [];
  
  // Search
  searchQuery = '';
  
  // UI state
  isLoading = true;
  error = '';
  activeIndex = -1;
  
  // Alphabetical index for quick navigation
  alphabetIndex = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  alphabetMap: { [key: string]: boolean } = {};
  
  constructor(private patientService: PatientService) { }

  ngOnInit(): void {
    this.loadPatients();
  }
  
  loadPatients(): void {
    this.isLoading = true;
    
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.allPatients = patients;
        this.filteredPatients = [...patients];
        this.groupPatients();
        this.buildAlphabetMap();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.error = 'Failed to load patients. Please try again later.';
        this.isLoading = false;
      }
    });
  }
  
  groupPatients(): void {
    this.patientGroups = this.patientService.groupPatientsByAlphabet(this.filteredPatients);
  }
  
  buildAlphabetMap(): void {
    // Reset the map
    this.alphabetMap = {};
    
    // For each letter in the index, check if we have patients starting with that letter
    this.alphabetIndex.forEach(letter => {
      this.alphabetMap[letter] = this.patientGroups.some(group => group.letter === letter);
    });
  }
  
  onSearch(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredPatients = [...this.allPatients];
    } else {
      this.filteredPatients = this.patientService.searchPatients(
        this.searchQuery, 
        this.allPatients
      );
    }
    
    this.groupPatients();
    this.buildAlphabetMap();
  }
  
  clearSearch(): void {
    this.searchQuery = '';
    this.filteredPatients = [...this.allPatients];
    this.groupPatients();
    this.buildAlphabetMap();
  }
  
  scrollToLetter(letter: string): void {
    if (!this.alphabetMap[letter]) {
      return;
    }
    
    const element = document.getElementById(`group-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  viewPatientDetails(patientId: string): void {
    // This would typically navigate to a patient detail view
    console.log(`Viewing patient: ${patientId}`);
  }
} 