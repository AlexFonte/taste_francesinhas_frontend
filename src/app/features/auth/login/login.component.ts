import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DirtyOrTouchedErrorStateMatcher } from '../../../shared/error-state-matchers/dirty-or-touched.matcher';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';
import { LoginForm } from './login.types';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly matcher = new DirtyOrTouchedErrorStateMatcher();

  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  form: LoginForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$')]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');

    const credentials: LoginRequest = this.form.getRawValue();
    this.authService.login(credentials).subscribe({
      next: (res) => this.router.navigate([res.role === 'ADMIN' ? '/admin' : '/francesinhas']),
      error: (err) => {
        this.errorMessage.set(err.error?.detail ?? 'Error al iniciar sesión. Inténtalo de nuevo.');
        this.isLoading.set(false);
      },
    });
  }
}
