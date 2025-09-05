export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'checkup' | 'consultation' | 'follow-up' | 'emergency';
  notes?: string;
  createdAt: string;
  patient?: {
    id: string;
    name: string;
    phone: string;
  };
  doctor?: {
    id: string;
    name: string;
    specialization: string;
  };
}