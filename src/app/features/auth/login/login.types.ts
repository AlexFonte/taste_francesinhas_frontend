import { FormControl, FormGroup } from '@angular/forms';

// FormGroup tipado a partir de LoginRequest. Asi getRawValue() devuelve { email: string; password: string }
// sin null y nos ahorramos los non-null asserts al pasarlo al servicio.
export type LoginForm = FormGroup<{
  email:    FormControl<string>;
  password: FormControl<string>;
}>;