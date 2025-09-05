import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PatientService } from '../../services/patient.service';
import { AppointmentService } from '../../services/appointment.service';
import { TranslationService } from '../../services/translation.service';
import { User } from '../../models/user.model';
import { Patient } from '../../models/patient.model';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  currentDate: string = '';
  currentTime: string = '';
  totalPatients: number = 0;
  todayAppointments: number = 0;
  completedToday: number = 0;
  recentPatients: Patient[] = [];
  upcomingAppointments: Appointment[] = [];

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private router: Router,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Initialize date and time
    const now = new Date();
    this.currentDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Load patients count
    this.patientService.getPatients().subscribe(patients => {
      this.totalPatients = patients.length;
      this.recentPatients = patients.slice(-3).reverse();
    });

    // Load appointments data
    this.appointmentService.getAppointments().subscribe(appointments => {
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(a => a.date === today);
      
      this.todayAppointments = todayAppointments.length;
      this.completedToday = todayAppointments.filter(a => a.status === 'completed').length;
      
      // Get upcoming appointments (next 3) - Fixed filtering
      const now = new Date();
      
      const upcoming = appointments
        .filter(a => {
          const appointmentDate = new Date(a.date + ' ' + a.time);
          const isFuture = appointmentDate > now;
          const isScheduled = a.status === 'scheduled';
          
          return isFuture && isScheduled;
        })
        .sort((a, b) => {
          const dateA = new Date(a.date + ' ' + a.time);
          const dateB = new Date(b.date + ' ' + b.time);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 3);
      
      this.upcomingAppointments = upcoming;
      
      // If no upcoming appointments found, show some scheduled appointments anyway
      if (upcoming.length === 0) {
        const scheduledAppointments = appointments
          .filter(a => a.status === 'scheduled')
          .sort((a, b) => {
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 3);
        
        this.upcomingAppointments = scheduledAppointments;
      }
    });
  }

  getGreeting(): string {
    return this.translationService.getGreeting();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'scheduled': return 'bg-primary';
      case 'completed': return 'bg-accent';
      case 'cancelled': return 'bg-danger';
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

  getStatusDisplayText(status: string): string {
    switch (status) {
      case 'scheduled': return this.translationService.translate('scheduled');
      case 'completed': return this.translationService.translate('completed');
      case 'cancelled': return this.translationService.translate('cancelled');
      case 'no-show': return this.translationService.translate('noShow');
      default: return status;
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  refreshDashboard(): void {
    // This method can be called when language changes to refresh any dynamic content
    this.loadDashboardData();
  }

}