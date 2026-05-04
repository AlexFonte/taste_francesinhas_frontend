import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DecimalPipe } from '@angular/common';
import { ReviewService } from '../../../../core/services/review.service';
import { ReviewRequest } from '../../../../core/models/review.model';
import { ReviewFormComponent } from '../../../../shared/components/review-form/review-form.component';
import { ReviewForm } from '../../../../shared/components/review-form/review-form.types';
import { ReviewDialogData } from './review-dialog.model';

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DecimalPipe,
    ReviewFormComponent,
  ],
  templateUrl: './review-dialog.component.html',
  styleUrl:    './review-dialog.component.scss',
})
export class ReviewDialogComponent {

  private readonly fb            = inject(NonNullableFormBuilder);
  private readonly dialogRef     = inject(MatDialogRef<ReviewDialogComponent>);
  readonly         data          = inject<ReviewDialogData>(MAT_DIALOG_DATA);
  private readonly reviewService = inject(ReviewService);

  readonly isLoading    = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form: ReviewForm = this.fb.group({
    scoreFlavor:       [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    scoreSauce:        [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    scoreBread:        [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    scorePresentation: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment:           ['', Validators.required],
  });

  submit(): void {
    if (this.isLoading()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    const request: ReviewRequest = this.form.getRawValue();
    this.reviewService.create(this.data.francesinhaId, request).subscribe({
      next: (review) => this.dialogRef.close(review),
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.detail ?? 'No se pudo publicar la valoración');
      },
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}