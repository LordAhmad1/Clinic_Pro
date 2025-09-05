import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { BillingService } from '../../services/billing.service';
import { PatientService } from '../../services/patient.service';
import { Invoice, InvoiceService } from '../../models/billing.model';
import { Patient } from '../../models/patient.model';
import { TranslationService } from '../../services/translation.service';

interface BillingFilters {
  searchTerm: string;
  statusFilter: string;
}

interface NewInvoiceForm {
  patientId: string;
  appointmentId: string;
  amount: number;
  status: 'unpaid' | 'paid' | 'partially-paid';
  issueDate: string;
  dueDate: string;
  services: InvoiceService[];
  patient?: Patient;
}

interface NewServiceForm {
  description: string;
  quantity: number;
  unitPrice: number;
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit, OnDestroy {
  // Data
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];

  // UI State
  selectedInvoice: Invoice | null = null;
  showAddModal = false;
  showDetailsModal = false;
  showPatientDropdown = false;
  selectedPatient: Patient | null = null;

  // Forms
  filters: BillingFilters = {
    searchTerm: '',
    statusFilter: ''
  };

  // Template properties
  searchTerm: string = '';
  statusFilter: string = '';

  patientSearchTerm = '';

  newInvoice: NewInvoiceForm = this.getDefaultInvoice();
  newService: NewServiceForm = this.getDefaultService();

  // Lifecycle
  private destroy$ = new Subject<void>();

  constructor(
    private billingService: BillingService,
    private patientService: PatientService,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Data Loading
  private loadData(): void {
    this.loadInvoices();
    this.loadPatients();
  }

  private loadInvoices(): void {
    this.billingService.getInvoices()
      .pipe(takeUntil(this.destroy$))
      .subscribe(invoices => {
        this.invoices = invoices;
        this.applyFilters();
      });
  }

  private loadPatients(): void {
    this.patientService.getPatients()
      .pipe(takeUntil(this.destroy$))
      .subscribe(patients => {
        this.patients = patients;
        if (this.showAddModal) {
          this.filterPatients();
        }
      });
  }

  // Filtering
  onSearch(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredInvoices = this.invoices.filter(invoice => {
      const matchesSearch = this.matchesSearchTerm(invoice);
      const matchesStatus = this.matchesStatusFilter(invoice);
      return matchesSearch && matchesStatus;
    });
  }

  private matchesSearchTerm(invoice: Invoice): boolean {
    if (!this.filters.searchTerm) return true;
    
    const searchTerm = this.filters.searchTerm.toLowerCase();
    return (
      (invoice.patient?.name?.toLowerCase().includes(searchTerm) ?? false) ||
      invoice.id.toString().includes(searchTerm) ||
      (invoice.patient?.id?.toString().includes(searchTerm) ?? false)
    );
  }

  private matchesStatusFilter(invoice: Invoice): boolean {
    return !this.filters.statusFilter || invoice.status === this.filters.statusFilter;
  }

  // Modal Management
  openAddModal(): void {
    this.resetForms();
    this.showAddModal = true;
    this.filterPatients();
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetForms();
  }

  openDetailsModal(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedInvoice = null;
  }

  // Patient Search
  filterPatients(): void {
    if (!this.patientSearchTerm.trim()) {
      this.filteredPatients = this.patients.slice(0, 10);
      this.showPatientDropdown = false;
    } else {
      this.filteredPatients = this.patients
        .filter(patient => this.matchesPatientSearch(patient))
        .slice(0, 10);
      this.showPatientDropdown = true;
    }
  }

  private matchesPatientSearch(patient: Patient): boolean {
    const searchTerm = this.patientSearchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(searchTerm) ||
      patient.phone.includes(searchTerm) ||
      (patient.nationalId ? patient.nationalId.includes(searchTerm) : false)
    );
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.newInvoice.patientId = patient.id;
    this.newInvoice.patient = patient;
    this.patientSearchTerm = patient.name;
    this.showPatientDropdown = false;
  }

  onPatientInputFocus(): void {
    this.showPatientDropdown = false;
    this.filterPatients();
  }

  hidePatientDropdown(): void {
    setTimeout(() => {
      this.showPatientDropdown = false;
    }, 200);
  }

  // Service Management
  addService(): void {
    if (!this.isValidService()) return;

    const service: InvoiceService = {
      id: Date.now().toString(),
      ...this.newService,
      total: this.newService.quantity * this.newService.unitPrice
    };

    this.newInvoice.services.push(service);
    this.calculateTotal();
    this.resetServiceForm();
  }

  removeService(index: number): void {
    this.newInvoice.services.splice(index, 1);
    this.calculateTotal();
  }

  private isValidService(): boolean {
    return Boolean(this.newService.description && this.newService.unitPrice > 0);
  }

  private resetServiceForm(): void {
    this.newService = this.getDefaultService();
  }

  // Invoice Management
  addInvoice(): void {
    this.saveInvoice();
  }

  updateInvoiceStatus(invoice: Invoice, status: string): void {
    this.billingService.updateInvoice(invoice.id, { status: status as 'paid' | 'unpaid' | 'partially-paid' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadInvoices(),
        error: (error) => console.error('Error updating invoice status:', error)
      });
  }

  saveInvoice(): void {
    if (!this.isValidInvoice()) return;

    const invoice: Invoice = {
      id: Date.now().toString(),
      ...this.newInvoice,
      amount: this.calculateTotal()
    };

    this.billingService.addInvoice(invoice)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadInvoices();
          this.closeAddModal();
        },
        error: (error: unknown) => {
          console.error('Error creating invoice:', error);
        }
      });
  }

  deleteInvoice(invoice: Invoice): void {
    if (!confirm(`Are you sure you want to delete invoice #${invoice.id}?`)) return;

    this.billingService.deleteInvoice(invoice.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadInvoices(),
        error: (error) => console.error('Error deleting invoice:', error)
      });
  }

  private isValidInvoice(): boolean {
    return Boolean(this.newInvoice.patientId && this.newInvoice.services.length > 0);
  }

  // Calculations
  private calculateTotal(): number {
    return this.newInvoice.services.reduce((total, service) => total + service.total, 0);
  }

  getTotalRevenue(): number {
    return this.invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((total, invoice) => total + invoice.amount, 0);
  }

  getPendingAmount(): number {
    return this.invoices
      .filter(invoice => invoice.status === 'unpaid')
      .reduce((total, invoice) => total + invoice.amount, 0);
  }

  // Utilities
  private resetForms(): void {
    this.newInvoice = this.getDefaultInvoice();
    this.newService = this.getDefaultService();
    this.patientSearchTerm = '';
    this.selectedPatient = null;
    this.showPatientDropdown = false;
    this.filteredPatients = this.patients.slice(0, 10);
  }

  private getDefaultInvoice(): NewInvoiceForm {
    return {
      patientId: '0',
      appointmentId: '0',
      amount: 0,
      status: 'unpaid',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: this.getDefaultDueDate(),
      services: [],
      patient: undefined
    };
  }

  private getDefaultService(): NewServiceForm {
    return {
      description: '',
      quantity: 1,
      unitPrice: 0
    };
  }

  private getDefaultDueDate(): string {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 1);
    return dueDate.toISOString().split('T')[0];
  }

  // UI Helpers
  getStatusBadgeClass(status: string): string {
    const statusClasses = {
      'paid': 'bg-success',
      'unpaid': 'bg-danger',
      'partially-paid': 'bg-warning'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'bg-secondary';
  }

  getStatusDisplayText(status: string): string {
    const statusTexts = {
      'paid': this.translationService.translate('paid'),
      'unpaid': this.translationService.translate('unpaid'),
      'partially-paid': this.translationService.translate('partiallyPaid')
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  }
}