import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validador a nivel de FormGroup que comprueba que los controles 'password' y 'confirmPassword'
// tienen el mismo valor. Devuelve { passwordMismatch: true } en el grupo cuando no coinciden.
// Pensado para forms de registro y de cambio de contraseña.
export const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirm  = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
};