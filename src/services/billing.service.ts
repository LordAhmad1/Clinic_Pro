import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Invoice } from '../models/billing.model';

interface InvoiceStorage {
  invoices: Invoice[];
  lastUpdated: string;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private readonly STORAGE_KEY = 'clinic_invoices';
  private readonly invoicesSubject = new BehaviorSubject<Invoice[]>([]);
  
  public readonly invoices$ = this.invoicesSubject.asObservable();

  constructor() {
    this.initializeData();
  }

  // Public API
  getInvoices(): Observable<Invoice[]> {
    return this.invoices$.pipe(
      catchError(error => {
        console.error('Error getting invoices:', error);
        return of([]);
      })
    );
  }

  getInvoice(id: string): Observable<Invoice | undefined> {
    return this.invoices$.pipe(
      map(invoices => invoices.find(invoice => invoice.id === id)),
      catchError(error => {
        console.error(`Error getting invoice ${id}:`, error);
        return of(undefined);
      })
    );
  }

  addInvoice(invoiceData: Omit<Invoice, 'id'>): Observable<Invoice> {
    return new Observable(observer => {
      try {
        const invoices = this.invoicesSubject.value;
        const newInvoice: Invoice = {
          ...invoiceData,
          id: this.generateId(invoices)
        };

        const updatedInvoices = [...invoices, newInvoice];
        this.updateInvoices(updatedInvoices);
        
        observer.next(newInvoice);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  updateInvoice(id: string, updates: Partial<Invoice>): Observable<Invoice> {
    return new Observable(observer => {
      try {
        const invoices = this.invoicesSubject.value;
        const index = invoices.findIndex(invoice => invoice.id === id);
        
        if (index === -1) {
          observer.error(new Error(`Invoice with id ${id} not found`));
          return;
        }

        const updatedInvoice = { ...invoices[index], ...updates };
        const updatedInvoices = [...invoices];
        updatedInvoices[index] = updatedInvoice;
        
        this.updateInvoices(updatedInvoices);
        
        observer.next(updatedInvoice);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  deleteInvoice(id: string): Observable<void> {
    return new Observable(observer => {
      try {
        const invoices = this.invoicesSubject.value;
        const filteredInvoices = invoices.filter(invoice => invoice.id !== id);
        
        if (filteredInvoices.length === invoices.length) {
          observer.error(new Error(`Invoice with id ${id} not found`));
          return;
        }

        this.updateInvoices(filteredInvoices);
        
        observer.next();
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  // Private methods
  private initializeData(): void {
    const storedData = this.loadFromStorage();
    if (storedData) {
      this.invoicesSubject.next(storedData);
    } else {
      this.loadMockData();
    }
  }

  private loadFromStorage(): Invoice[] | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const data: InvoiceStorage = JSON.parse(stored);
      return this.validateInvoices(data.invoices);
    } catch (error) {
      console.error('Error loading invoices from storage:', error);
      return null;
    }
  }

  private saveToStorage(invoices: Invoice[]): void {
    try {
      const data: InvoiceStorage = {
        invoices,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving invoices to storage:', error);
    }
  }

  private updateInvoices(invoices: Invoice[]): void {
    this.invoicesSubject.next(invoices);
    this.saveToStorage(invoices);
  }

  private generateId(invoices: Invoice[]): string {
    const maxId = Math.max(...invoices.map(invoice => parseInt(invoice.id) || 0), 0);
    return String(maxId + 1);
  }

  private validateInvoices(invoices: unknown): Invoice[] {
    if (!Array.isArray(invoices)) {
      console.warn('Invalid invoices data: not an array');
      return [];
    }

    return invoices.filter(invoice => {
      if (!invoice || typeof invoice !== 'object') return false;
      
      const requiredFields = ['id', 'patientId', 'amount', 'status', 'issueDate'];
      return requiredFields.every(field => field in invoice);
    }) as Invoice[];
  }

  private loadMockData(): void {
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        patientId: '1',
        appointmentId: '1',
        amount: 150.00,
        status: 'paid',
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        services: [
          {
            id: '1',
            description: 'Consultation',
            quantity: 1,
            unitPrice: 100.00,
            total: 100.00
          },
          {
            id: '2',
            description: 'Lab Test',
            quantity: 1,
            unitPrice: 50.00,
            total: 50.00
          }
        ],
        patient: {
          id: '1',
          name: 'John Doe',
          phone: '+1234567890'
        }
      },
      {
        id: '2',
        patientId: '2',
        appointmentId: '2',
        amount: 200.00,
        status: 'unpaid',
        issueDate: '2024-01-20',
        dueDate: '2024-02-20',
        services: [
          {
            id: '3',
            description: 'X-Ray',
            quantity: 1,
            unitPrice: 200.00,
            total: 200.00
          }
        ],
        patient: {
          id: '2',
          name: 'Jane Smith',
          phone: '+0987654321'
        }
      }
    ];

    this.updateInvoices(mockInvoices);
  }
}