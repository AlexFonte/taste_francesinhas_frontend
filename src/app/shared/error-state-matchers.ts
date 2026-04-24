import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

// Marca un control como error apenas sea invalido y haya sido tocado o modificado.
// Es lo que usan todos los formularios de la app (login, register, propose...).
export class DirtyOrTouchedErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, _form: FormGroupDirective | NgForm | null): boolean {
    return !!(control?.invalid && (control.dirty || control.touched));
  }
}
