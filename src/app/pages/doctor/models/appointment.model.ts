export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  date: string; // ISO format date
  startTime: string; // 24hr format HH:MM
  endTime: string; // 24hr format HH:MM
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  reason?: string;
  clinicId?: string;
  clinicName?: string;
  isNewPatient?: boolean;
  paymentStatus?: PaymentStatus;
  paymentAmount?: number;
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export enum AppointmentType {
  CONSULTATION = 'CONSULTATION',
  FOLLOW_UP = 'FOLLOW_UP',
  CHECKUP = 'CHECKUP',
  PROCEDURE = 'PROCEDURE',
  EMERGENCY = 'EMERGENCY',
  TELE_CONSULTATION = 'TELE_CONSULTATION'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  WAIVED = 'WAIVED',
  REFUNDED = 'REFUNDED'
}

export const appointmentStatusColors = {
  [AppointmentStatus.SCHEDULED]: '#f8c471', // Amber
  [AppointmentStatus.CONFIRMED]: '#3498db', // Blue
  [AppointmentStatus.CHECKED_IN]: '#5dade2', // Light Blue
  [AppointmentStatus.COMPLETED]: '#2ecc71', // Green
  [AppointmentStatus.CANCELLED]: '#e74c3c', // Red
  [AppointmentStatus.NO_SHOW]: '#95a5a6', // Gray
};

export const appointmentTypeColors = {
  [AppointmentType.CONSULTATION]: '#3498db', // Blue
  [AppointmentType.FOLLOW_UP]: '#9b59b6', // Purple
  [AppointmentType.CHECKUP]: '#2ecc71', // Green
  [AppointmentType.PROCEDURE]: '#e67e22', // Orange
  [AppointmentType.EMERGENCY]: '#e74c3c', // Red
  [AppointmentType.TELE_CONSULTATION]: '#1abc9c', // Turquoise
}; 