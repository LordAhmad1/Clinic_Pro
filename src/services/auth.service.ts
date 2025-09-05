import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'doctor' | 'secretary';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginCredentials): Observable<User> {
    // For now, use simple hardcoded authentication
    // This will work immediately without backend
    return new Observable(observer => {
      setTimeout(() => {
        const user = this.validateCredentials(credentials);
        if (user) {
          this.currentUserSubject.next(user);
          this.saveUserToStorage(user);
          observer.next(user);
          observer.complete();
        } else {
          observer.error(new Error('Invalid credentials'));
        }
      }, 500);
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('clinic_user');
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  isManager(): boolean {
    return this.currentUserValue?.role === 'manager';
  }

  isDoctor(): boolean {
    return this.currentUserValue?.role === 'doctor';
  }

  isSecretary(): boolean {
    return this.currentUserValue?.role === 'secretary';
  }

  private validateCredentials(credentials: LoginCredentials): User | null {
    // Default admin user only
    if (credentials.email === 'admin@clinic.com' && credentials.password === 'admin123') {
      return {
        id: '1',
        name: 'Admin User',
        email: 'admin@clinic.com',
        role: 'manager'
      };
    }

    return null;
  }

  private loadStoredUser(): void {
    try {
      const stored = localStorage.getItem('clinic_user');
      if (stored) {
        const user = JSON.parse(stored);
        this.currentUserSubject.next(user);
      }
    } catch (error) {
      // Silent error handling
    }
  }

  private saveUserToStorage(user: User): void {
    try {
      localStorage.setItem('clinic_user', JSON.stringify(user));
    } catch (error) {
      // Silent error handling
    }
  }
}