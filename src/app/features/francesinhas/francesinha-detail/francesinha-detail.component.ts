import {Component, computed, ElementRef, inject, OnInit, signal, viewChild} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialog} from '@angular/material/dialog';
import {Francesinha} from '../../../core/models/francesinha.model';
import {Review} from '../../../core/models/review.model';
import {FrancesinhaService} from '../../../core/services/francesinha.service';
import {ReviewService} from '../../../core/services/review.service';
import {FavoriteService} from '../../../core/services/favorite.service';
import {AuthService} from '../../../core/services/auth.service';
import {ToastService} from '../../../shared/services/toast.service';
import {ReviewDialogComponent} from './review-dialog/review-dialog.component';
import {forkJoin} from 'rxjs';

@Component({
	selector: 'app-francesinha-detail',
	standalone: true,
	imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule],
	templateUrl: './francesinha-detail.component.html',
	styleUrl: './francesinha-detail.component.scss',
})
export class FrancesinhaDetailComponent implements OnInit {

	francesinha = signal<Francesinha | null>(null);
	reviews = signal<Review[]>([]);
	isFavorite = signal(false);
	isLoading = signal(true);
	readonly errorMessage = signal<string | null>(null);
	// IDs de opiniones con su detalle por criterio expandido. Set para toggle O(1).
	expandedReviews = signal<Set<number>>(new Set());
	// Referencia al contenedor del carrusel para leer scrollLeft y calcular la foto activa.
	readonly carousel = viewChild<ElementRef<HTMLDivElement>>('carousel');
	readonly activePhotoIndex = signal(0);
	readonly restaurantInfo = computed(() => {
		const r = this.francesinha()?.restaurant;
		if (!r) return '';
		return [r.name, r.address, r.city].filter(Boolean).join(' · ');
	});
	// Las medias por criterio las calcula el backend en updateScore() y vienen en el response.
	readonly avgFlavor = computed(() => this.francesinha()?.avgFlavor ?? 0);
	readonly avgSauce = computed(() => this.francesinha()?.avgSauce ?? 0);
	readonly avgBread = computed(() => this.francesinha()?.avgBread ?? 0);
	readonly avgPresentation = computed(() => this.francesinha()?.avgPresentation ?? 0);
	// independientemente de la paginacion del endpoint de reviews. Orden: la mas reciente primero.
	readonly reviewPhotos = computed(() => this.francesinha()?.photoUrls ?? []);
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);
	private readonly location = inject(Location);
	private readonly dialog = inject(MatDialog);
	private readonly francesinhaService = inject(FrancesinhaService);
	private readonly reviewService = inject(ReviewService);
	private readonly favoriteService = inject(FavoriteService);
	private readonly authService = inject(AuthService);
	readonly isUser = computed(() => this.authService.role() === 'USER');

	// Fotos para el carrusel: TODAS las URLs vienen ya resueltas en el detalle (photoUrls del backend),
	private readonly toastService = inject(ToastService);

	ngOnInit() {
		const id = Number(this.route.snapshot.paramMap.get('id'));
		if (Number.isNaN(id)) {
			this.router.navigate(['/francesinhas']);
			return;
		}
		this.francesinhaService.getById(id).subscribe({
			next: f => {
				this.francesinha.set(f);
				this.isLoading.set(false);
			},
			error: (err: HttpErrorResponse) => {
				this.errorMessage.set(err.error?.detail ?? 'No se pudo cargar la francesinha');
				this.isLoading.set(false);
			},
		});
		this.reviewService.getByFrancesinha(id).subscribe({
			next: res => this.reviews.set(res.reviews),
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
			width: '480px',
			maxWidth: '95vw',
			maxHeight: '90vh',
			panelClass: 'review-dialog',
			data: {
				francesinhaId: f.id,
				francesinhaName: f.name,
				restaurantName: f.restaurant.name,
				restaurantCity: f.restaurant.city
			},
		});
		dialogRef.afterClosed().subscribe((review: Review | undefined) => {
			if (!review) return;
			// La review ya se publico (el dialogo devolvio la review): confirmamos al usuario.
			this.toastService.success('¡Valoración publicada!');

			// Recargamos lista + cabecera juntas: forkJoin espera a las dos y actualiza
			// los dos signals en el mismo next -> la pantalla nunca queda mitad-vieja mitad-nueva.
			const id = f.id;
			forkJoin({
				francesinha: this.francesinhaService.getById(id),
				reviewsPage: this.reviewService.getByFrancesinha(id),
			}).subscribe({
				next: ({francesinha, reviewsPage}) => {
					this.francesinha.set(francesinha);
					this.reviews.set(reviewsPage.reviews);
				},
				error: () => this.toastService.error('No se pudo refrescar la valoración'),
			});
		});
	}

	// Toggle del panel de detalle por criterio de una opinion.
	toggleReview(id: number): void {
		this.expandedReviews.update(ids => {
			const next = new Set(ids);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	// Handler de scroll del carrusel: redondeamos scrollLeft/clientWidth para saber que foto se ve.
	onCarouselScroll(): void {
		const el = this.carousel()?.nativeElement;
		if (!el) return;
		const idx = Math.round(el.scrollLeft / el.clientWidth);
		if (idx !== this.activePhotoIndex()) {
			this.activePhotoIndex.set(idx);
		}
	}

	// Salta a la foto i con scroll suave (tap en los puntitos del carrusel).
	scrollToPhoto(i: number): void {
		const el = this.carousel()?.nativeElement;
		if (!el) return;
		el.scrollTo({left: i * el.clientWidth, behavior: 'smooth'});
	}

	// Volvemos a la pagina anterior real (puede ser /francesinhas o /restaurants/:id)
	goBack() {
		this.location.back();
	}
}
