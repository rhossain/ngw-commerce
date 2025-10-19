import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthModalService, AuthModalMode } from '../../../core/services/auth-modal.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent implements OnInit, OnDestroy {
  isOpen = false;
  currentMode: AuthModalMode = 'login';
  loginForm: FormGroup;
  registerForm: FormGroup;
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authModalService: AuthModalService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    // Initialize login form
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Initialize register form
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Subscribe to modal state changes
    this.authModalService.isOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isOpen = isOpen;
        if (!isOpen) {
          // Reset forms when modal closes
          this.resetForms();
        }
      });

    this.authModalService.mode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(mode => {
        this.currentMode = mode;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirm_password');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  switchMode(mode: AuthModalMode): void {
    this.authModalService.setMode(mode);
    this.resetForms();
  }

  closeModal(): void {
    this.authModalService.close();
  }

  onSubmitLogin(): void {
    if (this.loginForm.invalid) {
      this.toastr.error('Please fill in all required fields');
      return;
    }

    this.isSubmitting = true;
    
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastr.success('Login successful!');
        this.closeModal();
        // User stays on the current page
      },
      error: (error) => {
        this.isSubmitting = false;
        this.toastr.error('Invalid email or password');
        console.error('Login error:', error);
      }
    });
  }

  onSubmitRegister(): void {
    if (this.registerForm.invalid) {
      this.toastr.error('Please fill in all required fields correctly');
      return;
    }

    this.isSubmitting = true;
    
    const { first_name, last_name, email, password } = this.registerForm.value;
    
    this.authService.register({ first_name, last_name, email, password }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastr.success('Registration successful!');
        this.closeModal();
        // User stays on the current page
      },
      error: (error) => {
        this.isSubmitting = false;
        this.toastr.error(error.error?.message || 'Registration failed. Please try again.');
        console.error('Registration error:', error);
      }
    });
  }

  private resetForms(): void {
    this.loginForm.reset();
    this.registerForm.reset({
      terms: false
    });
    this.isSubmitting = false;
  }

  // Prevent modal close when clicking inside the modal content
  onModalContentClick(event: Event): void {
    event.stopPropagation();
  }
}
