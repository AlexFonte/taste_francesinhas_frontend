import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { ToastService } from '../../shared/services/toast.service';
import { DirtyOrTouchedErrorStateMatcher } from '../../shared/error-state-matchers/dirty-or-touched.matcher';
import { ConfirmPasswordStateMatcher } from '../../shared/error-state-matchers/confirm-password.matcher';
import { passwordMatchValidator } from '../../shared/validators/password-match.validator';
import { UserStats } from '../../core/models/profile.model';
import { ChangePasswordForm } from './profile.types';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSlideToggleModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl:    './profile.component.scss',
})
export class ProfileComponent implements OnInit {

  private readonly auth    = inject(AuthService);
  private readonly profile = inject(ProfileService);
  private readonly fb      = inject(NonNullableFormBuilder);
  private readonly toast   = inject(ToastService);

  // Datos del usuario: tirando de los signals que expone AuthService.
  // No hace falta llamar al backend, los datos se obtienen una vez hecho el login
  readonly name    = this.auth.name;
  readonly email   = this.auth.email;
  readonly isAdmin = this.auth.isAdmin;

  readonly matcher        = new DirtyOrTouchedErrorStateMatcher();
  readonly confirmMatcher = new ConfirmPasswordStateMatcher();

  isLoading         = signal(false);
  errorMessage      = signal('');
  showCurrent       = signal(false);
  showNew           = signal(false);
  showConfirm       = signal(false);
  showPasswordForm  = signal(false);

  // null = aun no llegan o ha fallado la llamada, en ese caso se muestra 0 .
  stats = signal<UserStats | null>(null);

  ngOnInit(): void {
    // El admin no tiene reviews ni propuestas: nos ahorramos la llamada.
    if (this.isAdmin()) return;
    this.profile.getStats().subscribe({
      next: (s) => this.stats.set(s),
      error: () => this.stats.set(null),
    });
  }

  // No aplicamos pattern a currentPassword: una contraseña antigua que no cumpla la regla
  // actual sigue siendo valida para autenticarse y bloequear el formulario.
  form: ChangePasswordForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword:     ['', [Validators.required, Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: passwordMatchValidator('newPassword', 'confirmPassword') });

  // Al cerrar el toggle reseteamos el form y limpiamos el mensaje de error
  // para que al reabrirlo no aparezcan datos viejos ni rojos por validacion previa.
  onTogglePasswordForm(checked: boolean): void {
    this.showPasswordForm.set(checked);
    if (!checked) {
      this.form.reset();
      this.errorMessage.set('');
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');

    // confirmPassword es solo del form, no del modelo: lo descartamos antes de enviar.
    const { confirmPassword, ...credentials } = this.form.getRawValue();
    this.auth.changePassword(credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('Contraseña actualizada');
        this.form.reset();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('La contraseña actual no es correcta');
        }else {
          this.errorMessage.set('No se pudo cambiar la contraseña');
        }
      },
    });
  }
}
