import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Restaurant } from '../../../core/models/restaurant.model';
import { Francesinha } from '../../../core/models/francesinha.model';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { FrancesinhaService } from '../../../core/services/francesinha.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { AuthService } from '../../../core/services/auth.service';
import { FrancesinhaCardComponent } from '../../francesinhas/francesinha-card/francesinha-card.component';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FrancesinhaCardComponent,
  ],
  templateUrl: './restaurant-detail.component.html',
  styleUrl:    './restaurant-detail.component.scss',
})
export class RestaurantDetailComponent {

  private readonly route              = inject(ActivatedRoute);
  private readonly router             = inject(Router);
  private readonly location           = inject(Location);
  private readonly restaurantService  = inject(RestaurantService);
  private readonly francesinhaService = inject(FrancesinhaService);
  private readonly favoriteService    = inject(FavoriteService);
  private readonly authService        = inject(AuthService);

  readonly restaurant   = signal<Restaurant | null>(null);
  readonly francesinhas = signal<Francesinha[]>([]);
  readonly favoriteIds  = signal<Set<number>>(new Set());
  readonly isLoading    = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Solo USER ve el boton "Proponer francesinha"
  readonly isUser = computed(() => this.authService.role() === 'USER');

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
  }

  private load(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.restaurantService.getById(id).subscribe({
      next: r => {
        this.restaurant.set(r);
        // Cargamos las francesinhas del restaurante (todas, sin paginar para esta pantalla)
        this.francesinhaService.getAllFrancesinhas({ restaurantId: id }, 0, 100).subscribe({
          next: res => {
            this.francesinhas.set(res.francesinhas as Francesinha[]);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        });
        // Si esta logueado cargamos los favoritos para pintar el corazon en cada card
        if (this.authService.isLoggedIn()) {
          this.favoriteService.getFavoriteIds().subscribe({
            next: ids => this.favoriteIds.set(ids),
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(err.error?.detail ?? 'No se pudo cargar el restaurante');
        this.isLoading.set(false);
      },
    });
  }

  back(): void {
    this.location.back();
  }

  proponer(): void {
    const r = this.restaurant();
    if (!r) return;
    this.router.navigate(['/propose'], { queryParams: { restaurantId: r.id } });
  }
}