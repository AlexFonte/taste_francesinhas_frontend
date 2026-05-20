import {Component, computed, effect, ElementRef, inject, OnInit, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatRippleModule} from '@angular/material/core';
import {AdminService} from '../../../core/services/admin.service';
import {Francesinha, FrancesinhaStatus} from '../../../core/models/francesinha.model';
import {FrancesinhasPagedResponse} from '../../../core/models/page.model';

// El listado de admin solo trabaja con francesinhas ya revisadas: las pendientes
// se gestionan en admin-home con sus botones de aprobar/rechazar.
type RevisedStatus = Extract<FrancesinhaStatus, 'ACCEPTED' | 'REJECTED'>;

interface StatusOption {
	value: RevisedStatus;
	label: string;
	icon: string;
	// Clases Tailwind segun el boton este seleccionado o no.
	activeClass: string;
	inactiveClass: string;
}

@Component({
	selector: 'app-admin-proposals',
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
	templateUrl: './admin-proposals.component.html',
	styleUrl: './admin-proposals.component.scss',
})
export class AdminProposalsComponent implements OnInit {

	readonly statusOptions: StatusOption[] = [
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
	statusFilter = signal<RevisedStatus>('ACCEPTED');
	proposals = signal<Francesinha[]>([]);
	isLoading = signal(false);
	paginaActual = signal(0);
	totalPaginas = signal(0);
	hayMas = computed(() => this.paginaActual() < this.totalPaginas() - 1);
	private readonly sentinel = viewChild.required<ElementRef>('sentinel');
	private readonly adminService = inject(AdminService);
	private readonly route = inject(ActivatedRoute);

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
		// Si venimos de una card del admin-home (?status=ACCEPTED|REJECTED) arrancamos
		// con ese filtro ya seleccionado; si no, por defecto mostramos las aprobadas.
		const status = this.route.snapshot.queryParamMap.get('status');
		if (status === 'ACCEPTED' || status === 'REJECTED') {
			this.statusFilter.set(status);
		}
		this.load(0);
	}

	// Al cambiar el filtro reseteamos la lista y volvemos a la pagina 0.
	onStatusChange(status: RevisedStatus): void {
		if (this.statusFilter() === status) return;
		this.statusFilter.set(status);
		this.proposals.set([]);
		this.load(0);
	}

	loadMore() {
		this.load(this.paginaActual() + 1);
	}

	private load(pagina: number) {
		this.isLoading.set(true);
		this.adminService.getProposals(this.statusFilter(), pagina).subscribe({
			next: (res: FrancesinhasPagedResponse) => {
				this.proposals.update(prev => pagina === 0 ? res.francesinhas : [...prev, ...res.francesinhas]);
				this.paginaActual.set(res.pageNumber);
				this.totalPaginas.set(res.totalPages);
				this.isLoading.set(false);
			},
			error: () => this.isLoading.set(false),
		});
	}
}
