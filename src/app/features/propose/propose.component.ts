import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, Validators, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { DirtyOrTouchedErrorStateMatcher } from '../../shared/error-state-matchers';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, switchMap, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { FrancesinhaType } from '../../core/models/francesinha.model';
import { Restaurant } from '../../core/models/restaurant.model';
import { FrancesinhaService, FrancesinhaProposeRequest } from '../../core/services/francesinha.service';
import { RestaurantService, RestaurantRequest } from '../../core/services/restaurant.service';
import { ReviewService, ReviewRequest } from '../../core/services/review.service';
import { ToastService } from '../../shared/toast/toast.service';
import { ReviewFormComponent } from '../../shared/components/review-form/review-form.component';
import { ReviewForm } from '../../shared/components/review-form/review-form.types';

// Sub-form de "restaurante existente": el id puede ser null mientras el usuario no selecciona uno,
// asi que NO usamos NonNullable para ese control. 'search' es solo para el autocomplete.
type ExistingRestaurantForm = FormGroup<{
  search:       FormControl<string>;
  restaurantId: FormControl<number | null>;
}>;

// Sub-form de "restaurante nuevo": todos los campos son string (address y phone son opcionales en el
// payload pero en el form siempre son string, nunca null).
type NewRestaurantForm = FormGroup<{
  name:    FormControl<string>;
  city:    FormControl<string>;
  address: FormControl<string>;
  phone:   FormControl<string>;
}>;

// Sub-form de la francesinha. price puede ser null hasta que el usuario lo introduce.
type FrancesinhaForm = FormGroup<{
  name:        FormControl<string>;
  description: FormControl<string>;
  type:        FormControl<FrancesinhaType>;
  price:       FormControl<number | null>;
  hasFries:    FormControl<boolean>;
  hasEgg:      FormControl<boolean>;
  isSpicy:     FormControl<boolean>;
}>;

@Component({
  selector: 'app-propose',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    ReviewFormComponent,
  ],
  templateUrl: './propose.component.html',
  styleUrl:    './propose.component.scss',
})
export class ProposeComponent {

  private readonly fb                 = inject(NonNullableFormBuilder);
  private readonly router             = inject(Router);
  private readonly route              = inject(ActivatedRoute);
  private readonly location           = inject(Location);
  private readonly restaurantService  = inject(RestaurantService);
  private readonly francesinhaService = inject(FrancesinhaService);
  private readonly reviewService      = inject(ReviewService);
  private readonly toastService       = inject(ToastService);

  readonly isLoading    = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly matcher      = new DirtyOrTouchedErrorStateMatcher();

  readonly types: FrancesinhaType[] = ['CLASICA', 'ESPECIAL', 'VEGANA', 'KEBAB', 'MARISCO'];

  // Toggle: false = restaurante existente, true = nuevo restaurante
  readonly newRestaurantMode = signal(false);
  // Cuando vienen con ?restaurantId=X bloqueamos el panel de restaurante para que no
  // se pueda cambiar la seleccion ni alternar al modo 'Nuevo restaurante'.
  readonly restaurantLocked = signal(false);

  // Sub-form para restaurante existente: solo el id + texto de busqueda.
  // restaurantId es FormControl<number | null> porque arranca null y se rellena al seleccionar.
  readonly existingRestaurantForm: ExistingRestaurantForm = this.fb.group({
    search:       [''],
    restaurantId: this.fb.control<number | null>(null, [Validators.required]),
  });

  // Sub-form para restaurante nuevo: todos los datos
  readonly newRestaurantForm: NewRestaurantForm = this.fb.group({
    name:    ['', [Validators.required, Validators.maxLength(100)]],
    city:    ['', [Validators.required, Validators.maxLength(100)]],
    address: ['', [Validators.maxLength(200)]],
    phone:   ['', [Validators.maxLength(30)]],
  });

  // price arranca null hasta que el usuario introduce un valor; el resto son NonNullable.
  readonly francesinhaForm: FrancesinhaForm = this.fb.group({
    name:        ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    type:        this.fb.control<FrancesinhaType>('CLASICA', [Validators.required]),
    price:       this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    hasFries:    [false],
    hasEgg:      [false],
    isSpicy:     [false],
  });

  readonly reviewForm: ReviewForm = this.fb.group({
    scoreFlavor:       [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    scoreSauce:        [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    scoreBread:        [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    scorePresentation: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment:           ['', [Validators.required]],
  });

  // Autocomplete de restaurantes existentes
  readonly restaurantOptions = signal<Restaurant[]>([]);

  constructor() {
    // Activa/desactiva el sub-form segun el toggle.
    // NO usamos { emitEvent: false } porque necesitamos que statusChanges emita
    // para que los toSignal de 'existingStatus'/'newStatus' reflejen el cambio.
    // Si el restaurante esta bloqueado (vienen con ?restauranId=X) no tocamos los forms.
    effect(() => {
      if (this.restaurantLocked()) return;
      if (this.newRestaurantMode()) {
        this.existingRestaurantForm.disable();
        this.newRestaurantForm.enable();
      } else {
        this.newRestaurantForm.disable();
        this.existingRestaurantForm.enable();
      }
    });

    // Busqueda reactiva de restaurantes existentes
    this.existingRestaurantForm.controls.search.valueChanges
      .pipe(
        debounceTime(250),
        switchMap(term => this.restaurantService.getAll({ name: term ?? '' }, 0, 10)),
      )
      .subscribe(res => this.restaurantOptions.set(res.restaurants as Restaurant[]));

    // Si vienen con ?restaurantId=X (desde el listado de restaurantes), precargamos
    // el restaurante en el modo 'existente' y bloqueamos el panel para que no se pueda
    // cambiar la seleccion ni alternar al modo 'Nuevo restaurante'.
    const idParam = this.route.snapshot.queryParamMap.get('restaurantId');
    if (idParam) {
      const id = Number(idParam);
      this.restaurantService.getById(id).subscribe({
        next: r => {
          this.newRestaurantMode.set(false);
          this.existingRestaurantForm.controls.search.setValue(this.displayRestaurant(r), { emitEvent: false });
          this.existingRestaurantForm.controls.restaurantId.setValue(r.id);
          this.newRestaurantForm.disable();
          this.existingRestaurantForm.disable();
          this.restaurantLocked.set(true);
        },
      });
    }
  }

  selectRestaurant(r: Restaurant): void {
    // Solo actualizamos restaurantId. El control 'search' lo gestiona mat-autocomplete
    // con displayWith, asi no disparamos una nueva busqueda.
    this.existingRestaurantForm.controls.restaurantId.setValue(r.id);
  }

  displayRestaurant = (r: Restaurant | string | null): string => {
    if (!r) return '';
    if (typeof r === 'string') return r;
    return `${r.name} · ${r.city}`;
  };

  // Convertimos statusChanges a signals para que isFormValid reaccione cuando
  // cambia la validacion de cualquier form, no solo cuando cambia el toggle.
  private readonly existingStatus = toSignal(
    this.existingRestaurantForm.statusChanges.pipe(startWith(this.existingRestaurantForm.status)),
    { initialValue: this.existingRestaurantForm.status },
  );
  private readonly newStatus = toSignal(
    this.newRestaurantForm.statusChanges.pipe(startWith(this.newRestaurantForm.status)),
    { initialValue: this.newRestaurantForm.status },
  );
  private readonly francesinhaStatus = toSignal(
    this.francesinhaForm.statusChanges.pipe(startWith(this.francesinhaForm.status)),
    { initialValue: this.francesinhaForm.status },
  );
  private readonly reviewStatus = toSignal(
    this.reviewForm.statusChanges.pipe(startWith(this.reviewForm.status)),
    { initialValue: this.reviewForm.status },
  );

  readonly isFormValid = computed(() => {
    // Si viene bloqueado por ?restaurantId=X el form esta deshabilitado (status DISABLED),
    // pero el restaurantId ya esta seleccionado por construccion -> lo damos por valido.
    const restaurantOk = this.restaurantLocked()
      ? this.existingRestaurantForm.controls.restaurantId.value != null
      : this.newRestaurantMode()
        ? this.newStatus() === 'VALID'
        : this.existingStatus() === 'VALID';
    return restaurantOk
      && this.francesinhaStatus() === 'VALID'
      && this.reviewStatus() === 'VALID';
  });

  private markAllTouched(): void {
    this.francesinhaForm.markAllAsTouched();
    this.reviewForm.markAllAsTouched();
    if (this.newRestaurantMode()) this.newRestaurantForm.markAllAsTouched();
    else                          this.existingRestaurantForm.markAllAsTouched();
  }

  submit(): void {
    if (this.isLoading()) return;
    if (!this.isFormValid()) {
      this.markAllTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);

    if (this.newRestaurantMode()) {
      this.submitWithNewRestaurant();
    } else {
      // Aqui ya hemos validado isFormValid() antes, asi que restaurantId no es null.
      const restaurantId = this.existingRestaurantForm.controls.restaurantId.value;
      if (restaurantId == null) return;
      this.submitWithExistingRestaurant(restaurantId);
    }
  }

  private submitWithNewRestaurant(): void {
    const r = this.newRestaurantForm.getRawValue();
    const payload: RestaurantRequest = {
      name:    r.name,
      city:    r.city,
      address: r.address || undefined,
      phone:   r.phone   || undefined,
    };
    this.restaurantService.create(payload).subscribe({
      next:  created => this.submitWithExistingRestaurant(created.id),
      error: err     => this.handleError(err, 'No se pudo crear el restaurante'),
    });
  }

  private submitWithExistingRestaurant(restaurantId: number): void {
    const f = this.francesinhaForm.getRawValue();
    // price ya es != null porque isFormValid() exigio Validators.required.
    if (f.price == null) return;
    const payload: FrancesinhaProposeRequest = {
      restaurantId,
      name:        f.name,
      description: f.description || undefined,
      price:       f.price,
      hasEgg:      f.hasEgg,
      hasFries:    f.hasFries,
      isSpicy:     f.isSpicy,
      type:        f.type,
    };
    this.francesinhaService.propose(payload).subscribe({
      next:  created => this.submitReview(created.id),
      error: err     => this.handleError(err, 'No se pudo proponer la francesinha'),
    });
  }

  private submitReview(francesinhaId: number): void {
    const payload: ReviewRequest = {
      ...this.reviewForm.getRawValue(),
      propuesta: true,
    };
    this.reviewService.create(francesinhaId, payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toastService.success('¡Propuesta enviada! Pendiente de aprobación.');
        this.router.navigate(['/francesinhas']);
      },
      error: err => this.handleError(err, 'La propuesta se creó pero no se pudo publicar tu valoración'),
    });
  }

  private handleError(err: HttpErrorResponse, fallback: string): void {
    this.isLoading.set(false);
    this.errorMessage.set(err.error?.detail ?? fallback);
  }

  // El boton "Volver" usa Location.back() para regresar a la pagina previa
  cancel(): void {
    this.location.back();
  }

  // Redondeamos a 2 decimales cuando pierde foco.
  formatPrice(): void {
    const v = this.francesinhaForm.controls.price.value;
    if (v == null || isNaN(v)) return;
    this.francesinhaForm.controls.price.setValue(Number(v.toFixed(2)), { emitEvent: false });
  }
}
