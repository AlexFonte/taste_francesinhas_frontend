import { Component, inject, signal, computed, OnInit, effect, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { FavoriteService } from '../../core/services/favorite.service';
import { ToastService } from '../../shared/services/toast.service';
import { Francesinha, FrancesinhaType } from '../../core/models/francesinha.model';
import { FrancesinhaCardComponent } from '../../shared/components/francesinha-card/francesinha-card.component';
import { FavoritesPagedResponse } from '../../core/models/page.model';
import { FRANCESINHA_TYPE_OPTIONS } from '../../core/constants/francesinha-types.const';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatExpansionModule,
    FrancesinhaCardComponent,
  ],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent implements OnInit {

  private readonly sentinel = viewChild.required<ElementRef>('sentinel');
  private readonly favoriteService = inject(FavoriteService);
  private readonly toast           = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  francesinhas = signal<Francesinha[]>([]);
  isLoading    = signal(false);
  paginaActual = signal(0);
  totalPaginas = signal(0);
  hayMas       = computed(() => this.paginaActual() < this.totalPaginas() - 1);

  readonly tiposFrancesinhas = FRANCESINHA_TYPE_OPTIONS;

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
      }, { threshold: 0.1 });

      observer.observe(this.sentinel().nativeElement);
      onCleanup(() => observer.disconnect());
    });
  }

  ngOnInit() {
    this.load(0);
  }

  search() {
    this.francesinhas.set([]);
    this.load(0);
  }

  reset() {
    this.filterForm.reset({ name: '', city: '', type: '' });
    this.francesinhas.set([]);
    this.load(0);
  }

  loadMore() {
    this.load(this.paginaActual() + 1);
  }

  // Toggle optimista: quitamos la card de la lista al momento. Si el backend falla, la
  // restauramos en su sitio. Asi la UI se siente instantanea sin esperar a la red.
  onRemove(francesinhaId: number): void {
    const previo = this.francesinhas();
    const indice = previo.findIndex(f => f.id === francesinhaId);
    if (indice === -1) return;

    const removida = previo[indice];
    this.francesinhas.update(list => list.filter(f => f.id !== francesinhaId));

    this.favoriteService.toggle(francesinhaId).subscribe({
      next: () => this.toast.success('Eliminado de favoritos'),
      error: () => {
        this.francesinhas.update(list => {
          const restaurada = [...list];
          restaurada.splice(indice, 0, removida);
          return restaurada;
        });
        this.toast.error('No se pudo eliminar de favoritos');
      },
    });
  }

  private load(pagina: number) {
    this.isLoading.set(true);
    const { name, city, type } = this.filterForm.value;
    this.favoriteService.getFavorites(
      { name: name || undefined, city: city || undefined, type: (type as FrancesinhaType) || undefined },
      pagina
    ).subscribe({
      next: (res: FavoritesPagedResponse) => {
        // El backend devuelve favoritos con la francesinha poblada gracias al @EntityGraph;
        // aqui extraemos solo la francesinha porque la pantalla pinta una FrancesinhaCard.
        const items = res.favorites.map(fav => fav.francesinha);
        this.francesinhas.update(prev => pagina === 0 ? items : [...prev, ...items]);
        this.paginaActual.set(res.pageNumber);
        this.totalPaginas.set(res.totalPages);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
