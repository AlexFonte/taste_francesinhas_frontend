import {Component, inject, signal} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {DecimalPipe} from '@angular/common';
import {ReviewService} from '../../../../core/services/review.service';
import {ReviewRequest} from '../../../../core/models/review.model';
import {ReviewFormComponent} from '../../../../shared/components/review-form/review-form.component';
import {ReviewForm} from '../../../../shared/components/review-form/review-form.types';
import {PhotoUploaderComponent} from '../../../../shared/components/photo-uploader/photo-uploader.component';
import {ReviewDialogData} from './review-dialog.model';

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
		PhotoUploaderComponent,
	],
	templateUrl: './review-dialog.component.html',
	styleUrl: './review-dialog.component.scss',
})
export class ReviewDialogComponent {

	readonly data = inject<ReviewDialogData>(MAT_DIALOG_DATA);
	readonly isLoading = signal(false);
	readonly errorMessage = signal<string | null>(null);
	// Foto opcional. El uploader emite null si el usuario la quita o no la selecciona.
	readonly photo = signal<File | null>(null);
	private readonly fb = inject(NonNullableFormBuilder);
	readonly form: ReviewForm = this.fb.group({
		scoreFlavor: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
		scoreSauce: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
		scoreBread: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
		scorePresentation: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
		comment: ['', Validators.required],
	});
	private readonly dialogRef = inject(MatDialogRef<ReviewDialogComponent>);
	private readonly reviewService = inject(ReviewService);

	onPhotoSelected(file: File | null): void {
		this.photo.set(file);
	}

	submit(): void {
		if (this.isLoading()) return;
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}
		this.isLoading.set(true);
		//  bloqueamos minetras se hace el post
		this.dialogRef.disableClose = true;
		const request: ReviewRequest = this.form.getRawValue();
		this.reviewService.create(this.data.francesinhaId, request, this.photo()).subscribe({
			next: (review) => this.dialogRef.close(review),
			error: (err: HttpErrorResponse) => {
				this.isLoading.set(false);
				this.dialogRef.disableClose = false;
				this.errorMessage.set(err.error?.detail ?? 'No se pudo publicar la valoración');
			},
		});
	}

	cancel(): void {
		// Guard por si se invoca mientras se envia: no se puede cancelar a medias.
		if (this.isLoading()) return;
		this.dialogRef.close();
	}
}
