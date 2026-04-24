import { Component, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReviewService, ReviewRequest } from '../../../../core/services/review.service';

export interface ReviewDialogData {
  francesinhaId:    number;
  francesinhaName:  string;
  restaurantName:   string;
  restaurantCity:   string;
}

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatSliderModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DecimalPipe,
  ],
  templateUrl: './review-dialog.component.html',
  styleUrl:    './review-dialog.component.scss',
})
export class ReviewDialogComponent {

  private readonly fb            = inject(FormBuilder);
  private readonly dialogRef     = inject(MatDialogRef<ReviewDialogComponent>);
  readonly         data          = inject<ReviewDialogData>(MAT_DIALOG_DATA);
  private readonly reviewService = inject(ReviewService);

  readonly isLoading = signal(false);

  readonly form = this.fb.group({
    scoreFlavor:       [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    scoreSauce:        [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    scoreBread:        [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    scorePresentation: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment:           [''],
  });

  readonly criterios: { label: string; key: string }[] = [
    { label: 'Sabor',        key: 'scoreFlavor' },
    { label: 'Salsa',        key: 'scoreSauce' },
    { label: 'Pan',          key: 'scoreBread' },
    { label: 'Presentación', key: 'scorePresentation' },
  ];

  private readonly formValues = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  readonly avgScore = computed(() => {
    const v = this.formValues();
    const scores = [v.scoreFlavor, v.scoreSauce, v.scoreBread, v.scorePresentation]
      .filter((s): s is number => s != null);
    return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  });

  submit(): void {
    if (this.form.invalid || this.isLoading()) return;
    this.isLoading.set(true);
    const v = this.form.getRawValue();
    const request: ReviewRequest = {
      scoreFlavor:       v.scoreFlavor!,
      scoreSauce:        v.scoreSauce!,
      scoreBread:        v.scoreBread!,
      scorePresentation: v.scorePresentation!,
      comment:           v.comment ?? '',
    };
    this.reviewService.create(this.data.francesinhaId, request).subscribe({
      next:  (review) => this.dialogRef.close(review),
      error: ()       => this.isLoading.set(false),
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}