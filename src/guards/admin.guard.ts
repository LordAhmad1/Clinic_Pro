import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const currentUser = this.authService.currentUserValue;
    const isAuthenticated = this.authService.isAuthenticated();
    const isManager = currentUser?.role === 'manager';
    
    if (isAuthenticated && isManager) {
      return true;
    } else {
      // Redirect to dashboard if not authorized
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}
