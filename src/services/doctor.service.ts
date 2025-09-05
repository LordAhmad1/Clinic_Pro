import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private doctorsSubject = new BehaviorSubject<User[]>([]);
  public doctors$ = this.doctorsSubject.asObservable();
  private readonly STORAGE_KEY = 'clinic_doctors';

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    const storedData = localStorage.getItem(this.STORAGE_KEY);
    if (storedData) {
      try {
        const doctors = JSON.parse(storedData);
        this.doctorsSubject.next(doctors);
      } catch (error) {
        console.error('Error loading doctors from localStorage:', error);
        this.loadMockData();
      }
    } else {
      this.loadMockData();
    }
  }

  private saveToStorage(doctors: User[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(doctors));
    } catch (error) {
      console.error('Error saving doctors to localStorage:', error);
    }
  }

  private loadMockData(): void {
    
    this.doctorsSubject.next([]);
    this.saveToStorage([]);
  }

  getDoctors(): Observable<User[]> {
    return this.doctors$;
  }

  getDoctor(id: string): Observable<User | undefined> {
    return new Observable(observer => {
      const doctor = this.doctorsSubject.value.find(d => d.id === id);
      observer.next(doctor);
      observer.complete();
    });
  }

  addDoctor(doctor: Omit<User, 'id'>): Observable<User> {
    return new Observable(observer => {
      const doctors = this.doctorsSubject.value;
      const newDoctor: User = {
        ...doctor,
        id: String(Math.max(...doctors.map(d => parseInt(d.id)), 0) + 1),
        role: 'doctor'
      };
      const updatedDoctors = [...doctors, newDoctor];
      this.doctorsSubject.next(updatedDoctors);
      this.saveToStorage(updatedDoctors);
      observer.next(newDoctor);
      observer.complete();
    });
  }

  updateDoctor(id: string, doctor: Partial<User>): Observable<User> {
    return new Observable(observer => {
      const doctors = this.doctorsSubject.value;
      const index = doctors.findIndex(d => d.id === id);
      if (index !== -1) {
        const updatedDoctor = { ...doctors[index], ...doctor };
        doctors[index] = updatedDoctor;
        this.doctorsSubject.next([...doctors]);
        this.saveToStorage(doctors);
        observer.next(updatedDoctor);
      } else {
        observer.error('Doctor not found');
      }
      observer.complete();
    });
  }

  deleteDoctor(id: string): Observable<boolean> {
    return new Observable(observer => {
      const doctors = this.doctorsSubject.value;
      const filteredDoctors = doctors.filter(d => d.id !== id);
      this.doctorsSubject.next(filteredDoctors);
      this.saveToStorage(filteredDoctors);
      observer.next(true);
      observer.complete();
    });
  }

  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.doctorsSubject.next([]);
  }
}