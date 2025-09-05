import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { Patient } from '../models/patient.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  public patients$ = this.patientsSubject.asObservable();
  private readonly STORAGE_KEY = 'clinic_patients';
  private readonly API_BASE_URL = environment.apiBaseUrl;
  private useAPI = true; // Set to false to use localStorage only

  constructor(private http: HttpClient) {
    this.loadData();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('clinic_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || 'Server error';
    }
    
    return throwError(() => new Error(errorMessage));
  }

  private loadData(): void {
    if (this.useAPI) {
      this.loadFromAPI();
    } else {
      this.loadFromStorage();
    }
  }

  private loadFromAPI(): void {
    this.http.get<{success: boolean, data: {patients: Patient[]}}>(`${this.API_BASE_URL}/patients`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Failed to load patients from API, falling back to localStorage:', error);
          this.loadFromStorage();
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data.patients) {
            this.patientsSubject.next(response.data.patients);
            this.saveToStorage(response.data.patients);
          }
        },
        error: (error) => {
          console.error('Error loading patients from API:', error);
          this.loadFromStorage();
        }
      });
  }

  private loadFromStorage(): void {
    const storedData = localStorage.getItem(this.STORAGE_KEY);
    if (storedData) {
      try {
        const patients = JSON.parse(storedData);
        this.patientsSubject.next(patients);
      } catch (error) {
        console.error('Error loading patients from localStorage:', error);
        this.loadMockData();
      }
    } else {
      this.loadMockData();
    }
  }

  private saveToStorage(patients: Patient[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(patients));
    } catch (error) {
      console.error('Error saving patients to localStorage:', error);
    }
  }

  private loadMockData(): void {
    
    this.patientsSubject.next([]);
    this.saveToStorage([]);
  }

  getPatients(): Observable<Patient[]> {
    if (this.useAPI) {
      return this.http.get<{success: boolean, data: {patients: Patient[]}}>(`${this.API_BASE_URL}/patients`, { headers: this.getHeaders() })
        .pipe(
          map(response => response.data.patients),
          catchError(error => {
            console.error('Failed to get patients from API:', error);
            return this.patients$;
          })
        );
    }
    return this.patients$;
  }

  getPatient(id: string): Observable<Patient | undefined> {
    if (this.useAPI) {
      return this.http.get<{success: boolean, data: {patient: Patient}}>(`${this.API_BASE_URL}/patients/${id}`, { headers: this.getHeaders() })
        .pipe(
          map(response => response.data.patient),
          catchError(error => {
            console.error('Failed to get patient from API:', error);
            return new Observable<Patient | undefined>(observer => {
              const patient = this.patientsSubject.value.find(p => p.id === id);
              observer.next(patient);
              observer.complete();
            });
          })
        );
    }
    return new Observable(observer => {
      const patient = this.patientsSubject.value.find(p => p.id === id);
      observer.next(patient);
      observer.complete();
    });
  }

  addPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Observable<Patient> {

    if (this.useAPI) {
      return this.http.post<{success: boolean, data: {patient: Patient}}>(`${this.API_BASE_URL}/patients`, patient, { headers: this.getHeaders() })
        .pipe(
          map(response => response.data.patient),
          tap(newPatient => {
            const patients = this.patientsSubject.value;
            this.patientsSubject.next([...patients, newPatient]);
            this.saveToStorage([...patients, newPatient]);
          }),
          catchError(error => {
            console.error('Failed to add patient via API:', error);
            return this.addPatientToStorage(patient);
          })
        );
    }
    
    return this.addPatientToStorage(patient);
  }

  private addPatientToStorage(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Observable<Patient> {
    return new Observable(observer => {
      try {
        const patients = this.patientsSubject.value;

        const newId = Math.max(...patients.map(p => parseInt(p.id)), 0) + 1;

        const newPatient: Patient = {
          ...patient,
          id: String(newId),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          photo: patient.photo && patient.photo.startsWith('data:image') ? patient.photo : ''
        };

        const updatedPatients = [...patients, newPatient];

        this.patientsSubject.next(updatedPatients);
        this.saveToStorage(updatedPatients);

        observer.next(newPatient);
        observer.complete();
      } catch (error) {
        console.error('Error in addPatient:', error);
        observer.error(error);
      }
    });
  }

  updatePatient(id: string, patient: Partial<Patient>): Observable<Patient> {
    if (this.useAPI) {
      return this.http.put<{success: boolean, data: {patient: Patient}}>(`${this.API_BASE_URL}/patients/${id}`, patient, { headers: this.getHeaders() })
        .pipe(
          map(response => response.data.patient),
          tap(updatedPatient => {
            const patients = this.patientsSubject.value;
            const index = patients.findIndex(p => p.id === id);
            if (index !== -1) {
              patients[index] = updatedPatient;
              this.patientsSubject.next([...patients]);
              this.saveToStorage(patients);
            }
          }),
          catchError(error => {
            console.error('Failed to update patient via API:', error);
            return this.updatePatientInStorage(id, patient);
          })
        );
    }
    
    return this.updatePatientInStorage(id, patient);
  }

  private updatePatientInStorage(id: string, patient: Partial<Patient>): Observable<Patient> {
    return new Observable(observer => {
      const patients = this.patientsSubject.value;
      const index = patients.findIndex(p => p.id === id);
      if (index !== -1) {
        const updatedPatient = { 
          ...patients[index], 
          ...patient,
          updatedAt: new Date().toISOString(),
          photo: patient.photo && patient.photo.startsWith('data:image') ? patient.photo : patients[index].photo
        };
        patients[index] = updatedPatient;
        this.patientsSubject.next([...patients]);
        this.saveToStorage(patients);
        observer.next(updatedPatient);
      } else {
        observer.error('Patient not found');
      }
      observer.complete();
    });
  }

  deletePatient(id: string): Observable<boolean> {
    if (this.useAPI) {
      return this.http.delete<{success: boolean}>(`${this.API_BASE_URL}/patients/${id}`, { headers: this.getHeaders() })
        .pipe(
          map(response => response.success),
          tap(() => {
            const patients = this.patientsSubject.value;
            const filteredPatients = patients.filter(p => p.id !== id);
            this.patientsSubject.next(filteredPatients);
            this.saveToStorage(filteredPatients);
          }),
          catchError(error => {
            console.error('Failed to delete patient via API:', error);
            return this.deletePatientFromStorage(id);
          })
        );
    }
    
    return this.deletePatientFromStorage(id);
  }

  private deletePatientFromStorage(id: string): Observable<boolean> {
    return new Observable(observer => {
      const patients = this.patientsSubject.value;
      const filteredPatients = patients.filter(p => p.id !== id);
      this.patientsSubject.next(filteredPatients);
      this.saveToStorage(filteredPatients);
      observer.next(true);
      observer.complete();
    });
  }

  searchPatients(query: string): Observable<Patient[]> {
    if (this.useAPI) {
      return this.http.get<{success: boolean, data: {patients: Patient[]}}>(`${this.API_BASE_URL}/patients/search?q=${encodeURIComponent(query)}`, { headers: this.getHeaders() })
        .pipe(
          map(response => response.data.patients),
          catchError(error => {
            console.error('Failed to search patients via API:', error);
            return this.searchPatientsInStorage(query);
          })
        );
    }
    
    return this.searchPatientsInStorage(query);
  }

  private searchPatientsInStorage(query: string): Observable<Patient[]> {
    return new Observable(observer => {
      const patients = this.patientsSubject.value;
      const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.nationalId.includes(query) ||
        p.phone.includes(query)
      );
      observer.next(filteredPatients);
      observer.complete();
    });
  }

  refreshPatients(): void {
    this.loadData();
  }

  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.patientsSubject.next([]);
  }

  // Test connection to backend
  testConnection(): Observable<boolean> {
    return this.http.get(`${this.API_BASE_URL}/patients`, { headers: this.getHeaders() })
      .pipe(
        map(() => true),
        catchError(() => {
          console.error('Backend connection failed');
          return throwError(() => new Error('Backend connection failed'));
        })
      );
  }
}