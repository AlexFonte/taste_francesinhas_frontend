import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DirtyOrTouchedErrorStateMatcher } from '../../../shared/error-state-matchers/dirty-or-touched.matcher';
import { ConfirmPasswordStateMatcher } from '../../../shared/error-state-matchers/confirm-password.matcher';
import { passwordMatchValidator } from '../../../shared/validators/password-match.validator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterForm } from './register.types';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {

  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);
  private readonly fb          = inject(NonNullableFormBuilder);

  readonly matcher        = new DirtyOrTouchedErrorStateMatcher();
  readonly confirmMatcher = new ConfirmPasswordStateMatcher();

  isLoading     = signal(false);
  errorMessage  = signal('');
  showPassword  = signal(false);
  showConfirm   = signal(false);

  form: RegisterForm = this.fb.group({
    name:            ['', [Validators.required, Validators.minLength(2)]],
    email:           ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$')]],
    password:        ['', [Validators.required, Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');

    // confirmPassword es solo del form, no del modelo: lo descartamos antes de enviar.
    const { confirmPassword, ...credentials } = this.form.getRawValue();
    this.authService.register(credentials).subscribe({
      next: (res) => this.router.navigate([res.role === 'ADMIN' ? '/admin' : '/francesinhas']),
      error: (err) => {
        this.errorMessage.set(err.error?.detail ?? 'Error al crear la cuenta. Inténtalo de nuevo.');
        this.isLoading.set(false);
      },
    });
  }
}