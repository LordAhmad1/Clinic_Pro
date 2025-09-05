import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Specialization {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SpecializationService {
  private STORAGE_KEY = 'specializations';
  private specializationsSubject = new BehaviorSubject<Specialization[]>([]);
  public specializations$ = this.specializationsSubject.asObservable();

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    const storedData = localStorage.getItem(this.STORAGE_KEY);
    if (storedData) {
      try {
        const specializations = JSON.parse(storedData);
        this.specializationsSubject.next(specializations);
      } catch (error) {
        console.error('Error loading specializations from localStorage:', error);
        this.loadDefaultSpecializations();
      }
    } else {
      this.loadDefaultSpecializations();
    }
  }

  private loadDefaultSpecializations(): void {
    const defaultSpecializations: Specialization[] = [
      { id: 1, name: 'Cardiology', description: 'Heart and cardiovascular system', createdAt: new Date() },
      { id: 2, name: 'Dermatology', description: 'Skin, hair, and nails', createdAt: new Date() },
      { id: 3, name: 'Neurology', description: 'Nervous system and brain', createdAt: new Date() },
      { id: 4, name: 'Orthopedics', description: 'Bones, joints, and muscles', createdAt: new Date() },
      { id: 5, name: 'Pediatrics', description: 'Children and adolescents', createdAt: new Date() },
      { id: 6, name: 'Psychiatry', description: 'Mental health and behavior', createdAt: new Date() },
      { id: 7, name: 'General Medicine', description: 'General health and wellness', createdAt: new Date() }
    ];
    this.specializationsSubject.next(defaultSpecializations);
    this.saveToStorage(defaultSpecializations);
  }

  private saveToStorage(specializations: Specialization[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(specializations));
  }

  getSpecializations(): Observable<Specialization[]> {
    return this.specializations$;
  }

  addSpecialization(specialization: Omit<Specialization, 'id' | 'createdAt'>): Observable<Specialization> {
    return new Observable(observer => {
      const currentSpecializations = this.specializationsSubject.value;
      const newSpecialization: Specialization = {
        ...specialization,
        id: Math.max(...currentSpecializations.map(s => s.id), 0) + 1,
        createdAt: new Date()
      };

      const updatedSpecializations = [...currentSpecializations, newSpecialization];
      this.specializationsSubject.next(updatedSpecializations);
      this.saveToStorage(updatedSpecializations);
      
      observer.next(newSpecialization);
      observer.complete();
    });
  }

  updateSpecialization(id: number, updates: Partial<Specialization>): Observable<Specialization> {
    return new Observable(observer => {
      const currentSpecializations = this.specializationsSubject.value;
      const index = currentSpecializations.findIndex(s => s.id === id);
      
      if (index !== -1) {
        const updatedSpecialization = { ...currentSpecializations[index], ...updates };
        const updatedSpecializations = [...currentSpecializations];
        updatedSpecializations[index] = updatedSpecialization;
        
        this.specializationsSubject.next(updatedSpecializations);
        this.saveToStorage(updatedSpecializations);
        
        observer.next(updatedSpecialization);
      } else {
        observer.error('Specialization not found');
      }
      observer.complete();
    });
  }

  deleteSpecialization(id: number): Observable<void> {
    return new Observable(observer => {
      const currentSpecializations = this.specializationsSubject.value;
      const updatedSpecializations = currentSpecializations.filter(s => s.id !== id);
      
      this.specializationsSubject.next(updatedSpecializations);
      this.saveToStorage(updatedSpecializations);
      
      observer.next();
      observer.complete();
    });
  }

  getSpecializationNames(): string[] {
    return this.specializationsSubject.value.map(s => s.name);
  }
} 