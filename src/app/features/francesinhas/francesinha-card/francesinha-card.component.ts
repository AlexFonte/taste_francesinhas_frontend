import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Francesinha } from '../../../core/models/francesinha.model';

@Component({
  selector: 'app-francesinha-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './francesinha-card.component.html',
})
export class FrancesinhaCardComponent {
  francesinha = input.required<Francesinha>();
}