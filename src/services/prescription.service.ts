import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface PrescriptionMedication {
  _id?: string;
  name: string;
  dosage: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  qrCode?: string;
  scanCount?: number;
  lastScanned?: string;
}

export interface Prescription {
  _id?: string;
  patient: string;
  doctor: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  instructions?: string;
  medications: PrescriptionMedication[];
  qrSettings?: {
    maxMedications: number;
    maxScanCount: number;
    qrCodeWidth: number;
    qrCodeMargin: number;
  };
  scanCount?: number;
  lastScanned?: string;
  status?: 'active' | 'completed' | 'cancelled' | 'expired';
  language?: 'en' | 'ar';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrescriptionResponse {
  success: boolean;
  message: string;
  data: Prescription | Prescription[] | PrescriptionStats;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PrescriptionStats {
  summary: {
    totalPrescriptions: number;
    totalMedications: number;
    totalScans: number;
    averageMedicationsPerPrescription: number;
    averageScansPerPrescription: number;
  };
  statusDistribution: Array<{
    _id: string;
    count: number;
  }>;
  topMedications: Array<{
    _id: string;
    count: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  private apiUrl = environment.apiBaseUrl;
  private prescriptionsSubject = new BehaviorSubject<Prescription[]>([]);
  public prescriptions$ = this.prescriptionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Create a new prescription
   */
  createPrescription(prescription: Omit<Prescription, '_id'>): Observable<Prescription> {
    return this.http.post<PrescriptionResponse>(`${this.apiUrl}/prescriptions`, prescription, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data as Prescription),
      tap(prescription => {
        // Update local prescriptions list
        const currentPrescriptions = this.prescriptionsSubject.value;
        this.prescriptionsSubject.next([prescription, ...currentPrescriptions]);
      })
    );
  }

  /**
   * Get all prescriptions for a patient
   */
  getPatientPrescriptions(patientId: string, options?: {
    status?: string;
    limit?: number;
    page?: number;
  }): Observable<{ prescriptions: Prescription[]; pagination?: any }> {
    let url = `${this.apiUrl}/prescriptions/patient/${patientId}`;
    const params = new URLSearchParams();
    
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.page) params.append('page', options.page.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.http.get<PrescriptionResponse>(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => ({
        prescriptions: response.data as Prescription[],
        pagination: response.pagination
      })),
      tap(result => {
        // Update local prescriptions list
        this.prescriptionsSubject.next(result.prescriptions);
      })
    );
  }

  /**
   * Get a specific prescription
   */
  getPrescription(id: string): Observable<Prescription> {
    return this.http.get<PrescriptionResponse>(`${this.apiUrl}/prescriptions/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data as Prescription)
    );
  }

  /**
   * Update a prescription
   */
  updatePrescription(id: string, prescription: Partial<Prescription>): Observable<Prescription> {
    return this.http.put<PrescriptionResponse>(`${this.apiUrl}/prescriptions/${id}`, prescription, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data as Prescription),
      tap(updatedPrescription => {
        // Update local prescriptions list
        const currentPrescriptions = this.prescriptionsSubject.value;
        const updatedPrescriptions = currentPrescriptions.map(p => 
          p._id === id ? updatedPrescription : p
        );
        this.prescriptionsSubject.next(updatedPrescriptions);
      })
    );
  }

  /**
   * Delete a prescription
   */
  deletePrescription(id: string): Observable<void> {
    return this.http.delete<PrescriptionResponse>(`${this.apiUrl}/prescriptions/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(() => {}),
      tap(() => {
        // Remove from local prescriptions list
        const currentPrescriptions = this.prescriptionsSubject.value;
        const filteredPrescriptions = currentPrescriptions.filter(p => p._id !== id);
        this.prescriptionsSubject.next(filteredPrescriptions);
      })
    );
  }

  /**
   * Increment prescription scan count
   */
  incrementScanCount(id: string): Observable<{
    scanCount: number;
    maxScanCount: number;
    scansRemaining: number;
  }> {
    return this.http.post<PrescriptionResponse>(`${this.apiUrl}/prescriptions/${id}/scan`, {}, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data as any)
    );
  }

  /**
   * Increment medication scan count
   */
  incrementMedicationScanCount(prescriptionId: string, medicationId: string): Observable<{
    medicationId: string;
    scanCount: number;
    maxScanCount: number;
    scansRemaining: number;
  }> {
    return this.http.post<PrescriptionResponse>(
      `${this.apiUrl}/prescriptions/${prescriptionId}/medications/${medicationId}/scan`, 
      {}, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data as any)
    );
  }

  /**
   * Get prescriptions by date range
   */
  getPrescriptionsByDateRange(startDate: string, endDate: string, options?: {
    doctorId?: string;
    status?: string;
  }): Observable<Prescription[]> {
    let url = `${this.apiUrl}/prescriptions/date-range?startDate=${startDate}&endDate=${endDate}`;
    
    if (options?.doctorId) url += `&doctorId=${options.doctorId}`;
    if (options?.status) url += `&status=${options.status}`;

    return this.http.get<PrescriptionResponse>(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data as Prescription[])
    );
  }

  /**
   * Get prescription statistics
   */
  getPrescriptionStats(options?: {
    startDate?: string;
    endDate?: string;
    doctorId?: string;
  }): Observable<PrescriptionStats> {
    let url = `${this.apiUrl}/prescriptions/stats`;
    const params = new URLSearchParams();
    
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.doctorId) params.append('doctorId', options.doctorId);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.http.get<PrescriptionResponse>(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data as PrescriptionStats)
    );
  }

  /**
   * Load prescriptions from localStorage (for migration)
   */
  loadFromLocalStorage(patientId: string): Prescription[] {
    const storedPrescriptions = localStorage.getItem(`patient_prescriptions_${patientId}`);
    if (storedPrescriptions) {
      try {
        return JSON.parse(storedPrescriptions);
      } catch (error) {
        console.error('Error parsing stored prescriptions:', error);
        return [];
      }
    }
    return [];
  }

  /**
   * Migrate prescriptions from localStorage to MongoDB
   */
  async migrateFromLocalStorage(patientId: string): Promise<void> {
    const localPrescriptions = this.loadFromLocalStorage(patientId);
    
    for (const prescription of localPrescriptions) {
      try {
        // Convert localStorage format to API format
        const apiPrescription: Omit<Prescription, '_id'> = {
          patient: patientId,
          doctor: prescription.doctor || 'unknown',
          doctorName: prescription.doctorName || 'Unknown Doctor',
          date: prescription.date,
          diagnosis: prescription.diagnosis,
          instructions: prescription.instructions,
          medications: prescription.medications.map(med => ({
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            instructions: med.instructions,
            scanCount: med.scanCount || 0,
            lastScanned: med.lastScanned
          })),
          qrSettings: {
            maxMedications: 6,
            maxScanCount: 2,
            qrCodeWidth: 300,
            qrCodeMargin: 2
          },
          scanCount: prescription.scanCount || 0,
          lastScanned: prescription.lastScanned,
          status: 'active',
          language: 'en'
        };

        await this.createPrescription(apiPrescription).toPromise();
        
      } catch (error) {
        console.error(`Failed to migrate prescription ${prescription._id}:`, error);
      }
    }

    // Clear localStorage after successful migration
    localStorage.removeItem(`patient_prescriptions_${patientId}`);
    
  }

  /**
   * Clear local prescriptions cache
   */
  clearCache(): void {
    this.prescriptionsSubject.next([]);
  }
}
