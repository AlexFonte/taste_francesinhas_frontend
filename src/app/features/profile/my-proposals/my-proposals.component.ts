import {Component, computed, effect, ElementRef, inject, OnInit, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatRippleModule} from '@angular/material/core';
import {ProfileService} from '../../../core/services/profile.service';
import {FrancesinhaStatus} from '../../../core/models/francesinha.model';
import {MyProposal} from '../../../core/models/profile.model';
import {ProposalsPagedResponse} from '../../../core/models/page.model';

interface StatusOption {
	value: FrancesinhaStatus | null;
	label: string;
	icon: string;
	// Clases Tailwind segun el boton este seleccionado
	activeClass: string;
	inactiveClass: string;
}

@Component({
	selector: 'app-my-proposals',
	standalone: true,
	imports: [
		CommonModule,
		RouterLink,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatTooltipModule,
		MatRippleModule,
	],
	templateUrl: './my-proposals.component.html',
	styleUrl: './my-proposals.component.scss',
})
export class MyProposalsComponent implements OnInit {

	// Filtros disponibles. value=null significa "todas".
	readonly statusOptions: StatusOption[] = [
		{
			value: null, label: 'Todas', icon: 'apps',
			activeClass: 'border-secondary bg-secondary text-white',
			inactiveClass: 'bg-white border-secondary text-secondary hover:bg-secondary hover:text-white',
		},
		{
			value: 'PENDING', label: 'Pendientes', icon: 'schedule',
			activeClass: 'bg-orange-100 text-orange-800 border-orange-300',
			inactiveClass: 'bg-white border-orange-300 text-orange-800 hover:bg-orange-100',
		},
		{
			value: 'ACCEPTED', label: 'Aprobadas', icon: 'check_circle',
			activeClass: 'bg-green-100 text-green-800 border-green-300',
			inactiveClass: 'bg-white border-green-300 text-green-800 hover:bg-green-100',
		},
		{
			value: 'REJECTED', label: 'Rechazadas', icon: 'cancel',
			activeClass: 'bg-red-100 text-red-800 border-red-300',
			inactiveClass: 'bg-white border-red-300 text-red-800 hover:bg-red-100',
		},
	];
	statusFilter = signal<FrancesinhaStatus | null>(null);
	proposals = signal<MyProposal[]>([]);
	isLoading = signal(false);
	paginaActual = signal(0);
	totalPaginas = signal(0);
	hayMas = computed(() => this.paginaActual() < this.totalPaginas() - 1);
	// Usamos Set para que toggle sea O(1)
	expandedIds = signal<Set<number>>(new Set());
	private readonly sentinel = viewChild.required<ElementRef>('sentinel');

	// IDs de propuestas con su panel de review expandido.
	private readonly profileService = inject(ProfileService);

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

	// Al cambiar el filtro, reseteamos la lista y volvemos a la pagina 0.
	onStatusChange(status: FrancesinhaStatus | null): void {
		if (this.statusFilter() === status) return;
		this.statusFilter.set(status);
		this.proposals.set([]);
		this.load(0);
	}

	loadMore() {
		this.load(this.paginaActual() + 1);
	}

	// Toggle del panel expandible. Si el click viene desde dentro de una card-link
	// (caso ACCEPTED), paramos la propagacion para no navegar al detalle al expandir.
	toggleExpanded(id: number, event: MouseEvent): void {
		event.stopPropagation();
		event.preventDefault();
		this.expandedIds.update(ids => {
			const next = new Set(ids);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	private load(pagina: number) {
		this.isLoading.set(true);
		this.profileService.getMyProposals(this.statusFilter(), pagina).subscribe({
			next: (res: ProposalsPagedResponse) => {
				this.proposals.update(prev => pagina === 0 ? res.proposals : [...prev, ...res.proposals]);
				this.paginaActual.set(res.pageNumber);
				this.totalPaginas.set(res.totalPages);
				this.isLoading.set(false);
			},
			error: () => this.isLoading.set(false),
		});
	}
}
