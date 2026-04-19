import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Francesinha } from '../../../core/models/francesinha.model';

@Component({
  selector: 'app-francesinha-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule],
  templateUrl: './francesinha-card.component.html',
  styleUrl: './francesinha-card.component.scss',
})
export class FrancesinhaCardComponent {
  francesinha = input.required<Francesinha>();
}