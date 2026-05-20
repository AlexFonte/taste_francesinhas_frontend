import {Component, computed, effect, ElementRef, inject, OnInit, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatExpansionModule} from '@angular/material/expansion';
import {ProfileService} from '../../../core/services/profile.service';
import {MyReview} from '../../../core/models/profile.model';
import {MyReviewsPagedResponse} from '../../../core/models/page.model';
import {FrancesinhaType} from '../../../core/models/francesinha.model';
import {FRANCESINHA_TYPE_OPTIONS} from '../../../core/constants/francesinha-types.const';

@Component({
	selector: 'app-my-reviews',
	standalone: true,
	imports: [
		CommonModule,
		RouterLink,
		ReactiveFormsModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatTooltipModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatExpansionModule,
	],
	templateUrl: './my-reviews.component.html',
	styleUrl: './my-reviews.component.scss',
})
export class MyReviewsComponent implements OnInit {

	reviews = signal<MyReview[]>([]);
	isLoading = signal(false);
	paginaActual = signal(0);
	totalPaginas = signal(0);
	hayMas = computed(() => this.paginaActual() < this.totalPaginas() - 1);
	readonly tiposFrancesinhas = FRANCESINHA_TYPE_OPTIONS;
	// IDs de reviews con su detalle (foto + criterios) expandido. Set para toggle O(1).
	expandedIds = signal<Set<number>>(new Set());
	private readonly sentinel = viewChild.required<ElementRef>('sentinel');
	private readonly profileService = inject(ProfileService);
	private readonly fb = inject(FormBuilder);
	filterForm = this.fb.group({
		name: [''],
		city: [''],
		type: [''],
	});

	constructor() {
		effect((onCleanup) => {
			const observer = new IntersectionObserver(([entry]) => {
				if (entry.isIntersecting && this.hayMas() && !this.isLoading()) {
					this.loadMore();
				}
			}, {threshold: 0.1});

			observer.observe(this.sentinel().nativeElement);
			onCleanup(() => observer.disconnect());
		});
	}

	ngOnInit() {
		this.load(0);
	}

	search() {
		this.reviews.set([]);
		this.load(0);
	}

	reset() {
		this.filterForm.reset({name: '', city: '', type: ''});
		this.reviews.set([]);
		this.load(0);
	}

	loadMore() {
		this.load(this.paginaActual() + 1);
	}

	// Toggle del panel expandible. event opcional para que se pueda llamar desde un click en la
	// card; si llega lo paramos para no interferir con clicks anidados (p.ej. "Ver detalle").
	toggleExpanded(id: number, event?: Event): void {
		event?.stopPropagation();
		this.expandedIds.update(ids => {
			const next = new Set(ids);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	private load(pagina: number) {
		this.isLoading.set(true);
		const {name, city, type} = this.filterForm.value;
		this.profileService.getMyReviews(
			{name: name || undefined, city: city || undefined, type: (type as FrancesinhaType) || undefined},
			pagina
		).subscribe({
			next: (res: MyReviewsPagedResponse) => {
				this.reviews.update(prev => pagina === 0 ? res.reviews : [...prev, ...res.reviews]);
				this.paginaActual.set(res.pageNumber);
				this.totalPaginas.set(res.totalPages);
				this.isLoading.set(false);
			},
			error: () => this.isLoading.set(false),
		});
	}
}
