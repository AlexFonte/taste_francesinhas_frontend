import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

// Matcher para el campo 'confirmPassword': muestra el error tanto si el control tiene
// errores propios (required, minLength) como si el FormGroup padre marca 'passwordMismatch'.
// Usar junto a passwordMatchValidator en el FormGroup.
export class ConfirmPasswordStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const hasOwnError = !!(control?.invalid && (control.dirty || control.touched));
    const hasMismatch = !!(form?.hasError('passwordMismatch') && (control?.dirty || control?.touched));
    return hasOwnError || hasMismatch;
  }
}