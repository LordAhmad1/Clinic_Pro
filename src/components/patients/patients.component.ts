import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { TranslationService } from '../../services/translation.service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  searchTerm: string = '';
  selectedPatient: Patient | null = null;
  showAddModal: boolean = false;
  showDetailsModal: boolean = false;
  showEditModal: boolean = false;
  editingPatient: Patient | null = null;

  newPatient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> = {
    name: '',
    phone: '',
    email: '',
    nationalId: '',
    address: '',
    dateOfBirth: '',
    gender: 'male',
    photo: '',
    bloodType: '',
    allergies: '',
    occupation: '',
    maritalStatus: undefined,
    insuranceProvider: '',
    insuranceNumber: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  };

  constructor(
    private patientService: PatientService,
    private router: Router,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.filteredPatients = patients;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPatients = this.patients;
      return;
    }

    this.filteredPatients = this.patients.filter(patient =>
      patient.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      patient.phone.includes(this.searchTerm) ||
      patient.id.toString().includes(this.searchTerm) ||
      patient.nationalId?.includes(this.searchTerm)
    );
  }

  openAddModal(): void {
    this.newPatient = {
      name: '',
      phone: '',
      email: '',
      nationalId: '',
      address: '',
      dateOfBirth: '',
      gender: 'male',
      photo: '',
      bloodType: '',
      allergies: '',
      occupation: '',
      maritalStatus: undefined,
      insuranceProvider: '',
      insuranceNumber: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      }
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  openDetailsModal(patient: Patient): void {
    this.selectedPatient = patient;
    this.showDetailsModal = true;
  }

  viewPatient(patient: Patient): void {
    this.router.navigate(['/patient', patient.id]);
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedPatient = null;
  }

  openEditModal(patient: Patient): void {
    this.editingPatient = { ...patient };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  addPatient(): void {
    if (!this.validatePatient()) {
      return;
    }

    this.patientService.addPatient(this.newPatient).subscribe({
      next: (patient) => {
        this.loadPatients();
        this.closeAddModal();
      },
      error: (error) => {
        console.error('Error adding patient:', error);
        alert('Error adding patient: ' + (error.message || 'Unknown error'));
      }
    });
  }

  updatePatient(): void {
    if (!this.editingPatient || !this.validatePatientForEdit()) {
      return;
    }

    this.patientService.updatePatient(this.editingPatient.id, this.editingPatient).subscribe({
      next: (patient) => {
        this.loadPatients();
        this.closeEditModal();
      },
      error: (error) => {
        console.error('Error updating patient:', error);
        alert('Error updating patient: ' + (error.message || 'Unknown error'));
      }
    });
  }

  deletePatient(patient: Patient): void {
    if (confirm(`Are you sure you want to delete ${patient.name}?`)) {
      this.patientService.deletePatient(patient.id).subscribe({
        next: () => {
          this.loadPatients();
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
        }
      });
    }
  }

  onPhotoUpload(event: any, patient: Patient | null = null): void {
    try {
      const file = event.target.files[0];
      if (!file) {
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const base64 = e.target.result;
          
          if (patient) {
            // For editing existing patient
            if (this.editingPatient) {
              this.editingPatient.photo = base64;
            }
          } else {
            // For new patient
            this.newPatient.photo = base64;
          }
        } catch (error) {
          console.error('Error processing photo:', error);
          alert('Error processing the selected file. Please try again.');
        }
      };
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Error reading the selected file. Please try again.');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error in photo upload:', error);
      alert('Error uploading photo. Please try again.');
    }
  }

  getPatientPhoto(patient: Patient | Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): string {
    if (patient.photo && patient.photo.startsWith('data:image')) {
      return patient.photo;
    }
    return '';
  }

  getPatientInitials(patient: Patient | Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): string {
    return patient.name.charAt(0).toUpperCase();
  }

  private validatePatient(): boolean {
    if (!this.newPatient.name?.trim()) {
      alert('Patient name is required.');
      return false;
    }
    
    if (!this.newPatient.phone?.trim()) {
      alert('Phone number is required.');
      return false;
    }
    
    if (!this.newPatient.address?.trim()) {
      alert('Address is required.');
      return false;
    }
    
    if (!this.newPatient.nationalId?.trim()) {
      alert('National ID is required.');
      return false;
    }

    // Check National ID length
    if (this.newPatient.nationalId.length < 8 || this.newPatient.nationalId.length > 13) {
      alert('National ID Number must be between 8 and 13 characters long.');
      return false;
    }

    return true;
  }

  private validatePatientForEdit(): boolean {
    if (!this.editingPatient?.name?.trim()) {
      alert('Patient name is required.');
      return false;
    }
    
    if (!this.editingPatient?.phone?.trim()) {
      alert('Phone number is required.');
      return false;
    }
    
    if (!this.editingPatient?.address?.trim()) {
      alert('Address is required.');
      return false;
    }
    
    if (!this.editingPatient?.nationalId?.trim()) {
      alert('National ID is required.');
      return false;
    }

    // Check National ID length
    if (this.editingPatient.nationalId.length < 8 || this.editingPatient.nationalId.length > 13) {
      alert('National ID Number must be between 8 and 13 characters long.');
      return false;
    }

    return true;
  }

  getAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      
      // Check if the date is valid
      if (isNaN(birthDate.getTime())) {
        console.warn('Invalid date format:', dateOfBirth);
        return 0;
      }
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error('Error calculating age:', error);
      return 0;
    }
  }

}