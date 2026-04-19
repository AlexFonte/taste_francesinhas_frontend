import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { FrancesinhaService } from '../../core/services/francesinha.service';
import { Francesinha, FrancesinhaType } from '../../core/models/francesinha.model';
import { FrancesinhaCardComponent } from './francesinha-card/francesinha-card.component';
import { FrancesinhasPagedResponse } from '../../core/models/page.model';

@Component({
  selector: 'app-francesinhas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatExpansionModule,
    FrancesinhaCardComponent,
  ],
  templateUrl: './francesinhas.component.html',
  styleUrl: './francesinhas.component.scss',
})
export class FrancesinhasComponent implements OnInit {

  private readonly francesinhaService = inject(FrancesinhaService);
  private readonly fb = inject(FormBuilder);

  francesinhasList = signal<Francesinha[]>([]);
  isLoading = signal(false);
  paginaActual = signal(0);
  totalPaginas = signal(0);
  hayMas = computed(() => this.paginaActual() < this.totalPaginas() - 1);

  tipos = [
    { value: 'CLASICA',  label: 'Clásica' },
    { value: 'ESPECIAL', label: 'Especial' },
    { value: 'VEGANA',   label: 'Vegana' },
    { value: 'KEBAB',    label: 'Kebab' },
    { value: 'MARISCO',  label: 'Marisco' },
  ];

  filterForm = this.fb.group({
    name: [''],
    city: [''],
    type: [''],
  });

  ngOnInit() {
    this.load(0);
  }

  search() {
    this.francesinhasList.set([]);
    this.load(0);
  }

  reset() {
    this.filterForm.reset({ name: '', city: '', type: '' });
    this.francesinhasList.set([]);
    this.load(0);
  }

  loadMore() {
    this.load(this.paginaActual() + 1);
  }

  private load(pagina: number) {
    this.isLoading.set(true);
    const { name, city, type } = this.filterForm.value;
    this.francesinhaService.getAllFrancesinhas(
      { name: name || undefined, city: city || undefined, type: (type as FrancesinhaType) || undefined },
      pagina
    ).subscribe({
      next: (res: FrancesinhasPagedResponse) => {
        const items = res.francesinhas as Francesinha[];
        this.francesinhasList.update(prev => pagina === 0 ? items : [...prev, ...items]);
        this.paginaActual.set(res.pageNumber);
        this.totalPaginas.set(res.totalPages);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
