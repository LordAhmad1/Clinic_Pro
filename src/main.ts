import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './services/auth.service';
import { SidebarComponent } from './components/layout/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="app-container">
      <div class="row g-0 min-vh-100" *ngIf="!isLoginPage()">
        <div class="col-lg-2 col-md-3">
          <app-sidebar></app-sidebar>
        </div>
        <div class="col-lg-10 col-md-9">
          <div class="main-content p-4">
            <router-outlet></router-outlet>
          </div>
        </div>
      </div>
      
      <router-outlet *ngIf="isLoginPage()"></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: var(--accent-color);
    }
    
    .main-content {
      background-color: var(--accent-color);
      min-height: 100vh;
      color: white;
    }
    
    @media (max-width: 768px) {
      .main-content {
        padding: 1rem !important;
      }
    }
  `]
})
export class App {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Check if user is authenticated on app start
    if (!this.authService.isAuthenticated() && !this.isLoginPage()) {
      this.router.navigate(['/login']);
    }
  }

  isLoginPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/';
  }
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
});