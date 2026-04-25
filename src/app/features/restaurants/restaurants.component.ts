import { Component, inject, signal, computed, OnInit, effect, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { RestaurantService } from '../../core/services/restaurant.service';
import { AuthService } from '../../core/services/auth.service';
import { Restaurant } from '../../core/models/restaurant.model';
import { RestaurantsPagedResponse } from '../../core/models/page.model';

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
  ],
  templateUrl: './restaurants.component.html',
  styleUrl:    './restaurants.component.scss',
})
export class RestaurantsComponent implements OnInit {

  private readonly sentinel          = viewChild.required<ElementRef>('sentinel');
  private readonly restaurantService = inject(RestaurantService);
  private readonly authService       = inject(AuthService);
  private readonly fb                = inject(FormBuilder);
  private readonly router            = inject(Router);

  readonly restaurants = signal<Restaurant[]>([]);
  readonly isLoading   = signal(false);
  readonly paginaActual = signal(0);
  readonly totalPaginas = signal(0);
  readonly hayMas = computed(() => this.paginaActual() < this.totalPaginas() - 1);

  // Solo el USER ve el boton "Proponer francesinha" en cada card
  readonly isUser = computed(() => this.authService.role() === 'USER');

  filterForm = this.fb.group({
    name: [''],
    city: [''],
  });

  constructor() {
    effect((onCleanup) => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && this.hayMas() && !this.isLoading()) {
          this.loadMore();
        }
      }, { threshold: 0.1 });

      observer.observe(this.sentinel().nativeElement);
      onCleanup(() => observer.disconnect());
    });
  }

  ngOnInit(): void {
    this.load(0);
  }

  search(): void {
    this.restaurants.set([]);
    this.load(0);
  }

  reset(): void {
    this.filterForm.reset({ name: '', city: '' });
    this.restaurants.set([]);
    this.load(0);
  }

  loadMore(): void {
    this.load(this.paginaActual() + 1);
  }

  // Lleva al usuario a /propose con el restaurante preseleccionado via query param.
  proponer(r: Restaurant): void {
    this.router.navigate(['/propose'], { queryParams: { restaurantId: r.id } });
  }

  openDetail(id: number): void {
    this.router.navigate(['/restaurants', id]);
  }

  private load(pagina: number): void {
    this.isLoading.set(true);
    const { name, city } = this.filterForm.value;
    this.restaurantService.getAll(
      { name: name || undefined, city: city || undefined },
      pagina
    ).subscribe({
      next: (res: RestaurantsPagedResponse) => {
        const items = res.restaurants as Restaurant[];
        this.restaurants.update(prev => pagina === 0 ? items : [...prev, ...items]);
        this.paginaActual.set(res.pageNumber);
        this.totalPaginas.set(res.totalPages);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}