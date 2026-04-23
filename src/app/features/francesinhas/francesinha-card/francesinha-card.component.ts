import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Francesinha } from '../../../core/models/francesinha.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-francesinha-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule],
  templateUrl: './francesinha-card.component.html',
  styleUrl: './francesinha-card.component.scss',
})
export class FrancesinhaCardComponent {
  francesinha = input.required<Francesinha>();
  readonly isLoggedIn = inject(AuthService).isLoggedIn;
}