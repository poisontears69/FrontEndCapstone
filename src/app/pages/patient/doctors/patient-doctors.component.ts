import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  experience: number;
  hospital: string;
  isAvailable: boolean;
  isFavorite: boolean;
  education: string[];
  languages: string[];
  consultationFee: number;
  availability: {
    days: string[];
    hours: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  about: string;
}

@Component({
  selector: 'app-patient-doctors',
  templateUrl: './patient-doctors.component.html',
  styleUrls: ['./patient-doctors.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
})
export class PatientDoctorsComponent implements OnInit {
  // Doctors data
  allDoctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  
  // Filters
  searchQuery = '';
  selectedSpecialty = 'all';
  showOnlyAvailable = false;
  showOnlyFavorites = false;
  
  // Sort options
  sortBy: 'name' | 'rating' | 'experience' | 'fee' = 'rating';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Doctor specialties for filter
  specialties = [
    { id: 'all', name: 'All Specialties' },
    { id: 'cardiology', name: 'Cardiology' },
    { id: 'dermatology', name: 'Dermatology' },
    { id: 'endocrinology', name: 'Endocrinology' },
    { id: 'gastroenterology', name: 'Gastroenterology' },
    { id: 'neurology', name: 'Neurology' },
    { id: 'obstetrics', name: 'Obstetrics & Gynecology' },
    { id: 'ophthalmology', name: 'Ophthalmology' },
    { id: 'orthopedics', name: 'Orthopedics' },
    { id: 'pediatrics', name: 'Pediatrics' },
    { id: 'psychiatry', name: 'Psychiatry' },
    { id: 'urology', name: 'Urology' }
  ];
  
  // Doctor detail view
  selectedDoctor: Doctor | null = null;
  showDoctorDetail = false;
  
  // Loading state
  loading = true;
  
  // Error state
  error = false;
  errorMessage = '';
  
  // Appointment booking
  showBookingModal = false;
  
  constructor() {}
  
  ngOnInit(): void {
    this.loadDoctors();
  }
  
  // Load doctors
  loadDoctors(): void {
    this.loading = true;
    this.error = false;
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        this.allDoctors = this.generateMockDoctors();
        this.applyFilters();
        this.loading = false;
      } catch (err) {
        this.error = true;
        this.errorMessage = 'Failed to load doctors. Please try again.';
        this.loading = false;
      }
    }, 1000);
  }
  
  // Apply filters and sorting
  applyFilters(): void {
    let results = [...this.allDoctors];
    
    // Apply specialty filter
    if (this.selectedSpecialty !== 'all') {
      results = results.filter(doctor => {
        const specialty = doctor.specialty.toLowerCase();
        return specialty.includes(this.selectedSpecialty.toLowerCase());
      });
    }
    
    // Apply availability filter
    if (this.showOnlyAvailable) {
      results = results.filter(doctor => doctor.isAvailable);
    }
    
    // Apply favorites filter
    if (this.showOnlyFavorites) {
      results = results.filter(doctor => doctor.isFavorite);
    }
    
    // Apply search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      results = results.filter(doctor =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query) ||
        doctor.hospital.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          comparison = b.rating - a.rating;  // Higher rating first
          break;
        case 'experience':
          comparison = b.experience - a.experience; // More experience first
          break;
        case 'fee':
          comparison = a.consultationFee - b.consultationFee; // Lower fee first
          break;
      }
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
    
    this.filteredDoctors = results;
  }
  
  // Filter by specialty
  filterBySpecialty(specialtyId: string): void {
    this.selectedSpecialty = specialtyId;
    this.applyFilters();
  }
  
  // Handle search
  onSearch(): void {
    this.applyFilters();
  }
  
  // Toggle availability filter
  toggleAvailabilityFilter(): void {
    this.showOnlyAvailable = !this.showOnlyAvailable;
    this.applyFilters();
  }
  
  // Toggle favorites filter
  toggleFavoritesFilter(): void {
    this.showOnlyFavorites = !this.showOnlyFavorites;
    this.applyFilters();
  }
  
  // Change sort options
  changeSort(field: 'name' | 'rating' | 'experience' | 'fee'): void {
    if (this.sortBy === field) {
      // Toggle direction if same field
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new field and default direction
      this.sortBy = field;
      this.sortDirection = field === 'name' ? 'asc' : 'desc';
    }
    
    this.applyFilters();
  }
  
  // Toggle favorite status
  toggleFavorite(doctor: Doctor, event: Event): void {
    event.stopPropagation(); // Prevent opening doctor detail
    doctor.isFavorite = !doctor.isFavorite;
    
    // In a real app, this would be an API call
    const message = doctor.isFavorite ? 
      `Added ${doctor.name} to favorites` : 
      `Removed ${doctor.name} from favorites`;
    
    console.log(message);
  }
  
  // View doctor details
  viewDoctorDetail(doctor: Doctor): void {
    this.selectedDoctor = doctor;
    this.showDoctorDetail = true;
  }
  
  // Close doctor detail view
  closeDoctorDetail(): void {
    this.showDoctorDetail = false;
    this.selectedDoctor = null;
  }
  
  // Open booking modal
  openBookingModal(doctor: Doctor, event: Event): void {
    event.stopPropagation(); // Prevent opening doctor detail if clicked from card
    this.selectedDoctor = doctor;
    this.showBookingModal = true;
  }
  
  // Close booking modal
  closeBookingModal(): void {
    this.showBookingModal = false;
  }
  
  // Generate star rating display
  generateStarRating(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push('half');
    }
    
    // Add empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push('empty');
    }
    
    return stars;
  }
  
  // Generate mock doctors for demo
  private generateMockDoctors(): Doctor[] {
    const mockDoctors: Doctor[] = [
      {
        id: 'doc-1',
        name: 'Dr. Sarah Johnson',
        specialty: 'Cardiology',
        avatar: 'assets/avatars/avatar-2.jpg',
        rating: 4.8,
        reviewCount: 142,
        experience: 15,
        hospital: 'Metropolitan Medical Center',
        isAvailable: true,
        isFavorite: true,
        education: [
          'MD, Harvard Medical School',
          'Residency, Johns Hopkins Hospital',
          'Fellowship in Cardiology, Mayo Clinic'
        ],
        languages: ['English', 'Spanish'],
        consultationFee: 150,
        availability: {
          days: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
          hours: '9:00 AM - 5:00 PM'
        },
        contactInfo: {
          email: 'sarah.johnson@example.com',
          phone: '+1 (555) 123-4567',
          address: '123 Medical Plaza, Suite 502, New York, NY 10001'
        },
        about: 'Dr. Johnson is a board-certified cardiologist with over 15 years of experience specializing in preventive cardiology and heart disease management. She has a patient-centered approach to care and is committed to helping patients achieve optimal heart health.'
      },
      {
        id: 'doc-2',
        name: 'Dr. Michael Chen',
        specialty: 'Neurology',
        avatar: 'assets/avatars/avatar-3.jpg',
        rating: 4.6,
        reviewCount: 98,
        experience: 12,
        hospital: 'University Medical Center',
        isAvailable: true,
        isFavorite: false,
        education: [
          'MD, Stanford University',
          'Residency in Neurology, UCSF Medical Center',
          'Fellowship in Neurocritical Care, Mayo Clinic'
        ],
        languages: ['English', 'Mandarin'],
        consultationFee: 175,
        availability: {
          days: ['Monday', 'Wednesday', 'Friday'],
          hours: '10:00 AM - 6:00 PM'
        },
        contactInfo: {
          email: 'michael.chen@example.com',
          phone: '+1 (555) 987-6543',
          address: '456 Neurological Center, San Francisco, CA 94107'
        },
        about: 'Dr. Chen is a neurologist specializing in stroke care, headache management, and neurodegenerative disorders. He combines evidence-based medicine with a holistic approach to provide comprehensive neurological care.'
      },
      {
        id: 'doc-3',
        name: 'Dr. Emily Wilson',
        specialty: 'Dermatology',
        avatar: 'assets/avatars/avatar-4.jpg',
        rating: 4.9,
        reviewCount: 215,
        experience: 10,
        hospital: 'Dermatology & Aesthetics Center',
        isAvailable: false,
        isFavorite: true,
        education: [
          'MD, Yale School of Medicine',
          'Residency in Dermatology, NYU Langone Health',
          'Fellowship in Cosmetic Dermatology, UCLA Medical Center'
        ],
        languages: ['English', 'French'],
        consultationFee: 200,
        availability: {
          days: ['Tuesday', 'Thursday', 'Saturday'],
          hours: '9:00 AM - 4:00 PM'
        },
        contactInfo: {
          email: 'emily.wilson@example.com',
          phone: '+1 (555) 234-5678',
          address: '789 Skin Care Lane, Beverly Hills, CA 90210'
        },
        about: 'Dr. Wilson is a board-certified dermatologist specializing in medical and cosmetic dermatology. Her areas of expertise include acne, skin cancer screening, eczema, and anti-aging treatments.'
      },
      {
        id: 'doc-4',
        name: 'Dr. Robert Patel',
        specialty: 'Orthopedics',
        avatar: 'assets/avatars/avatar-5.jpg',
        rating: 4.7,
        reviewCount: 132,
        experience: 18,
        hospital: 'Sports Medicine & Orthopedic Institute',
        isAvailable: true,
        isFavorite: false,
        education: [
          'MD, Johns Hopkins University',
          'Residency in Orthopedic Surgery, Mass General Hospital',
          'Fellowship in Sports Medicine, Andrews Institute'
        ],
        languages: ['English', 'Hindi'],
        consultationFee: 190,
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
          hours: '8:00 AM - 4:00 PM'
        },
        contactInfo: {
          email: 'robert.patel@example.com',
          phone: '+1 (555) 345-6789',
          address: '101 Joint & Spine Center, Chicago, IL 60601'
        },
        about: 'Dr. Patel is an orthopedic surgeon specializing in sports medicine, joint replacement, and minimally invasive surgery. He has worked with professional athletes and brings that expertise to all his patients.'
      },
      {
        id: 'doc-5',
        name: 'Dr. Jennifer Lopez',
        specialty: 'Obstetrics',
        avatar: 'assets/avatars/avatar-6.jpg',
        rating: 4.9,
        reviewCount: 186,
        experience: 14,
        hospital: 'Women\'s Health Partners',
        isAvailable: true,
        isFavorite: true,
        education: [
          'MD, Columbia University',
          'Residency in Obstetrics & Gynecology, Mount Sinai Hospital',
          'Fellowship in Maternal-Fetal Medicine, Brigham and Women\'s Hospital'
        ],
        languages: ['English', 'Spanish'],
        consultationFee: 160,
        availability: {
          days: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
          hours: '9:00 AM - 5:00 PM'
        },
        contactInfo: {
          email: 'jennifer.lopez@example.com',
          phone: '+1 (555) 456-7890',
          address: '202 Women\'s Health Boulevard, Miami, FL 33130'
        },
        about: 'Dr. Lopez is a compassionate OB-GYN with expertise in prenatal care, high-risk pregnancies, and women\'s health throughout all life stages. She is committed to empowering women through education and personalized care.'
      },
      {
        id: 'doc-6',
        name: 'Dr. William Harris',
        specialty: 'Pediatrics',
        avatar: 'assets/avatars/avatar-7.jpg',
        rating: 4.8,
        reviewCount: 154,
        experience: 20,
        hospital: 'Children\'s Medical Group',
        isAvailable: false,
        isFavorite: false,
        education: [
          'MD, University of Pennsylvania',
          'Residency in Pediatrics, Children\'s Hospital of Philadelphia',
          'Fellowship in Pediatric Gastroenterology, Boston Children\'s Hospital'
        ],
        languages: ['English'],
        consultationFee: 140,
        availability: {
          days: ['Tuesday', 'Thursday', 'Friday'],
          hours: '8:30 AM - 4:30 PM'
        },
        contactInfo: {
          email: 'william.harris@example.com',
          phone: '+1 (555) 567-8901',
          address: '303 Children\'s Way, Boston, MA 02115'
        },
        about: 'Dr. Harris is a pediatrician with 20 years of experience caring for children from newborns to adolescents. He specializes in preventive care, behavioral health, and managing chronic pediatric conditions.'
      },
      {
        id: 'doc-7',
        name: 'Dr. Lisa Thompson',
        specialty: 'Psychiatry',
        avatar: 'assets/avatars/avatar-8.jpg',
        rating: 4.7,
        reviewCount: 88,
        experience: 11,
        hospital: 'Behavioral Health Institute',
        isAvailable: true,
        isFavorite: false,
        education: [
          'MD, Duke University',
          'Residency in Psychiatry, NYU Langone Health',
          'Fellowship in Child & Adolescent Psychiatry, UCLA Medical Center'
        ],
        languages: ['English', 'Portuguese'],
        consultationFee: 185,
        availability: {
          days: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
          hours: '10:00 AM - 6:00 PM'
        },
        contactInfo: {
          email: 'lisa.thompson@example.com',
          phone: '+1 (555) 678-9012',
          address: '404 Mental Health Avenue, Seattle, WA 98101'
        },
        about: 'Dr. Thompson is a psychiatrist specializing in mood disorders, anxiety, ADHD, and trauma. She takes an integrative approach to mental health, combining medication management with therapy techniques and lifestyle modifications.'
      },
      {
        id: 'doc-8',
        name: 'Dr. David Kim',
        specialty: 'Gastroenterology',
        avatar: 'assets/avatars/avatar-9.jpg',
        rating: 4.5,
        reviewCount: 76,
        experience: 9,
        hospital: 'Digestive Health Center',
        isAvailable: true,
        isFavorite: false,
        education: [
          'MD, University of Chicago',
          'Residency in Internal Medicine, Northwestern Memorial Hospital',
          'Fellowship in Gastroenterology, Mayo Clinic'
        ],
        languages: ['English', 'Korean'],
        consultationFee: 170,
        availability: {
          days: ['Monday', 'Tuesday', 'Thursday'],
          hours: '9:00 AM - 5:00 PM'
        },
        contactInfo: {
          email: 'david.kim@example.com',
          phone: '+1 (555) 789-0123',
          address: '505 Digestive Way, Houston, TX 77030'
        },
        about: 'Dr. Kim is a gastroenterologist specializing in digestive disorders, inflammatory bowel disease, and liver conditions. He is known for his thorough approach to diagnosis and patient education.'
      }
    ];
    
    return mockDoctors;
  }
} 