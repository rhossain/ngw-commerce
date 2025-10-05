import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser$: Observable<User | null>;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  
  isEditingProfile = false;
  isUpdatingProfile = false;
  isChangingPassword = false;
  showPasswordForm = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.initializeForms();
    this.loadUserData();
  }

  initializeForms(): void {
    this.profileForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      display_name: ['']
    });

    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Disable profile form initially
    this.profileForm.disable();
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('new_password');
    const confirmPassword = form.get('confirm_password');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  loadUserData(): void {
    this.currentUser$.subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          display_name: user.display_name
        });
      }
    });
  }

  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
    if (this.isEditingProfile) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
      this.loadUserData(); // Reset form if cancelled
    }
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.toastr.error('Please fill in all required fields correctly');
      return;
    }

    this.isUpdatingProfile = true;

    // In a real application, you would call an API to update the profile
    // For now, we'll simulate it
    setTimeout(() => {
      this.isUpdatingProfile = false;
      this.isEditingProfile = false;
      this.profileForm.disable();
      this.toastr.success('Profile updated successfully!');
    }, 1000);
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.passwordForm.reset();
    }
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.toastr.error('Please fill in all password fields correctly');
      return;
    }

    this.isChangingPassword = true;

    // In a real application, you would call an API to change the password
    setTimeout(() => {
      this.isChangingPassword = false;
      this.showPasswordForm = false;
      this.passwordForm.reset();
      this.toastr.success('Password changed successfully!');
    }, 1000);
  }

  logout(): void {
    this.authService.logout();
    this.toastr.success('Logged out successfully');
  }
}