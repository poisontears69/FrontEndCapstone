import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// User model interfaces
interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

interface UserActivity {
  id: string;
  action: string;
  timestamp: Date;
  details?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastActive: Date;
  registrationDate: Date;
  phoneNumber?: string;
  activities?: UserActivity[];
}

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  providers: [DatePipe]
})
export class ManageUsersComponent implements OnInit {
  // State
  loading = true;
  error = false;
  errorMessage = '';
  
  // Data
  users: User[] = [];
  filteredUsers: User[] = [];
  roles: UserRole[] = [];
  
  // UI State
  selectedUser: User | null = null;
  selectedTab: 'info' | 'activity' | 'permissions' = 'info';
  viewMode: 'grid' | 'list' = 'grid';
  showUserModal = false;
  isEditing = false;
  showConfirmationModal = false;
  confirmationAction: 'activate' | 'deactivate' | 'suspend' | 'delete' | null = null;
  
  // Filters
  searchText = '';
  selectedStatus: string = 'all';
  selectedRole: string = 'all';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 1;
  
  // Forms
  userForm: FormGroup;
  
  // Search
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  constructor(private formBuilder: FormBuilder, private datePipe: DatePipe) {
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
      status: ['active', [Validators.required]],
      phoneNumber: ['', [Validators.pattern('^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$')]]
    });
    
    // Initialize search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchText = searchTerm;
      this.applyFilters();
    });
  }
  
  ngOnInit(): void {
    this.loadData();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Data Loading
  loadData(): void {
    this.loading = true;
    this.error = false;
    
    // Simulate API calls
    setTimeout(() => {
      try {
        this.users = this.generateMockUsers();
        this.roles = this.generateMockRoles();
        this.applyFilters();
        this.loading = false;
      } catch (e) {
        this.error = true;
        this.errorMessage = 'Failed to load users. Please try again.';
        this.loading = false;
      }
    }, 1000);
  }
  
  // Filtering
  applyFilters(): void {
    let filtered = [...this.users];
    
    // Apply search filter
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === this.selectedStatus);
    }
    
    // Apply role filter
    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }
    
    this.filteredUsers = filtered;
    this.calculateTotalPages();
    // Reset to first page when filters change
    this.currentPage = 1;
  }
  
  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm);
  }
  
  onStatusFilterChange(event: Event): void {
    this.selectedStatus = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }
  
  onRoleFilterChange(event: Event): void {
    this.selectedRole = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }
  
  // Pagination
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }
  
  getPaginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
  
  // User Modal Actions
  openAddUserModal(): void {
    this.isEditing = false;
    this.userForm.reset({ status: 'active' });
    this.showUserModal = true;
  }
  
  openEditUserModal(user: User): void {
    this.selectedUser = user;
    this.isEditing = true;
    
    this.userForm.setValue({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phoneNumber: user.phoneNumber || ''
    });
    
    this.showUserModal = true;
  }
  
  closeUserModal(): void {
    this.showUserModal = false;
    this.selectedUser = null;
  }
  
  saveUser(): void {
    if (this.userForm.invalid) {
      // Mark all fields as touched to trigger validation errors
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    const formData = this.userForm.value;
    
    if (this.isEditing && this.selectedUser) {
      // Edit existing user
      const index = this.users.findIndex(u => u.id === this.selectedUser?.id);
      if (index !== -1) {
        this.users[index] = {
          ...this.users[index],
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          phoneNumber: formData.phoneNumber
        };
      }
    } else {
      // Add new user
      const newUser: User = {
        id: `user-${Math.floor(Math.random() * 10000)}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        phoneNumber: formData.phoneNumber,
        avatar: `assets/avatars/avatar-${Math.floor(Math.random() * 8) + 1}.jpg`,
        lastActive: new Date(),
        registrationDate: new Date(),
        activities: []
      };
      
      this.users.unshift(newUser);
    }
    
    this.applyFilters();
    this.closeUserModal();
  }
  
  // User Details Modal
  openUserDetails(user: User): void {
    this.selectedUser = user;
    this.selectedTab = 'info';
  }
  
  closeUserDetails(): void {
    this.selectedUser = null;
  }
  
  setActiveTab(tab: 'info' | 'activity' | 'permissions'): void {
    this.selectedTab = tab;
  }
  
  // User Actions
  openConfirmationModal(action: 'activate' | 'deactivate' | 'suspend' | 'delete', user: User): void {
    this.selectedUser = user;
    this.confirmationAction = action;
    this.showConfirmationModal = true;
  }
  
  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
    this.confirmationAction = null;
  }
  
  confirmAction(): void {
    if (!this.selectedUser || !this.confirmationAction) return;
    
    const index = this.users.findIndex(u => u.id === this.selectedUser?.id);
    if (index === -1) return;
    
    switch (this.confirmationAction) {
      case 'activate':
        this.users[index].status = 'active';
        break;
      case 'deactivate':
        this.users[index].status = 'inactive';
        break;
      case 'suspend':
        this.users[index].status = 'suspended';
        break;
      case 'delete':
        this.users.splice(index, 1);
        break;
    }
    
    this.applyFilters();
    this.closeConfirmationModal();
    this.selectedUser = null;
  }
  
  // View Mode
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }
  
  // Utility Functions
  getRoleName(roleId: string): string {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'suspended': return 'status-suspended';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }
  
  getRolePermissions(roleId: string): string[] {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.permissions : [];
  }
  
  // Mock Data Generation
  private generateMockUsers(): User[] {
    const statuses: ('active' | 'inactive' | 'suspended' | 'pending')[] = ['active', 'inactive', 'suspended', 'pending'];
    const roles = ['admin', 'doctor', 'patient', 'receptionist', 'nurse'];
    const users: User[] = [];
    
    // Generate 30 mock users
    for (let i = 0; i < 30; i++) {
      const firstName = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Jessica', 'William', 'Amanda'][Math.floor(Math.random() * 10)];
      const lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'][Math.floor(Math.random() * 10)];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
      const role = roles[Math.floor(Math.random() * roles.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Generate registration date (between 1 day and 2 years ago)
      const registrationDate = new Date();
      registrationDate.setDate(registrationDate.getDate() - Math.floor(Math.random() * 730) - 1);
      
      // Generate last active date (after registration date)
      const lastActive = new Date(registrationDate);
      lastActive.setDate(lastActive.getDate() + Math.floor(Math.random() * (new Date().getDate() - registrationDate.getDate() + 1)));
      
      // Generate activities
      const activities: UserActivity[] = [];
      const numActivities = Math.floor(Math.random() * 10) + 1;
      
      const actionTypes = [
        'Login', 'Profile update', 'Password change', 
        'Appointment scheduled', 'Message sent', 'Document uploaded'
      ];
      
      for (let j = 0; j < numActivities; j++) {
        const activityDate = new Date(registrationDate);
        activityDate.setDate(activityDate.getDate() + Math.floor(Math.random() * (new Date().getDate() - registrationDate.getDate() + 1)));
        
        activities.push({
          id: `activity-${i}-${j}`,
          action: actionTypes[Math.floor(Math.random() * actionTypes.length)],
          timestamp: activityDate,
          details: Math.random() > 0.5 ? `IP: 192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : undefined
        });
      }
      
      // Sort activities by timestamp (newest first)
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      users.push({
        id: `user-${i}`,
        name,
        email,
        role,
        status,
        avatar: `assets/avatars/avatar-${(i % 8) + 1}.jpg`,
        lastActive,
        registrationDate,
        phoneNumber: Math.random() > 0.3 ? `+1 ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}` : undefined,
        activities
      });
    }
    
    return users;
  }
  
  private generateMockRoles(): UserRole[] {
    return [
      {
        id: 'admin',
        name: 'Administrator',
        permissions: ['manage_users', 'manage_doctors', 'manage_patients', 'view_reports', 'edit_settings']
      },
      {
        id: 'doctor',
        name: 'Doctor',
        permissions: ['view_patients', 'manage_appointments', 'create_prescriptions', 'upload_documents']
      },
      {
        id: 'patient',
        name: 'Patient',
        permissions: ['view_profile', 'book_appointments', 'view_medical_records', 'message_doctors']
      },
      {
        id: 'receptionist',
        name: 'Receptionist',
        permissions: ['view_appointments', 'manage_schedules', 'register_patients', 'process_payments']
      },
      {
        id: 'nurse',
        name: 'Nurse',
        permissions: ['view_patients', 'update_vitals', 'administer_medication', 'assist_doctors']
      }
    ];
  }
} 