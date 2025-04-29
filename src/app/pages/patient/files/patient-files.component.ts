import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MedicalFile {
  id: string;
  fileName: string;
  fileType: 'lab' | 'prescription' | 'imaging' | 'report' | 'other';
  fileSize: number;
  uploadDate: Date;
  doctorName?: string;
  category: string;
  fileUrl: string;
  thumbnailUrl?: string;
  isShared: boolean;
  description?: string;
}

@Component({
  selector: 'app-patient-files',
  templateUrl: './patient-files.component.html',
  styleUrls: ['./patient-files.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  providers: [DatePipe]
})
export class PatientFilesComponent implements OnInit {
  // Files data
  allFiles: MedicalFile[] = [];
  filteredFiles: MedicalFile[] = [];
  
  // Categories for filtering
  categories = [
    { id: 'all', name: 'All Files' },
    { id: 'lab', name: 'Lab Results' },
    { id: 'prescription', name: 'Prescriptions' },
    { id: 'imaging', name: 'Imaging & Scans' },
    { id: 'report', name: 'Medical Reports' },
    { id: 'other', name: 'Other Documents' }
  ];
  
  // Selected category for filtering
  selectedCategory = 'all';
  
  // Search query
  searchQuery = '';
  
  // View mode (grid or list)
  viewMode: 'grid' | 'list' = 'grid';
  
  // Sorting
  sortField: 'fileName' | 'uploadDate' | 'fileSize' = 'uploadDate';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // File preview
  selectedFile: MedicalFile | null = null;
  showPreviewModal = false;
  
  // Upload modal
  showUploadModal = false;
  
  // Share modal
  showShareModal = false;
  
  // Loading state
  loading = true;
  
  // Error state
  error = false;
  errorMessage = '';
  
  constructor() {}
  
  ngOnInit(): void {
    this.loadFiles();
  }
  
  // Load files
  loadFiles(): void {
    this.loading = true;
    this.error = false;
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        this.allFiles = this.generateMockFiles();
        this.applyFilters();
        this.loading = false;
      } catch (err) {
        this.error = true;
        this.errorMessage = 'Failed to load files. Please try again.';
        this.loading = false;
      }
    }, 1000);
  }
  
  // Apply filters and sorting
  applyFilters(): void {
    let results = [...this.allFiles];
    
    // Apply category filter
    if (this.selectedCategory !== 'all') {
      results = results.filter(file => file.fileType === this.selectedCategory);
    }
    
    // Apply search filter if search query exists
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      results = results.filter(file => 
        file.fileName.toLowerCase().includes(query) ||
        (file.description && file.description.toLowerCase().includes(query)) ||
        (file.doctorName && file.doctorName.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    results.sort((a, b) => {
      let comparison = 0;
      
      if (this.sortField === 'fileName') {
        comparison = a.fileName.localeCompare(b.fileName);
      } else if (this.sortField === 'uploadDate') {
        comparison = a.uploadDate.getTime() - b.uploadDate.getTime();
      } else if (this.sortField === 'fileSize') {
        comparison = a.fileSize - b.fileSize;
      }
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
    
    this.filteredFiles = results;
  }
  
  // Filter by category
  filterByCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }
  
  // Handle search
  onSearch(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }
  
  // Toggle view mode
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }
  
  // Change sort options
  changeSort(field: 'fileName' | 'uploadDate' | 'fileSize'): void {
    if (this.sortField === field) {
      // Toggle direction if same field
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new field and default to descending for date, ascending for name
      this.sortField = field;
      this.sortDirection = field === 'uploadDate' ? 'desc' : 'asc';
    }
    
    this.applyFilters();
  }
  
  // View file details/preview
  viewFile(file: MedicalFile): void {
    this.selectedFile = file;
    this.showPreviewModal = true;
  }
  
  // Download file
  downloadFile(file: MedicalFile): void {
    // In a real application, this would trigger an actual download
    console.log('Downloading file:', file.fileName);
    
    // Simulate download success notification
    alert(`Downloading ${file.fileName}`);
  }
  
  // Open upload modal
  openUploadModal(): void {
    this.showUploadModal = true;
  }
  
  // Close upload modal
  closeUploadModal(): void {
    this.showUploadModal = false;
  }
  
  // Open share modal
  openShareModal(file: MedicalFile): void {
    this.selectedFile = file;
    this.showShareModal = true;
  }
  
  // Close share modal
  closeShareModal(): void {
    this.showShareModal = false;
  }
  
  // Close preview modal
  closePreviewModal(): void {
    this.showPreviewModal = false;
    this.selectedFile = null;
  }
  
  // Share file
  shareFile(file: MedicalFile): void {
    file.isShared = true;
    this.closeShareModal();
    
    // In a real app, this would be an API call
    console.log('File shared:', file.fileName);
  }
  
  // Toggle file sharing status
  toggleShareStatus(file: MedicalFile): void {
    file.isShared = !file.isShared;
    
    // In a real app, this would be an API call
    console.log(`File ${file.isShared ? 'shared' : 'unshared'}:`, file.fileName);
  }
  
  // Upload file (mock implementation)
  uploadFile(fileData: any): void {
    // In a real app, this would upload to a server
    console.log('Uploading file:', fileData);
    
    // Mock a new file being added
    const newFile: MedicalFile = {
      id: `file-${Date.now()}`,
      fileName: fileData.fileName || 'New File.pdf',
      fileType: fileData.fileType || 'other',
      fileSize: fileData.fileSize || 1024 * 1024, // 1MB default
      uploadDate: new Date(),
      category: fileData.category || 'Other',
      fileUrl: '#',
      isShared: false,
      description: fileData.description || ''
    };
    
    this.allFiles.unshift(newFile);
    this.applyFilters();
    this.closeUploadModal();
  }
  
  // Get file icon based on type
  getFileIcon(fileType: string): string {
    switch (fileType) {
      case 'lab': return 'fas fa-flask';
      case 'prescription': return 'fas fa-prescription';
      case 'imaging': return 'fas fa-x-ray';
      case 'report': return 'fas fa-file-medical-alt';
      case 'other':
      default: return 'fas fa-file-medical';
    }
  }
  
  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
  }
  
  // Generate mock files for demo
  private generateMockFiles(): MedicalFile[] {
    const mockFiles: MedicalFile[] = [];
    const fileTypes: ('lab' | 'prescription' | 'imaging' | 'report' | 'other')[] = ['lab', 'prescription', 'imaging', 'report', 'other'];
    const doctorNames = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Jones', 'Dr. Miller', 'Dr. Davis'];
    
    // File descriptions
    const descriptions = {
      lab: ['Blood Test Results', 'Cholesterol Panel', 'Thyroid Function Test', 'Complete Blood Count', 'Liver Function Test', 'Kidney Function Test'],
      prescription: ['Lisinopril Prescription', 'Metformin Prescription', 'Atorvastatin Prescription', 'Levothyroxine Prescription'],
      imaging: ['Chest X-Ray', 'MRI Brain Scan', 'Abdominal Ultrasound', 'Bone Density Scan', 'CT Scan Results'],
      report: ['Annual Physical Examination', 'Cardiology Consultation', 'Neurology Evaluation', 'Surgical Report', 'Hospital Discharge Summary'],
      other: ['Medical History Form', 'Insurance Information', 'Vaccination Records', 'Allergy Test Results', 'Nutrition Plan']
    };
    
    // Generate 20 mock files
    for (let i = 0; i < 20; i++) {
      const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
      const descList = descriptions[fileType];
      const description = descList[Math.floor(Math.random() * descList.length)];
      
      // Generate a date within the last year
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 365));
      
      const file: MedicalFile = {
        id: `file-${i}`,
        fileName: `${description}.${fileType === 'prescription' ? 'pdf' : fileType === 'imaging' ? 'jpg' : fileType === 'lab' ? 'pdf' : 'pdf'}`,
        fileType: fileType,
        fileSize: Math.floor(Math.random() * 5 * 1024 * 1024) + 100 * 1024, // 100KB to 5MB
        uploadDate: date,
        doctorName: Math.random() > 0.3 ? doctorNames[Math.floor(Math.random() * doctorNames.length)] : undefined,
        category: description.split(' ')[0],
        fileUrl: '#', // In real app, this would be an actual URL
        thumbnailUrl: fileType === 'imaging' ? 'assets/images/imaging-thumbnail.jpg' : undefined,
        isShared: Math.random() > 0.7,
        description: description
      };
      
      mockFiles.push(file);
    }
    
    // Sort by upload date (newest first)
    return mockFiles.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
  }
} 