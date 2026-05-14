import { Component, inject, signal, computed, OnInit, effect, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProfileService } from '../../../core/services/profile.service';
import { MyReview } from '../../../core/models/profile.model';
import { MyReviewsPagedResponse } from '../../../core/models/page.model';

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './my-reviews.component.html',
  styleUrl: './my-reviews.component.scss',
})
export class MyReviewsComponent implements OnInit {

  private readonly sentinel       = viewChild.required<ElementRef>('sentinel');
  private readonly profileService = inject(ProfileService);

  reviews      = signal<MyReview[]>([]);
  isLoading    = signal(false);
  paginaActual = signal(0);
  totalPaginas = signal(0);
  hayMas       = computed(() => this.paginaActual() < this.totalPaginas() - 1);

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

  loadMore() {
    this.load(this.paginaActual() + 1);
  }

  private load(pagina: number) {
    this.isLoading.set(true);
    this.profileService.getMyReviews(pagina).subscribe({
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