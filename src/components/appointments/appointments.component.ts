import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { PatientService } from '../../services/patient.service';
import { DoctorService } from '../../services/doctor.service';
import { TranslationService } from '../../services/translation.service';
import { Appointment } from '../../models/appointment.model';
import { Patient } from '../../models/patient.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  patients: Patient[] = [];
  doctors: User[] = [];
  searchTerm: string = '';
  selectedDate: string = '';
  selectedAppointment: Appointment | null = null;
  showAddModal: boolean = false;
  showDetailsModal: boolean = false;
  
  // Search functionality for add appointment modal
  patientSearchTerm: string = '';
  doctorSearchTerm: string = '';
  filteredPatients: Patient[] = [];
  filteredDoctors: User[] = [];
  showPatientDropdown: boolean = false;
  showDoctorDropdown: boolean = false;
  selectedPatient: Patient | null = null;
  selectedDoctor: User | null = null;
  
  appointmentTypes = ['checkup', 'consultation', 'follow-up', 'emergency'];
  appointmentStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
  
  newAppointment: Omit<Appointment, 'id' | 'createdAt'> = {
    patientId: '0',
    doctorId: '0',
    date: '',
    time: '',
    duration: 30,
    status: 'scheduled',
    type: 'checkup',
    notes: ''
  };

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.selectedDate = ''; // Don't filter by date by default
    this.loadAppointments();
    this.loadPatients();
    this.loadDoctors();
  }

  loadAppointments(): void {
    this.appointmentService.getAppointments().subscribe(appointments => {
      
      this.appointments = appointments;
      this.filteredAppointments = appointments;
      
      // Fix any appointments with missing patient data
      this.appointmentService.fixAppointmentsWithMissingData();
      
      this.onSearch(); // Use onSearch instead of filterByDate
      
    });
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe(patients => {
      
      this.patients = patients;
      // Initialize filtered patients if modal is open
      if (this.showAddModal) {
        this.filteredPatients = this.patients.slice(0, 10);
      }
    });
  }

  loadDoctors(): void {
    this.doctorService.getDoctors().subscribe(doctors => {

      this.doctors = doctors;
      // Initialize filtered doctors if modal is open
      if (this.showAddModal) {
        this.filteredDoctors = this.doctors.slice(0, 10);
      }
    });
  }

  onSearch(): void {

    this.filteredAppointments = this.appointments.filter(appointment => {
      const matchesSearch = !this.searchTerm || 
        appointment.patient?.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        appointment.doctor?.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesDate = !this.selectedDate || appointment.date === this.selectedDate;

      return matchesSearch && matchesDate;
    });

  }

  filterByDate(): void {
    this.onSearch(); // Use onSearch to handle both search and date filtering
  }

  openAddModal(): void {
    this.newAppointment = {
      patientId: '0',
      doctorId: '0',
      date: this.selectedDate || new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: 30,
      status: 'scheduled',
      type: 'checkup',
      notes: ''
    };
    this.showAddModal = true;
    // Reset search functionality
    this.patientSearchTerm = '';
    this.doctorSearchTerm = '';
    this.selectedPatient = null;
    this.selectedDoctor = null;
    this.showPatientDropdown = false;
    this.showDoctorDropdown = false;
    
    // Initialize filtered arrays with all patients and doctors
    this.filteredPatients = this.patients.slice(0, 10);
    this.filteredDoctors = this.doctors.slice(0, 10);
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  openDetailsModal(appointment: Appointment): void {
    this.selectedAppointment = appointment;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedAppointment = null;
  }

  addAppointment(): void {
    if (!this.validateAppointment()) return;

    // Add patient and doctor details
    const patient = this.patients.find(p => p.id === this.newAppointment.patientId);
    const doctor = this.doctors.find(d => d.id === this.newAppointment.doctorId);

    const appointmentWithDetails = {
      ...this.newAppointment,
      patient: patient ? { id: patient.id, name: patient.name, phone: patient.phone } : undefined,
      doctor: doctor ? { id: doctor.id, name: doctor.name, specialization: doctor.specialization || '' } : undefined
    };

    this.appointmentService.addAppointment(appointmentWithDetails).subscribe({
      next: (appointment) => {
        this.loadAppointments();
        this.closeAddModal();
      },
      error: (error) => {
        console.error('Error adding appointment:', error);
      }
    });
  }

  updateAppointmentStatus(appointment: Appointment, status: string): void {
    this.appointmentService.updateAppointment(appointment.id, { status: status as Appointment['status'] }).subscribe({
      next: () => {
        this.loadAppointments();
      },
      error: (error) => {
        console.error('Error updating appointment:', error);
      }
    });
  }

  confirmCompleteAppointment(appointment: Appointment): void {
    const patientName = appointment.patient?.name || 'Unknown Patient';
    const doctorName = appointment.doctor?.name || 'Unknown Doctor';
    const appointmentDate = new Date(appointment.date).toLocaleDateString();
    const appointmentTime = appointment.time;
    
    if (confirm(`Are you sure you want to mark this appointment as completed?\n\nPatient: ${patientName}\nDoctor: ${doctorName}\nDate: ${appointmentDate}\nTime: ${appointmentTime}`)) {
      this.updateAppointmentStatus(appointment, 'completed');
    }
  }

  deleteAppointment(appointment: Appointment): void {
    if (confirm(`Are you sure you want to delete this appointment?`)) {
      this.appointmentService.deleteAppointment(appointment.id).subscribe({
        next: () => {
          this.loadAppointments();
        },
        error: (error) => {
          console.error('Error deleting appointment:', error);
        }
      });
    }
  }

  private validateAppointment(): boolean {
    return !!(this.selectedPatient && this.selectedDoctor && 
              this.newAppointment.date && this.newAppointment.time);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'scheduled': return 'bg-primary';
      case 'completed': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      case 'no-show': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  getStatusDisplayText(status: string): string {
    switch (status) {
      case 'scheduled': return this.translationService.translate('scheduled');
      case 'completed': return this.translationService.translate('completed');
      case 'cancelled': return this.translationService.translate('cancelled');
      case 'no-show': return this.translationService.translate('noShow');
      default: return status;
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'checkup': return 'bg-info';
      case 'consultation': return 'bg-primary';
      case 'follow-up': return 'bg-success';
      case 'emergency': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getTypeDisplayText(type: string): string {
    switch (type) {
      case 'checkup': return this.translationService.translate('ROUTINE_CHECKUP');
      case 'consultation': return this.translationService.translate('CONSULTATION');
      case 'follow-up': return this.translationService.translate('FOLLOW_UP');
      case 'emergency': return this.translationService.translate('EMERGENCY');
      default: return type;
    }
  }

  // Search functionality methods
  filterPatients(): void {

    if (!this.patientSearchTerm.trim()) {
      this.filteredPatients = this.patients.slice(0, 10); // Show first 10 patients
      this.showPatientDropdown = false; // Hide dropdown when no search term
      
    } else {
      const filtered = this.patients.filter(patient => {
        const nameMatch = patient.name.toLowerCase().includes(this.patientSearchTerm.toLowerCase());
        const phoneMatch = patient.phone.includes(this.patientSearchTerm);
        const nationalIdMatch = patient.nationalId && patient.nationalId.includes(this.patientSearchTerm);

        return nameMatch || phoneMatch || nationalIdMatch;
      });
      
      this.filteredPatients = filtered.slice(0, 10); // Limit to 10 results
      this.showPatientDropdown = true; // Show dropdown when there's a search term
      
    }
  }

  filterDoctors(): void {

    if (!this.doctorSearchTerm.trim()) {
      this.filteredDoctors = this.doctors.slice(0, 10); // Show first 10 doctors
      this.showDoctorDropdown = false; // Hide dropdown when no search term
      
    } else {
      const filtered = this.doctors.filter(doctor => {
        const nameMatch = doctor.name.toLowerCase().includes(this.doctorSearchTerm.toLowerCase());
        const specializationMatch = doctor.specialization && doctor.specialization.toLowerCase().includes(this.doctorSearchTerm.toLowerCase());

        return nameMatch || specializationMatch;
      });
      
      this.filteredDoctors = filtered.slice(0, 10); // Limit to 10 results
      this.showDoctorDropdown = true; // Show dropdown when there's a search term
      
    }
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.newAppointment.patientId = patient.id;
    this.patientSearchTerm = patient.name;
    this.showPatientDropdown = false;
  }

  selectDoctor(doctor: User): void {
    this.selectedDoctor = doctor;
    this.newAppointment.doctorId = doctor.id;
    this.doctorSearchTerm = doctor.name;
    this.showDoctorDropdown = false;
  }

  hidePatientDropdown(): void {
    setTimeout(() => {
      this.showPatientDropdown = false;
    }, 200);
  }

  hideDoctorDropdown(): void {
    setTimeout(() => {
      this.showDoctorDropdown = false;
    }, 200);
  }

  onPatientInputFocus(): void {
    
    this.showPatientDropdown = false; // Don't show dropdown immediately
    this.filterPatients(); // Still filter to prepare for when user types
  }

  onDoctorInputFocus(): void {
    
    this.showDoctorDropdown = false; // Don't show dropdown immediately
    this.filterDoctors(); // Still filter to prepare for when user types
  }
}