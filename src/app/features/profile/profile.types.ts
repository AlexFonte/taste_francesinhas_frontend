import { FormControl, FormGroup } from '@angular/forms';

// El form tiene un campo extra 'confirmPassword' que NO se envia al backend (no esta en
// ChangePasswordRequest), solo se usa en el front para el passwordMatchValidator.
export type ChangePasswordForm = FormGroup<{
  currentPassword: FormControl<string>;
  newPassword:     FormControl<string>;
  confirmPassword: FormControl<string>;
}>;