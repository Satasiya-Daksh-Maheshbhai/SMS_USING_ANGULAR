import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  loginMode: 'admin' | 'student' = 'student';
  errorMessage = '';

  readonly adminForm = this.fb.group({
    username: ['admin', [Validators.required]],
    password: ['admin123', [Validators.required]]
  });

  readonly studentForm = this.fb.group({
    email: ['aarav@student.com', [Validators.required, Validators.email]],
    password: ['stud123', [Validators.required]]
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  setMode(mode: 'admin' | 'student'): void {
    this.loginMode = mode;
    this.errorMessage = '';
  }

  submitAdmin(): void {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.adminForm.getRawValue();
    const success = this.authService.loginAsAdmin(username ?? '', password ?? '');

    if (!success) {
      this.errorMessage = 'Invalid admin credentials.';
      return;
    }

    this.router.navigate(['/admin']);
  }

  submitStudent(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.studentForm.getRawValue();
    const success = this.authService.loginAsStudent(email ?? '', password ?? '');

    if (!success) {
      this.errorMessage = 'Invalid student email or password.';
      return;
    }

    this.router.navigate(['/student']);
  }
}


