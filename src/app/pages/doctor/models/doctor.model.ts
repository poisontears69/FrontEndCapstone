export interface Doctor {
  id?: string;
  fullName?: string;
  title: string;
  specialization: string;
  isVerified: boolean;
  description: string;
  imageUrl?: string;
  profilePicture?: string;
  contactInfo?: ContactInfo;
  education?: Education[];
  experience?: Experience[];
  awards?: Award[];
  languages?: string[];
  consultationFee?: number;
  availability?: Availability;
  socialMedia?: SocialMedia;
  verificationStatus?: 'pending' | 'verified' | 'rejected' | 'not_submitted';
  documents?: DoctorDocuments;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Experience {
  position: string;
  institution: string;
  startYear: string;
  endYear?: string;
  current?: boolean;
  description?: string;
}

export interface Award {
  title: string;
  year: string;
  issuer?: string;
}

export interface Availability {
  consultationHours?: string;
  maxPatientsPerDay?: number;
  acceptingNewPatients?: boolean;
}

export interface SocialMedia {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
}

export interface DoctorDocuments {
  license?: DocumentInfo;
  diploma?: DocumentInfo;
  certification?: DocumentInfo;
  additionalDocuments?: DocumentInfo[];
}

export interface DocumentInfo {
  id?: string;
  name: string;
  url?: string;
  uploadDate?: Date;
  status?: 'pending' | 'verified' | 'rejected';
}

export const specializations = [
  'Immunology',
  'Anesthesiology',
  'Cardiology',
  'Dermatology',
  'Emergency medicine',
  'Endocrinology',
  'Family medicine',
  'Gastroenterology',
  'General practice',
  'Geriatric medicine',
  'Infectious diseases',
  'Internal medicine',
  'Nephrology',
  'Neurology',
  'Obstetrics and gynecology',
  'Occupational medicine',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Otolaryngology',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Surgery',
  'Urology'
];

export const languages = [
  'English',
  'Filipino',
  'Cebuano',
  'Ilocano',
  'Hiligaynon',
  'Waray',
  'Kapampangan',
  'Bikol',
  'Pangasinan',
  'Maranao',
  'Spanish',
  'Chinese (Mandarin)',
  'Korean',
  'Japanese',
  'Arabic',
  'French',
  'German'
]; 