import { FormControl, FormGroup } from '@angular/forms';
import { FrancesinhaType } from '../../core/models/francesinha.model';

// Sub-form de "restaurante existente": el id puede ser null mientras el usuario no selecciona uno,
// asi que NO usamos NonNullable para ese control. 'search' es solo para el autocomplete.
export type ExistingRestaurantForm = FormGroup<{
  search:       FormControl<string>;
  restaurantId: FormControl<number | null>;
}>;

// Sub-form de "restaurante nuevo": todos los campos son string (address y phone son opcionales en el
// payload pero en el form siempre son string, nunca null).
export type NewRestaurantForm = FormGroup<{
  name:    FormControl<string>;
  city:    FormControl<string>;
  address: FormControl<string>;
  phone:   FormControl<string>;
}>;

// Sub-form de la francesinha. price puede ser null hasta que el usuario lo introduce.
export type FrancesinhaForm = FormGroup<{
  name:        FormControl<string>;
  description: FormControl<string>;
  type:        FormControl<FrancesinhaType>;
  price:       FormControl<number | null>;
  hasFries:    FormControl<boolean>;
  hasEgg:      FormControl<boolean>;
  isSpicy:     FormControl<boolean>;
}>;