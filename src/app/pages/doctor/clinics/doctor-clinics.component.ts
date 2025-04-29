import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Clinic, Schedule, Day, weekDays } from '../models/clinic.model';
import { ClinicService } from '../services/clinic.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-doctor-clinics',
  templateUrl: './doctor-clinics.component.html',
  styleUrls: ['./doctor-clinics.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class DoctorClinicsComponent implements OnInit {
  clinics: Clinic[] = [];
  filteredClinics: Clinic[] = [];
  clinicForm!: FormGroup;
  selectedClinic: Clinic | null = null;
  isLoading = false;
  isEditing = false;
  formSubmitted = false;
  errorMessage = '';
  successMessage = '';
  weekDays = weekDays;
  searchQuery = '';
  activeFilter: 'all' | 'active' | 'inactive' = 'all';
  
  constructor(
    private fb: FormBuilder,
    private clinicService: ClinicService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadClinics();
  }

  // Get day label from day enum
  getDayLabel(day: Day): string {
    const dayObj = this.weekDays.find(d => d.value === day);
    return dayObj ? dayObj.label : day;
  }

  // Initialize the form
  initForm(): void {
    this.clinicForm = this.fb.group({
      name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      landline: ['', [Validators.required, Validators.pattern(/^[0-9-+]+$/)]],
      description: [''],
      isActive: [true],
      schedules: this.fb.array([])
    });
    
    // Add one empty schedule by default
    this.addSchedule();
  }

  // Get schedules FormArray
  get schedules(): FormArray {
    return this.clinicForm.get('schedules') as FormArray;
  }

  // Add a new schedule
  addSchedule(): void {
    const scheduleGroup = this.fb.group({
      day: [Day.MONDAY, Validators.required],
      startTime: ['08:00', [Validators.required]],
      endTime: ['17:00', [Validators.required]],
      isActive: [true]
    });
    
    this.schedules.push(scheduleGroup);
  }

  // Remove a schedule
  removeSchedule(index: number): void {
    this.schedules.removeAt(index);
  }

  // Load all clinics
  loadClinics(): void {
    this.isLoading = true;
    this.clinicService.getClinics().subscribe({
      next: (clinics: Clinic[]) => {
        this.clinics = clinics;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Failed to load clinics. Please try again.';
        console.error('Error loading clinics:', error);
        this.isLoading = false;
      }
    });
  }

  // Filter clinics based on search and active status
  applyFilters(): void {
    this.filteredClinics = this.clinics.filter(clinic => {
      // Apply search filter
      const matchesSearch = this.searchQuery === '' || 
        clinic.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        clinic.address.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        clinic.landline.includes(this.searchQuery);
      
      // Apply active status filter
      let matchesStatus = true;
      if (this.activeFilter === 'active') {
        matchesStatus = clinic.isActive !== false;
      } else if (this.activeFilter === 'inactive') {
        matchesStatus = clinic.isActive === false;
      }
      
      return matchesSearch && matchesStatus;
    });
  }

  // Search handler
  onSearch(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  // Filter by status
  filterByStatus(status: 'all' | 'active' | 'inactive'): void {
    this.activeFilter = status;
    this.applyFilters();
  }

  // Create a new clinic
  createClinic(): void {
    if (this.clinicForm.invalid) {
      this.markFormGroupTouched(this.clinicForm);
      return;
    }

    // Check for schedule overlaps within the clinic
    if (this.scheduleHasOverlaps()) {
      this.errorMessage = 'Schedule times overlap. Please adjust your schedules.';
      return;
    }

    // Check for schedule overlaps across clinics
    if (this.schedulesOverlapWithOtherClinics()) {
      this.errorMessage = 'Schedules overlap with your other clinics. Please adjust your schedules or deactivate conflicting schedules.';
      return;
    }

    this.isLoading = true;
    const clinic: Clinic = this.clinicForm.value;
    
    this.clinicService.createClinic(clinic).subscribe({
      next: (createdClinic: Clinic) => {
        this.clinics.push(createdClinic);
        this.applyFilters();
        this.resetForm();
        this.successMessage = 'Clinic created successfully.';
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Failed to create clinic. Please try again.';
        console.error('Error creating clinic:', error);
        this.isLoading = false;
      }
    });
  }

  // Edit a clinic
  editClinic(clinic: Clinic): void {
    this.selectedClinic = clinic;
    this.isEditing = true;
    
    // Reset form and rebuild it with clinic data
    this.initForm();
    
    // Clear the schedules array first
    while (this.schedules.length !== 0) {
      this.schedules.removeAt(0);
    }
    
    // Patch the form with clinic data
    this.clinicForm.patchValue({
      name: clinic.name,
      address: clinic.address,
      landline: clinic.landline,
      description: clinic.description || '',
      isActive: clinic.isActive !== false
    });
    
    // Add each schedule
    clinic.schedules.forEach(schedule => {
      const scheduleGroup = this.fb.group({
        id: [schedule.id],
        day: [schedule.day, Validators.required],
        startTime: [schedule.startTime, Validators.required],
        endTime: [schedule.endTime, Validators.required],
        isActive: [schedule.isActive]
      });
      this.schedules.push(scheduleGroup);
    });
    
    // If no schedules, add an empty one
    if (clinic.schedules.length === 0) {
      this.addSchedule();
    }
  }

  // Update a clinic
  updateClinic(): void {
    if (this.clinicForm.invalid || !this.selectedClinic) {
      this.markFormGroupTouched(this.clinicForm);
      return;
    }

    // Check for schedule overlaps within the clinic
    if (this.scheduleHasOverlaps()) {
      this.errorMessage = 'Schedule times overlap. Please adjust your schedules.';
      return;
    }

    // Check for schedule overlaps with other clinics
    if (this.schedulesOverlapWithOtherClinics(this.selectedClinic.id)) {
      this.errorMessage = 'Schedules overlap with your other clinics. Please adjust your schedules or deactivate conflicting schedules.';
      return;
    }
    
    this.isLoading = true;
    const updatedClinic: Clinic = {
      ...this.selectedClinic,
      ...this.clinicForm.value
    };
    
    this.clinicService.updateClinic(this.selectedClinic.id!, updatedClinic).subscribe({
      next: (clinic: Clinic) => {
        // Update the clinic in the list
        const index = this.clinics.findIndex(c => c.id === clinic.id);
        if (index !== -1) {
          this.clinics[index] = clinic;
        }
        
        this.applyFilters();
        this.cancelEdit();
        this.successMessage = 'Clinic updated successfully.';
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Failed to update clinic. Please try again.';
        console.error('Error updating clinic:', error);
        this.isLoading = false;
      }
    });
  }

  // Toggle clinic active status
  toggleClinicStatus(clinic: Clinic): void {
    const updatedClinic = {
      ...clinic,
      isActive: !clinic.isActive
    };
    
    this.isLoading = true;
    
    this.clinicService.updateClinic(clinic.id!, updatedClinic).subscribe({
      next: (result: Clinic) => {
        // Update the clinic in the list
        const index = this.clinics.findIndex(c => c.id === result.id);
        if (index !== -1) {
          this.clinics[index] = result;
        }
        
        this.applyFilters();
        this.successMessage = `Clinic ${result.isActive ? 'activated' : 'deactivated'} successfully.`;
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = `Failed to ${clinic.isActive ? 'deactivate' : 'activate'} clinic. Please try again.`;
        console.error('Error updating clinic status:', error);
        this.isLoading = false;
      }
    });
  }

  // Delete a clinic
  deleteClinic(clinic: Clinic): void {
    if (!confirm(`Are you sure you want to delete clinic "${clinic.name}"?`)) {
      return;
    }
    
    this.isLoading = true;
    
    this.clinicService.deleteClinic(clinic.id!).subscribe({
      next: () => {
        // Remove the clinic from the list
        this.clinics = this.clinics.filter(c => c.id !== clinic.id);
        this.applyFilters();
        this.successMessage = 'Clinic deleted successfully.';
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Failed to delete clinic. Please try again.';
        console.error('Error deleting clinic:', error);
        this.isLoading = false;
      }
    });
  }

  // Cancel editing
  cancelEdit(): void {
    this.selectedClinic = null;
    this.isEditing = false;
    this.resetForm();
  }

  // Reset the form
  resetForm(): void {
    this.initForm();
    this.formSubmitted = false;
    this.errorMessage = '';
  }

  // Check if schedules within the same clinic overlap
  scheduleHasOverlaps(): boolean {
    const schedules = this.clinicForm.get('schedules')?.value as Schedule[];
    return this.clinicService.checkScheduleOverlap(schedules);
  }

  // Check if schedules overlap with other clinics
  schedulesOverlapWithOtherClinics(currentClinicId?: string): boolean {
    const newSchedules = this.clinicForm.get('schedules')?.value as Schedule[];
    const isActive = this.clinicForm.get('isActive')?.value as boolean;
    
    // If the clinic is inactive, no need to check for overlaps
    if (!isActive) {
      return false;
    }
    
    // Only check active schedules
    const activeSchedules = newSchedules.filter(s => s.isActive);
    
    // If no active schedules, no overlaps
    if (activeSchedules.length === 0) {
      return false;
    }
    
    // Check each schedule against all other clinics' schedules
    return this.clinics.some(clinic => {
      // Skip inactive clinics and the current clinic being edited
      if (!clinic.isActive || clinic.id === currentClinicId) {
        return false;
      }
      
      // For each active schedule in the current form
      return activeSchedules.some(newSchedule => {
        // Check if it overlaps with any schedule in the other clinic
        return clinic.schedules.some(existingSchedule => {
          // Skip inactive schedules and different days
          if (!existingSchedule.isActive || newSchedule.day !== existingSchedule.day) {
            return false;
          }
          
          // Check for time overlap
          const newStart = this.timeToMinutes(newSchedule.startTime);
          const newEnd = this.timeToMinutes(newSchedule.endTime);
          const existingStart = this.timeToMinutes(existingSchedule.startTime);
          const existingEnd = this.timeToMinutes(existingSchedule.endTime);
          
          // Check for overlap
          return (
            (newStart >= existingStart && newStart < existingEnd) ||
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)
          );
        });
      });
    });
  }

  // Convert time string (HH:MM) to minutes for easier comparison
  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Recursively mark all controls in a form group as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Submit form handler
  submitForm(): void {
    this.formSubmitted = true;
    this.errorMessage = '';
    
    if (this.isEditing) {
      this.updateClinic();
    } else {
      this.createClinic();
    }
  }
} 