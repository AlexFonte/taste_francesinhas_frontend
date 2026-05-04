import { FormControl, FormGroup } from '@angular/forms';

// Estos dos forms son solo de display (estan siempre disabled), pero los tipamos por consistencia
// con el resto de pantallas y para que patchValue() valide los nombres de campo.
export type RestaurantInfoForm = FormGroup<{
  search:  FormControl<string>;
  name:    FormControl<string>;
  city:    FormControl<string>;
  address: FormControl<string>;
  phone:   FormControl<string>;
}>;

export type FrancesinhaInfoForm = FormGroup<{
  name:  FormControl<string>;
  type:  FormControl<string>;
  price: FormControl<number | null>;
}>;