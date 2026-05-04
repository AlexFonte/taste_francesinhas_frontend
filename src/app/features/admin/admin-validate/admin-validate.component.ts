import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Francesinha, FrancesinhaStatus } from '../../../core/models/francesinha.model';
import { Review } from '../../../core/models/review.model';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { ReviewFormComponent } from '../../../shared/components/review-form/review-form.component';
import { ReviewForm } from '../../../shared/components/review-form/review-form.types';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

// Estos dos forms son solo de display (estan siempre disabled), pero los tipamos por consistencia
// con el resto de pantallas y para que patchValue() valide los nombres de campo.
type RestaurantInfoForm = FormGroup<{
  search:  FormControl<string>;
  name:    FormControl<string>;
  city:    FormControl<string>;
  address: FormControl<string>;
  phone:   FormControl<string>;
}>;

type FrancesinhaInfoForm = FormGroup<{
  name:  FormControl<string>;
  type:  FormControl<string>;
  price: FormControl<number | null>;
}>;

@Component({
  selector: 'app-admin-validate',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    ReviewFormComponent,
  ],
  templateUrl: './admin-validate.component.html',
  styleUrl:    './admin-validate.component.scss',
})
export class AdminValidateComponent {

  private readonly fb           = inject(NonNullableFormBuilder);
  private readonly route        = inject(ActivatedRoute);
  private readonly router       = inject(Router);
  private readonly adminService = inject(AdminService);
  private readonly toastService = inject(ToastService);
  private readonly dialog       = inject(MatDialog);

  readonly francesinha  = signal<Francesinha | null>(null);
  readonly review       = signal<Review | null>(null);
  readonly isLoading    = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  //si la francesinha y el restaurante se crearon casi a la vez,
  // asumimos que el restaurante es nuevo (lo creo el usuario al hacer la propuesta).
  readonly isNewRestaurant = computed(() => {
    const f = this.francesinha();
    if (!f) return false;
    const diffMs = Math.abs(new Date(f.createdAt).getTime() - new Date(f.restaurant.createdAt).getTime());
    return diffMs < 60_000;
  });

  // Forms en lectura para que se pinten igual que en la pantalla de proponer.
  // El campo 'search' se usa cuando el restaurante ya existia (modo busqueda),
  // los otros cuando es nuevo (modo formulario completo).
  readonly restaurantForm: RestaurantInfoForm = this.fb.group({
    search:  [{ value: '', disabled: true }],
    name:    [{ value: '', disabled: true }],
    city:    [{ value: '', disabled: true }],
    address: [{ value: '', disabled: true }],
    phone:   [{ value: '', disabled: true }],
  });

  readonly francesinhaForm: FrancesinhaInfoForm = this.fb.group({
    name:  [{ value: '', disabled: true }],
    type:  [{ value: '', disabled: true }],
    price: this.fb.control<number | null>({ value: null, disabled: true }),
  });

  // El review-form recibe este FormGroup; lo pondremos en readOnly desde el template
  readonly reviewForm: ReviewForm = this.fb.group({
    scoreFlavor:       [3],
    scoreSauce:        [3],
    scoreBread:        [3],
    scorePresentation: [3],
    comment:           [''],
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
  }

  private load(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminService.getPendingById(id).subscribe({
      next: f => {
        this.francesinha.set(f);
        this.restaurantForm.patchValue({
          search:  `${f.restaurant.name} · ${f.restaurant.city}`,
          name:    f.restaurant.name,
          city:    f.restaurant.city,
          address: f.restaurant.address ?? '',
          phone:   f.restaurant.phone ?? '',
        });
        this.francesinhaForm.patchValue({
          name:  f.name,
          type:  f.type,
          price: f.price,
        });
        // Las reviews vienen aparte: cogemos la primera (la del usuario)
        this.adminService.getPendingReviews(id, 0, 1).subscribe({
          next: res => {
            const r: Review | undefined = (res.reviews as Review[])[0];
            if (r) {
              this.review.set(r);
              this.reviewForm.patchValue({
                scoreFlavor:       r.scoreFlavor,
                scoreSauce:        r.scoreSauce,
                scoreBread:        r.scoreBread,
                scorePresentation: r.scorePresentation,
                comment:           r.comment,
              });
            }
            this.isLoading.set(false);
          },
          error: _ => { this.isLoading.set(false); /* sin review tambien se puede revisar */ },
        });
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(err.error?.detail ?? 'No se pudo cargar la propuesta');
        this.isLoading.set(false);
      },
    });
  }

  approve(): void {
    const f = this.francesinha();
    if (!f) return;
    this.openConfirm({
      title:        'Aprobar propuesta',
      message:      `¿Quieres aprobar "${f.name}"? Quedará publicada.`,
      confirmLabel: 'Aprobar',
      icon:         'done_all',
      variant:      'primary',
    }).subscribe(ok => { if (ok) this.changeStatus('ACCEPTED'); });
  }

  reject(): void {
    const f = this.francesinha();
    if (!f) return;
    this.openConfirm({
      title:        'Rechazar propuesta',
      message:      `¿Seguro que quieres rechazar "${f.name}"?`,
      confirmLabel: 'Rechazar',
      icon:         'cancel',
      variant:      'danger',
    }).subscribe(ok => { if (ok) this.changeStatus('REJECTED'); });
  }

  back(): void {
    this.router.navigate(['/admin']);
  }

  private openConfirm(data: ConfirmDialogData) {
    return this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent, { data, width: '360px', autoFocus: false }
    ).afterClosed();
  }

  private changeStatus(status: Extract<FrancesinhaStatus, 'ACCEPTED' | 'REJECTED'>): void {
    const f = this.francesinha();
    if (!f) return;
    this.isSubmitting.set(true);
    this.adminService.updateStatus(f.id, status).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toastService.success(status === 'ACCEPTED' ? 'Propuesta aprobada' : 'Propuesta rechazada');
        this.router.navigate(['/admin']);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.toastService.error(err.error?.detail ?? 'No se pudo actualizar la propuesta');
      },
    });
  }
}
