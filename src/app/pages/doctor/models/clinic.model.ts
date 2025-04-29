export interface Clinic {
  id?: string;
  name: string;
  address: string;
  landline: string;
  schedules: Schedule[];
  isActive?: boolean;
  description?: string;
}

export interface Schedule {
  id?: string;
  day: Day;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export enum Day {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export const weekDays = [
  { value: Day.MONDAY, label: 'Monday' },
  { value: Day.TUESDAY, label: 'Tuesday' },
  { value: Day.WEDNESDAY, label: 'Wednesday' },
  { value: Day.THURSDAY, label: 'Thursday' },
  { value: Day.FRIDAY, label: 'Friday' },
  { value: Day.SATURDAY, label: 'Saturday' },
  { value: Day.SUNDAY, label: 'Sunday' }
]; 