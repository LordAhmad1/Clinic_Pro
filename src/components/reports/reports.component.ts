import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../services/patient.service';
import { AppointmentService } from '../../services/appointment.service';
import { BillingService } from '../../services/billing.service';
import { DoctorService } from '../../services/doctor.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  // Statistics
  totalPatients: number = 0;
  totalDoctors: number = 0;
  totalAppointments: number = 0;
  totalRevenue: number = 0;
  
  // Monthly data
  monthlyPatients: number = 0;
  monthlyAppointments: number = 0;
  monthlyRevenue: number = 0;
  
  // Today's data
  todayAppointments: number = 0;
  todayRevenue: number = 0;
  
  // Status breakdowns
  appointmentsByStatus: any = {};
  invoicesByStatus: any = {};
  
  // Top performing data
  topDoctors: any[] = [];
  recentActivity: any[] = [];

  constructor(
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private billingService: BillingService,
    private doctorService: DoctorService,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadReportsData();
  }

  private loadReportsData(): void {
    // Load patients data
    this.patientService.getPatients().subscribe(patients => {
      this.totalPatients = patients.length;
      this.calculateMonthlyPatients(patients);
    });

    // Load doctors data
    this.doctorService.getDoctors().subscribe(doctors => {
      this.totalDoctors = doctors.length;
      this.calculateTopDoctors(doctors);
    });

    // Load appointments data
    this.appointmentService.getAppointments().subscribe(appointments => {
      this.totalAppointments = appointments.length;
      this.calculateAppointmentStats(appointments);
      this.generateRecentActivity(appointments);
    });

    // Load billing data
    this.billingService.getInvoices().subscribe(invoices => {
      this.calculateRevenueStats(invoices);
    });
  }

  private calculateMonthlyPatients(patients: any[]): void {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    this.monthlyPatients = patients.filter(patient => {
      const createdDate = new Date(patient.createdAt);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;
  }

  private calculateAppointmentStats(appointments: any[]): void {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Today's appointments
    this.todayAppointments = appointments.filter(a => a.date === today).length;

    // Monthly appointments
    this.monthlyAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.getMonth() === currentMonth && appointmentDate.getFullYear() === currentYear;
    }).length;

    // Appointments by status
    this.appointmentsByStatus = appointments.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateRevenueStats(invoices: any[]): void {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const today = new Date().toISOString().split('T')[0];

    // Total revenue (paid invoices only)
    this.totalRevenue = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((total, invoice) => total + invoice.amount, 0);

    // Monthly revenue
    this.monthlyRevenue = invoices
      .filter(invoice => {
        const invoiceDate = new Date(invoice.issueDate);
        return invoice.status === 'paid' && 
               invoiceDate.getMonth() === currentMonth && 
               invoiceDate.getFullYear() === currentYear;
      })
      .reduce((total, invoice) => total + invoice.amount, 0);

    // Today's revenue
    this.todayRevenue = invoices
      .filter(invoice => invoice.status === 'paid' && invoice.issueDate === today)
      .reduce((total, invoice) => total + invoice.amount, 0);

    // Invoices by status
    this.invoicesByStatus = invoices.reduce((acc, invoice) => {
      acc[invoice.status] = (acc[invoice.status] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateTopDoctors(doctors: any[]): void {
    // Mock data for top performing doctors
    this.topDoctors = doctors.slice(0, 3).map((doctor, index) => ({
      ...doctor,
      appointmentsCount: Math.floor(Math.random() * 50) + 20,
      revenue: Math.floor(Math.random() * 5000) + 2000,
      rating: (4.0 + Math.random()).toFixed(1)
    })).sort((a, b) => b.appointmentsCount - a.appointmentsCount);
  }

  private generateRecentActivity(appointments: any[]): void {
    // Generate recent activity based on appointments
    this.recentActivity = appointments
      .slice(-5)
      .reverse()
      .map(appointment => ({
        type: 'appointment',
        description: `Appointment scheduled for ${appointment.patient?.name || 'Unknown Patient'}`,
        time: appointment.createdAt || appointment.date,
        icon: 'fas fa-calendar-plus',
        color: 'text-primary'
      }));

  }

  getStatusPercentage(status: string, data: any): number {
    const total = Object.values(data).reduce((sum: number, count: any) => sum + count, 0);
    return total > 0 ? Math.round((data[status] || 0) / total * 100) : 0;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'scheduled': case 'unpaid': return 'primary';
      case 'completed': case 'paid': return 'success';
      case 'cancelled': return 'danger';
      case 'no-show': case 'partially-paid': return 'warning';
      default: return 'secondary';
    }
  }

  getStatusDisplayText(status: string): string {
    switch (status) {
      case 'scheduled': return this.translationService.translate('scheduled');
      case 'completed': return this.translationService.translate('completed');
      case 'cancelled': return this.translationService.translate('cancelled');
      case 'no-show': return this.translationService.translate('noShow');
      case 'paid': return this.translationService.translate('paid');
      case 'unpaid': return this.translationService.translate('unpaid');
      case 'partially-paid': return this.translationService.translate('partiallyPaid');
      default: return status;
    }
  }

  getPaymentStatusIcon(status: string): string {
    switch (status) {
      case 'paid': return 'fas fa-check-circle';
      case 'unpaid': return 'fas fa-times-circle';
      case 'partially-paid': return 'fas fa-minus-circle';
      default: return 'fas fa-question-circle';
    }
  }

  getPaymentStatusIconColor(status: string): string {
    switch (status) {
      case 'paid': return '#28a745';
      case 'unpaid': return '#dc3545';
      case 'partially-paid': return '#ffc107';
      default: return '#6c757d';
    }
  }

}