import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './not-found.component.html',
  styleUrl:    './not-found.component.scss',
})
export class NotFoundComponent {

  private readonly location = inject(Location);
  private readonly router   = inject(Router);

  back(): void {
    // Si hay historial volvemos atras; si entraron directamente a una URL invalida
    // (no hay back posible) los mandamos al listado publico de francesinhas.
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/francesinhas']);
    }
  }
}