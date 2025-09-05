export interface User {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'secretary' | 'manager';
  avatar?: string;
  phone?: string;
  nationalId?: string;
  specialization?: string;
  workingHours?: WorkingHours;
}

export interface WorkingHours {
  start: string;
  end: string;
  days: string[];
}