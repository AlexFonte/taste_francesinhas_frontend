import { FormControl, FormGroup } from '@angular/forms';

// El form tiene un campo extra 'confirmPassword' que NO se envia al backend (no esta en
// RegisterRequest), por eso lo definimos explicito en lugar de derivarlo del modelo.
export type RegisterForm = FormGroup<{
  name:            FormControl<string>;
  email:           FormControl<string>;
  password:        FormControl<string>;
  confirmPassword: FormControl<string>;
}>;