import { FormControl, FormGroup } from '@angular/forms';

// FormGroup tipado del review form. Lo comparten propose, review-dialog y admin-validate
// para construir su FormGroup con el mismo tipo y para que review-form.component lo reciba tipado.
export type ReviewForm = FormGroup<{
  scoreFlavor:       FormControl<number>;
  scoreSauce:        FormControl<number>;
  scoreBread:        FormControl<number>;
  scorePresentation: FormControl<number>;
  comment:           FormControl<string>;
}>;