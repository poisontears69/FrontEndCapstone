export interface Patient {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  address?: string;
  profilePicture?: string;
  lastVisit?: string;
  upcomingAppointment?: string;
}

export interface PatientGroup {
  letter: string;
  patients: Patient[];
} 