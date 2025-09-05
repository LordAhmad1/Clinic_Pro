import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;
  menuItems: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.setupMenuItems();
    });
  }

  private setupMenuItems(): void {
    const baseItems = [
      { icon: 'fas fa-tachometer-alt', label: this.translationService.translate('dashboard'), route: '/dashboard' },
      { icon: 'fas fa-users', label: this.translationService.translate('patients'), route: '/patients' },
      { icon: 'fas fa-calendar-alt', label: this.translationService.translate('appointments'), route: '/appointments' }
    ];

    const doctorItems = [
      { icon: 'fas fa-user-md', label: this.translationService.translate('doctors'), route: '/doctors' }
    ];

    const billingItems = [
      { icon: 'fas fa-file-invoice-dollar', label: this.translationService.translate('billing'), route: '/billing' }
    ];

    const reportsItems = [
      { icon: 'fas fa-chart-bar', label: this.translationService.translate('reports'), route: '/reports' }
    ];

    const adminItems = [
      { icon: 'fas fa-cogs', label: this.translationService.translate('admin'), route: '/admin' }
    ];

    this.menuItems = [...baseItems];

    if (this.currentUser?.role === 'manager') {
      this.menuItems.push(...doctorItems, ...billingItems, ...reportsItems, ...adminItems);
    } else if (this.currentUser?.role === 'secretary') {
      this.menuItems.push(...billingItems);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  switchLanguage(): void {
    this.translationService.switchLanguage();
    this.setupMenuItems(); // Refresh menu items with new language
  }
}