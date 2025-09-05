import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SpecializationService, Specialization } from '../../services/specialization.service';
import { UserManagementService, UserAccount } from '../../services/user-management.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  specializations: Specialization[] = [];
  users: UserAccount[] = [];
  
  // Active tab
  activeTab: 'specializations' | 'users' = 'specializations';
  
  // Specialization modals
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  editingSpecialization: Specialization | null = null;
  
  // User modals
  showAddUserModal: boolean = false;
  showEditUserModal: boolean = false;
  editingUser: UserAccount | null = null;
  passwordVisible: boolean = false;

  newSpecialization: Omit<Specialization, 'id' | 'createdAt'> = {
    name: '',
    description: ''
  };

  newUser: Omit<UserAccount, 'id' | 'createdAt'> = {
    name: '',
    email: '',
    password: '',
    nationalId: '',
    role: 'doctor',
    specialization: '',
    phone: '',
    avatar: '',
    workingHours: {
      start: '09:00',
      end: '17:00',
      days: []
    },
    isActive: true
  };

  weekDays = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday'
  ];

  constructor(
    private specializationService: SpecializationService,
    private userManagementService: UserManagementService,
    private authService: AuthService,
    private router: Router,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Check if user is manager
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || currentUser.role !== 'manager') {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadSpecializations();
    this.loadUsers();
  }

  // Tab management
  setActiveTab(tab: 'specializations' | 'users'): void {
    this.activeTab = tab;
  }

  loadSpecializations(): void {
    this.specializationService.getSpecializations().subscribe(specializations => {
      this.specializations = specializations;
    });
  }

  loadUsers(): void {
    this.userManagementService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  // Specialization methods
  openAddModal(): void {
    this.newSpecialization = {
      name: '',
      description: ''
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  openEditModal(specialization: Specialization): void {
    this.editingSpecialization = { ...specialization };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingSpecialization = null;
  }

  addSpecialization(): void {
    if (!this.newSpecialization.name.trim()) {
      alert('Please enter a specialization name');
      return;
    }

    this.specializationService.addSpecialization(this.newSpecialization).subscribe({
      next: () => {
        this.loadSpecializations();
        this.closeAddModal();
      },
      error: (error) => {
        console.error('Error adding specialization:', error);
        alert('Error adding specialization');
      }
    });
  }

  updateSpecialization(): void {
    if (!this.editingSpecialization || !this.editingSpecialization.name.trim()) {
      alert('Please enter a specialization name');
      return;
    }

    this.specializationService.updateSpecialization(
      this.editingSpecialization.id,
      { name: this.editingSpecialization.name, description: this.editingSpecialization.description }
    ).subscribe({
      next: () => {
        this.loadSpecializations();
        this.closeEditModal();
      },
      error: (error) => {
        console.error('Error updating specialization:', error);
        alert('Error updating specialization');
      }
    });
  }

  deleteSpecialization(specialization: Specialization): void {
    if (confirm(`Are you sure you want to delete "${specialization.name}"? This will affect all doctors with this specialization.`)) {
      this.specializationService.deleteSpecialization(specialization.id).subscribe({
        next: () => {
          this.loadSpecializations();
        },
        error: (error) => {
          console.error('Error deleting specialization:', error);
          alert('Error deleting specialization');
        }
      });
    }
  }

  // User management methods
  openAddUserModal(): void {
    this.newUser = {
      name: '',
      email: '',
      password: '',
      nationalId: '',
      role: 'doctor',
      specialization: '',
      phone: '',
      avatar: '',
      workingHours: {
        start: '09:00',
        end: '17:00',
        days: []
      },
      isActive: true
    };
    this.showAddUserModal = true;
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
  }

  openEditUserModal(user: UserAccount): void {
    this.editingUser = { ...user, newPassword: '' };
    this.showEditUserModal = true;
  }

  closeEditUserModal(): void {
    this.showEditUserModal = false;
    this.editingUser = null;
  }

  addUser(): void {
    if (!this.newUser.name.trim() || !this.newUser.email.trim() || !this.newUser.password.trim() || !this.newUser.nationalId?.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Check National ID length
    if (this.newUser.nationalId.length < 8 || this.newUser.nationalId.length > 13) {
      alert('National ID Number must be between 8 and 13 characters long.');
      return;
    }

    // Check if email already exists
    const existingUser = this.users.find(u => u.email === this.newUser.email);
    if (existingUser) {
      alert('A user with this email already exists');
      return;
    }

    // Check if national ID already exists
    const existingUserWithNationalId = this.users.find(u => u.nationalId === this.newUser.nationalId);
    if (existingUserWithNationalId) {
      alert('A user with this national ID already exists');
      return;
    }

    this.userManagementService.addUser(this.newUser).subscribe({
      next: () => {
        this.loadUsers();
        this.closeAddUserModal();
      },
      error: (error) => {
        console.error('Error adding user:', error);
        alert('Error adding user');
      }
    });
  }

  updateUser(): void {
    if (!this.editingUser || !this.editingUser.name.trim() || !this.editingUser.email.trim() || !this.editingUser.nationalId?.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Check National ID length
    if (this.editingUser.nationalId.length < 8 || this.editingUser.nationalId.length > 13) {
      alert('National ID Number must be between 8 and 13 characters long.');
      return;
    }

    // Check if email already exists (excluding current user)
    const existingUser = this.users.find(u => u.email === this.editingUser!.email && u.id !== this.editingUser!.id);
    if (existingUser) {
      alert('A user with this email already exists');
      return;
    }

    // Check if national ID already exists (excluding current user)
    const existingUserWithNationalId = this.users.find(u => u.nationalId === this.editingUser!.nationalId && u.id !== this.editingUser!.id);
    if (existingUserWithNationalId) {
      alert('A user with this national ID already exists');
      return;
    }

    // Update user data
    this.userManagementService.updateUser(this.editingUser.id, {
      name: this.editingUser.name,
      email: this.editingUser.email,
      nationalId: this.editingUser.nationalId,
      role: this.editingUser.role,
      specialization: this.editingUser.specialization,
      phone: this.editingUser.phone,
      avatar: this.editingUser.avatar,
      workingHours: this.editingUser.workingHours,
      isActive: this.editingUser.isActive
    }).subscribe({
      next: () => {
        // Update password if provided
        if (this.editingUser?.newPassword && this.editingUser.newPassword.trim() !== '') {
          this.updateUserPassword(this.editingUser.id, this.editingUser.newPassword);
        }
        
        this.loadUsers();
        this.closeEditUserModal();
      },
      error: (error) => {
        console.error('Error updating user:', error);
        alert('Error updating user');
      }
    });
  }

  deleteUser(user: UserAccount): void {
    if (confirm(`Are you sure you want to delete "${user.name}"? This action cannot be undone.`)) {
      this.userManagementService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Error deleting user');
        }
      });
    }
  }

  toggleUserStatus(user: UserAccount): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} "${user.name}"?`)) {
      this.userManagementService.updateUser(user.id, { isActive: !user.isActive }).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error updating user status:', error);
          alert('Error updating user status');
        }
      });
    }
  }

  onWorkingDayChange(day: string, event: any, isEditing: boolean = false): void {
    const targetUser = isEditing ? this.editingUser : this.newUser;
    if (!targetUser?.workingHours) return;

    if (event.target.checked) {
      if (!targetUser.workingHours.days.includes(day)) {
        targetUser.workingHours.days.push(day);
      }
    } else {
      const index = targetUser.workingHours.days.indexOf(day);
      if (index > -1) {
        targetUser.workingHours.days.splice(index, 1);
      }
    }
  }

  isDaySelected(day: string, isEditing: boolean = false): boolean {
    const targetUser = isEditing ? this.editingUser : this.newUser;
    return targetUser?.workingHours?.days.includes(day) || false;
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'manager': return 'bg-danger';
      case 'doctor': return 'bg-primary';
      case 'secretary': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  isManager(): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser?.role === 'manager';
  }

  // Photo upload methods
  onPhotoUpload(event: any, isEditing: boolean = false): void {
    
    const file = event.target.files[0];
    if (file) {

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64 = e.target.result;

        if (isEditing) {
          this.editingUser!.avatar = base64;
          
        } else {
          this.newUser.avatar = base64;
          
        }
      };
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Error reading the selected file. Please try again.');
      };
      
      reader.readAsDataURL(file);
    } else {
      
    }
  }

  getUserPhoto(user: UserAccount): string {
    return user.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1';
  }

  getUserInitials(user: UserAccount | Omit<UserAccount, 'id' | 'createdAt'>): string {
    if (!user.name) return 'U';
    return user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
  }

  togglePasswordVisibility(fieldId: string): void {
    this.passwordVisible = !this.passwordVisible;
    const input = document.getElementById(fieldId) as HTMLInputElement;
    if (input) {
      input.type = this.passwordVisible ? 'text' : 'password';
    }
  }

  updateUserPassword(userId: number, newPassword: string): void {
    if (!newPassword || newPassword.trim() === '') {
      return; // Don't update if password is empty
    }

    this.userManagementService.updateUserPassword(userId, newPassword).subscribe({
      next: () => {
        
        alert(this.translationService.translate('PASSWORD_UPDATE_SUCCESS'));
      },
      error: (error) => {
        console.error('Error updating password:', error);
        alert('Error updating password');
      }
    });
  }

} 