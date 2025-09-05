import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Appointment } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  public appointments$ = this.appointmentsSubject.asObservable();
  private readonly STORAGE_KEY = 'clinic_appointments';

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    const storedData = localStorage.getItem(this.STORAGE_KEY);
    if (storedData) {
      try {
        const appointments = JSON.parse(storedData);
        this.appointmentsSubject.next(appointments);
      } catch (error) {
        console.error('Error loading appointments from localStorage:', error);
        this.loadMockData();
      }
    } else {
      this.loadMockData();
    }
  }

  private saveToStorage(appointments: Appointment[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(appointments));
    } catch (error) {
      console.error('Error saving appointments to localStorage:', error);
    }
  }

  private loadMockData(): void {
    
    this.appointmentsSubject.next([]);
    this.saveToStorage([]);
  }

  getAppointments(): Observable<Appointment[]> {
    return this.appointments$;
  }

  getAppointmentsByDate(date: string): Observable<Appointment[]> {
    return new Observable(observer => {
      const appointments = this.appointmentsSubject.value.filter(a => a.date === date);
      observer.next(appointments);
      observer.complete();
    });
  }

  addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>): Observable<Appointment> {
    return new Observable(observer => {
      const appointments = this.appointmentsSubject.value;
      const newAppointment: Appointment = {
        ...appointment,
        id: String(Math.max(...appointments.map(a => parseInt(a.id)), 0) + 1),
        createdAt: new Date().toISOString().split('T')[0]
      };
      const updatedAppointments = [...appointments, newAppointment];
      this.appointmentsSubject.next(updatedAppointments);
      this.saveToStorage(updatedAppointments);
      observer.next(newAppointment);
      observer.complete();
    });
  }

  updateAppointment(id: string, appointment: Partial<Appointment>): Observable<Appointment> {
    return new Observable(observer => {
      const appointments = this.appointmentsSubject.value;
      const index = appointments.findIndex(a => a.id === id);
      if (index !== -1) {
        const updatedAppointment = { ...appointments[index], ...appointment };
        appointments[index] = updatedAppointment;
        this.appointmentsSubject.next([...appointments]);
        this.saveToStorage(appointments);
        observer.next(updatedAppointment);
      } else {
        observer.error('Appointment not found');
      }
      observer.complete();
    });
  }

  deleteAppointment(id: string): Observable<boolean> {
    return new Observable(observer => {
      const appointments = this.appointmentsSubject.value;
      const filteredAppointments = appointments.filter(a => a.id !== id);
      this.appointmentsSubject.next(filteredAppointments);
      this.saveToStorage(filteredAppointments);
      observer.next(true);
      observer.complete();
    });
  }

  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.loadMockData();
  }

  // Method to fix appointments with missing patient data
  fixAppointmentsWithMissingData(): void {
    const appointments = this.appointmentsSubject.value;
    let hasChanges = false;
    
    const updatedAppointments = appointments.map(appointment => {
      let updatedAppointment = appointment;
      
      // If appointment has no patient data, add default patient
      if (!appointment.patient) {
        hasChanges = true;
        updatedAppointment = {
          ...updatedAppointment,
          patient: { 
            id: appointment.patientId, 
            name: 'أحمد محمد', 
            phone: '+966507890123' 
          }
        };
      }
      
      // If appointment has no doctor data, add default doctor
      if (!appointment.doctor) {
        hasChanges = true;
        updatedAppointment = {
          ...updatedAppointment,
          doctor: { 
            id: appointment.doctorId, 
            name: 'Dr. Ahmed Hassan', 
            specialization: 'Cardiology' 
          }
        };
      }
      
      return updatedAppointment;
    });
    
    if (hasChanges) {
      this.appointmentsSubject.next(updatedAppointments);
      this.saveToStorage(updatedAppointments);
      
    }
  }
}