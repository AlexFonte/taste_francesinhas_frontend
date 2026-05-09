import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validador a nivel de FormGroup que comprueba que dos controles tienen el mismo valor.
// Por defecto compara 'password' con 'confirmPassword' (form de registro), pero acepta nombres
// custom para reutilizarlo en otros forms (el de cambio de contraseña usa 'newPassword').
export const passwordMatchValidator = (
  passwordKey: string = 'password',
  confirmKey:  string = 'confirmPassword',
): ValidatorFn => (group: AbstractControl): ValidationErrors | null => {
  const password = group.get(passwordKey)?.value;
  const confirm  = group.get(confirmKey)?.value;
  return password === confirm ? null : { passwordMismatch: true };
};