import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, Location, NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { Francesinha } from '../../../core/models/francesinha.model';
import { Review } from '../../../core/models/review.model';
import { FrancesinhaService } from '../../../core/services/francesinha.service';
import { ReviewService } from '../../../core/services/review.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { ReviewDialogComponent } from './review-dialog/review-dialog.component';

@Component({
  selector: 'app-francesinha-detail',
  standalone: true,
  imports: [CommonModule, NgClass, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule],
  templateUrl: './francesinha-detail.component.html',
  styleUrl: './francesinha-detail.component.scss',
})
export class FrancesinhaDetailComponent implements OnInit {

  private readonly route              = inject(ActivatedRoute);
  private readonly router             = inject(Router);
  private readonly location           = inject(Location);
  private readonly dialog             = inject(MatDialog);
  private readonly francesinhaService = inject(FrancesinhaService);
  private readonly reviewService      = inject(ReviewService);
  private readonly favoriteService    = inject(FavoriteService);
  private readonly authService        = inject(AuthService);
  private readonly toastService       = inject(ToastService);

  francesinha = signal<Francesinha | null>(null);
  reviews     = signal<Review[]>([]);
  isFavorite  = signal(false);
  isLoading   = signal(true);

  readonly isUser = computed(() => this.authService.role() === 'USER');

  readonly restaurantInfo = computed(() => {
    const r = this.francesinha()?.restaurant;
    if (!r) return '';
    return [r.name, r.address, r.city].filter(Boolean).join(' · ');
  });

  // Las medias por criterio las calcula el backend en updateScore() y vienen en el response.
  readonly avgFlavor       = computed(() => this.francesinha()?.avgFlavor       ?? 0);
  readonly avgSauce        = computed(() => this.francesinha()?.avgSauce        ?? 0);
  readonly avgBread        = computed(() => this.francesinha()?.avgBread        ?? 0);
  readonly avgPresentation = computed(() => this.francesinha()?.avgPresentation ?? 0);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.francesinhaService.getById(id).subscribe({
      next: f => { this.francesinha.set(f); this.isLoading.set(false); },
      error: () => this.router.navigate(['/francesinhas']),
    });
    this.reviewService.getByFrancesinha(id).subscribe({
      next: res => this.reviews.set(res.reviews as Review[]),
    });
    if (this.isUser()) {
      this.favoriteService.isFavorite(id).subscribe({
        next: v => this.isFavorite.set(v),
      });
    }
  }

  toggleFavorite() {
    const id = this.francesinha()?.id;
    if (!id) return;
    this.favoriteService.toggle(id).subscribe({
      next: res => {
        this.isFavorite.set(res.added);
        this.toastService.success(res.added ? 'Guardado en favoritos' : 'Eliminado de favoritos');
      },
      error: () => this.toastService.error('No se pudo actualizar favoritos'),
    });
  }

  openReviewDialog(): void {
    const f = this.francesinha();
    if (!f) return;
    const dialogRef = this.dialog.open(ReviewDialogComponent, {
      width:      '480px',
      maxWidth:   '95vw',
      panelClass: 'review-dialog',
      data:       { francesinhaId: f.id, francesinhaName: f.name, restaurantName: f.restaurant.name, restaurantCity: f.restaurant.city },
    });
		dialogRef.afterClosed().subscribe((review: Review | undefined) => {
      if (!review) return;
      const id = f.id;
      this.reviewService.getByFrancesinha(id).subscribe({
        next: res => this.reviews.set(res.reviews as Review[]),
      });
      this.francesinhaService.getById(id).subscribe({
        next: updated => this.francesinha.set(updated),
      });
      this.toastService.success('¡Valoración publicada!');
    });
  }

  // Volvemos a la pagina anterior real (puede ser /francesinhas o /restaurants/:id)
  goBack() { this.location.back(); }
}
