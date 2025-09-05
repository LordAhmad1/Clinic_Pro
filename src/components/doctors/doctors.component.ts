import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor.service';
import { SpecializationService } from '../../services/specialization.service';
import { TranslationService } from '../../services/translation.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css']
})
export class DoctorsComponent implements OnInit {
  doctors: User[] = [];
  filteredDoctors: User[] = [];
  searchTerm: string = '';
  selectedDoctor: User | null = null;
  showAddModal: boolean = false;
  showDetailsModal: boolean = false;
  showEditModal: boolean = false;
  editingDoctor: User | null = null;
  
  specializations: string[] = [];

  weekDays = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday'
  ];
  
  newDoctor: Omit<User, 'id'> = {
    name: '',
    email: '',
    phone: '',
    nationalId: '',
    specialization: '',
    avatar: '',
    role: 'doctor',
    workingHours: {
      start: '09:00',
      end: '17:00',
      days: []
    }
  };

  constructor(
    private doctorService: DoctorService,
    private specializationService: SpecializationService,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
    this.loadSpecializations();
  }

  loadDoctors(): void {
    this.doctorService.getDoctors().subscribe(doctors => {
      this.doctors = doctors;
      this.filteredDoctors = doctors;
    });
  }

  loadSpecializations(): void {
    this.specializationService.getSpecializations().subscribe(specializations => {
      this.specializations = specializations.map(s => s.name);
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredDoctors = this.doctors;
      return;
    }

    this.filteredDoctors = this.doctors.filter(doctor =>
      doctor.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      doctor.id.toString().includes(this.searchTerm)
    );
  }

  openAddModal(): void {
   this.newDoctor = {
      name: '',
      role: 'doctor',
      email: '',
      phone: '',
      nationalId: '',
      specialization: '',
      avatar: '',
      workingHours: {
        start: '09:00',
        end: '17:00',
        days: []
      }
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  openDetailsModal(doctor: User): void {
    this.selectedDoctor = doctor;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedDoctor = null;
  }

  openEditModal(doctor: User): void {
    this.editingDoctor = { ...doctor };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingDoctor = null;
  }

  addDoctor(): void {
    if (!this.validateDoctor()) return;

    this.doctorService.addDoctor(this.newDoctor).subscribe({
      next: (doctor) => {
        this.loadDoctors();
        this.closeAddModal();
      },
      error: (error) => {
        console.error('Error adding doctor:', error);
      }
    });
  }

  updateDoctor(): void {
    if (!this.editingDoctor || !this.validateEditingDoctor()) return;

    this.doctorService.updateDoctor(this.editingDoctor.id, this.editingDoctor).subscribe({
      next: (doctor) => {
        this.loadDoctors();
        this.closeEditModal();
      },
      error: (error) => {
        console.error('Error updating doctor:', error);
      }
    });
  }

  deleteDoctor(doctor: User): void {
    if (confirm(`Are you sure you want to delete Dr. ${doctor.name}?`)) {
      this.doctorService.deleteDoctor(doctor.id).subscribe({
        next: () => {
          this.loadDoctors();
        },
        error: (error) => {
          console.error('Error deleting doctor:', error);
        }
      });
    }
  }

  onWorkingDayChange(day: string, event: any): void {
    if (event.target.checked) {
      if (!this.newDoctor.workingHours?.days.includes(day)) {
        this.newDoctor.workingHours!.days.push(day);
      }
    } else {
      const index = this.newDoctor.workingHours?.days.indexOf(day);
      if (index !== undefined && index > -1) {
        this.newDoctor.workingHours!.days.splice(index, 1);
      }
    }
  }

  onEditingWorkingDayChange(day: string, event: any): void {
    if (event.target.checked) {
      if (!this.editingDoctor?.workingHours?.days.includes(day)) {
        this.editingDoctor!.workingHours!.days.push(day);
      }
    } else {
      const index = this.editingDoctor?.workingHours?.days.indexOf(day);
      if (index !== undefined && index > -1) {
        this.editingDoctor!.workingHours!.days.splice(index, 1);
      }
    }
  }

  onPhotoUpload(event: any, isEditing: boolean = false): void {
    
    const file = event.target.files[0];
    if (file) {

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
        const base64 = e.target.result;

        if (isEditing) {
          this.editingDoctor!.avatar = base64;
          
        } else {
          this.newDoctor.avatar = base64;
          
        }
      };
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Error reading the selected file. Please try again.');
      };
      
      reader.readAsDataURL(file);
    } else {
      
    }
  }

  getDoctorPhoto(doctor: User): string {
    return doctor.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1';
  }

  getDoctorInitials(doctor: User | Omit<User, 'id'>): string {
    return doctor.name?.charAt(0) || '?';
  }

  isDaySelected(day: string): boolean {
    return this.newDoctor.workingHours?.days.includes(day) || false;
  }

  isEditingDaySelected(day: string): boolean {
    return this.editingDoctor?.workingHours?.days.includes(day) || false;
  }

  private validateDoctor(): boolean {
    if (!this.newDoctor.name || !this.newDoctor.email || !this.newDoctor.specialization || !this.newDoctor.nationalId?.trim()) {
      return false;
    }

    // Check National ID length
    if (this.newDoctor.nationalId.length < 8 || this.newDoctor.nationalId.length > 13) {
      alert('National ID Number must be between 8 and 13 characters long.');
      return false;
    }

    return true;
  }

  private validateEditingDoctor(): boolean {
    if (!this.editingDoctor?.name || !this.editingDoctor?.email || !this.editingDoctor?.specialization || !this.editingDoctor?.nationalId?.trim()) {
      return false;
    }

    // Check National ID length
    if (this.editingDoctor.nationalId.length < 8 || this.editingDoctor.nationalId.length > 13) {
      alert('National ID Number must be between 8 and 13 characters long.');
      return false;
    }

    return true;
  }

  getWorkingDaysText(workingHours: any): string {
    if (!workingHours?.days || workingHours.days.length === 0) {
      return this.translationService.translate('notSpecified');
    }
    return workingHours.days.map((day: string) => this.translationService.translate(day.toUpperCase())).join(', ');
  }
}