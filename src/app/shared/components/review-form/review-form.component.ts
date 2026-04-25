import { Component, computed, effect, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatSliderModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './review-form.component.html',
  styleUrl:    './review-form.component.scss',
})
export class ReviewFormComponent {

  readonly form     = input.required<FormGroup>();
  // Cuando es true, deshabilitamos los controles para mostrar la review
  // del proponente sin que el admin pueda editarla
  readonly readOnly = input<boolean>(false);

  readonly criterios: { label: string; key: string }[] = [
    { label: 'Sabor',        key: 'scoreFlavor' },
    { label: 'Salsa',        key: 'scoreSauce' },
    { label: 'Pan',          key: 'scoreBread' },
    { label: 'Presentación', key: 'scorePresentation' },
  ];

  // Tenemos que reaccionar a valueChanges del form de forma reactiva con signals.
  // El form es un input, asi que nos suscribimos dentro de un effect y limpiamos al cambiar.
  private readonly values = signal<any>({});

  constructor() {
    effect((onCleanup) => {
      const f = this.form();
      // Aplicamos el modo lectura sobre el form que recibimos
      if (this.readOnly()) f.disable({ emitEvent: false });
      else                 f.enable({ emitEvent: false });

      this.values.set(f.value);
      const sub = f.valueChanges.subscribe(v => this.values.set(v));
      onCleanup(() => sub.unsubscribe());
    });
  }

  readonly avgScore = computed(() => {
    const v = this.values();
    const scores = [v.scoreFlavor, v.scoreSauce, v.scoreBread, v.scorePresentation]
      .filter((s: unknown): s is number => typeof s === 'number');
    return scores.length ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
  });
}