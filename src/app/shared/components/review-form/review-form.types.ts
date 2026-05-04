import { FormControl, FormGroup } from '@angular/forms';

// Forma de los datos del form de review. La compartimos para que propose, review-dialog
// y admin-validate construyan su FormGroup con el mismo tipo y este componente lo reciba tipado.
export interface ReviewFormValue {
  scoreFlavor:       number;
  scoreSauce:        number;
  scoreBread:        number;
  scorePresentation: number;
  comment:           string;
}

// FormGroup tipado a partir del modelo. Se usa como tipo de la propiedad 'form' en cada
// componente que construye este formulario y como tipo del input() del review-form shared.
export type ReviewForm = FormGroup<{
  scoreFlavor:       FormControl<number>;
  scoreSauce:        FormControl<number>;
  scoreBread:        FormControl<number>;
  scorePresentation: FormControl<number>;
  comment:           FormControl<string>;
}>;