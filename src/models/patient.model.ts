export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  nationalId: string; // رقم وطني
  address: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  photo?: string; // Base64 encoded image or URL
  bloodType?: string;
  allergies?: string;
  occupation?: string; // المهنة
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed'; // الحالة الاجتماعية
  insuranceProvider?: string; // شركة التأمين
  insuranceNumber?: string; // رقم التأمين
  emergencyContact: EmergencyContact;
  medicalHistory?: MedicalRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  doctorId: string;
}