import { FrancesinhaType } from '../models/francesinha.model';

// Pareja value/label de cada tipo de francesinha. value es el enum del backend,
// label es lo que pinta la UI. Al tipar value con FrancesinhaType el compilador
// nos avisa si en el modelo se anaden o eliminan valores y aqui no se actualizan.
export interface FrancesinhaTypeOption {
  value: FrancesinhaType;
  label: string;
}

export const FRANCESINHA_TYPE_OPTIONS: readonly FrancesinhaTypeOption[] = [
  { value: 'CLASICA',  label: 'Clásica' },
  { value: 'ESPECIAL', label: 'Especial' },
  { value: 'VEGANA',   label: 'Vegana' },
  { value: 'KEBAB',    label: 'Kebab' },
  { value: 'MARISCO',  label: 'Marisco' },
];