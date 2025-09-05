import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

export interface UserAccount {
  id: number;
  name: string;
  email: string;
  password: string;
  newPassword?: string; // For password updates
  nationalId?: string;
  role: 'doctor' | 'secretary' | 'manager';
  specialization?: string;
  phone?: string;
  avatar?: string;
  workingHours?: {
    start: string;
    end: string;
    days: string[];
  };
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private STORAGE_KEY = 'clinic_users';
  private usersSubject = new BehaviorSubject<UserAccount[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    const storedData = localStorage.getItem(this.STORAGE_KEY);
    if (storedData) {
      try {
        const users = JSON.parse(storedData);
        this.usersSubject.next(users);
      } catch (error) {
        console.error('Error loading users from localStorage:', error);
        this.loadDefaultUsers();
      }
    } else {
      this.loadDefaultUsers();
    }
  }

  private loadDefaultUsers(): void {
    const defaultUsers: UserAccount[] = [
      {
        id: 1,
        name: 'Dr. Ahmed Hassan',
        email: 'doctor@clinic.com',
        password: '123456',
        nationalId: '1234567890',
        role: 'doctor',
        specialization: 'Cardiology',
        avatar: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        workingHours: {
          start: '09:00',
          end: '17:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 2,
        name: 'Sara Mohamed',
        email: 'secretary@clinic.com',
        password: '123456',
        nationalId: '2345678901',
        role: 'secretary',
        avatar: 'https://images.pexels.com/photos/3812743/pexels-photo-3812743.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 3,
        name: 'Omar Ali',
        email: 'manager@clinic.com',
        password: '123456',
        nationalId: '3456789012',
        role: 'manager',
        avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        isActive: true,
        createdAt: new Date()
      }
    ];
    this.usersSubject.next(defaultUsers);
    this.saveToStorage(defaultUsers);
  }

  private saveToStorage(users: UserAccount[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  getUsers(): Observable<UserAccount[]> {
    return this.users$;
  }

  addUser(user: Omit<UserAccount, 'id' | 'createdAt'>): Observable<UserAccount> {
    return new Observable(observer => {
      const currentUsers = this.usersSubject.value;
      const newUser: UserAccount = {
        ...user,
        id: Math.max(...currentUsers.map(u => u.id), 0) + 1,
        createdAt: new Date()
      };

      const updatedUsers = [...currentUsers, newUser];
      this.usersSubject.next(updatedUsers);
      this.saveToStorage(updatedUsers);
      
      observer.next(newUser);
      observer.complete();
    });
  }

  updateUser(id: number, updates: Partial<UserAccount>): Observable<UserAccount> {
    return new Observable(observer => {
      const currentUsers = this.usersSubject.value;
      const index = currentUsers.findIndex(u => u.id === id);
      
      if (index !== -1) {
        const updatedUser = { ...currentUsers[index], ...updates };
        const updatedUsers = [...currentUsers];
        updatedUsers[index] = updatedUser;
        
        this.usersSubject.next(updatedUsers);
        this.saveToStorage(updatedUsers);
        
        observer.next(updatedUser);
      } else {
        observer.error('User not found');
      }
      observer.complete();
    });
  }

  deleteUser(id: number): Observable<void> {
    return new Observable(observer => {
      const currentUsers = this.usersSubject.value;
      const updatedUsers = currentUsers.filter(u => u.id !== id);
      
      this.usersSubject.next(updatedUsers);
      this.saveToStorage(updatedUsers);
      
      observer.next();
      observer.complete();
    });
  }

  authenticateUser(email: string, password: string): UserAccount | null {
    const users = this.usersSubject.value;
    const user = users.find(u => u.email === email && u.password === password && u.isActive);
    return user || null;
  }

  getUserById(id: number): UserAccount | null {
    const users = this.usersSubject.value;
    return users.find(u => u.id === id) || null;
  }

  getUsersByRole(role: string): UserAccount[] {
    const users = this.usersSubject.value;
    return users.filter(u => u.role === role && u.isActive);
  }

  clearAllData(): void {
    this.usersSubject.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  updateUserPassword(id: number, newPassword: string): Observable<UserAccount> {
    return new Observable(observer => {
      const currentUsers = this.usersSubject.value;
      const index = currentUsers.findIndex(u => u.id === id);
      
      if (index !== -1) {
        const updatedUser = { ...currentUsers[index], password: newPassword };
        const updatedUsers = [...currentUsers];
        updatedUsers[index] = updatedUser;
        
        this.usersSubject.next(updatedUsers);
        this.saveToStorage(updatedUsers);
        
        observer.next(updatedUser);
      } else {
        observer.error('User not found');
      }
      observer.complete();
    });
  }
} 