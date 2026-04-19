import { Restaurant } from './restaurant.model';

export type FrancesinhaStatus = 'PENDING' | 'REJECTED' | 'ACCEPTED';
export type FrancesinhaType = 'CLASICA' | 'ESPECIAL' | 'VEGANA' | 'KEBAB' | 'MARISCO';

export interface Francesinha {
  id: number;
  restaurant: Restaurant;
  proposedByEmail: string;
  name: string;
  description?: string;
  price: number;
  hasEgg: boolean;
  hasFries: boolean;
  isSpicy: boolean;
  type: FrancesinhaType;
  status: FrancesinhaStatus;
  totalReviews: number;
  avgScore: number;
  createdAt: string;
}