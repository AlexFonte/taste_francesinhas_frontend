import { Francesinha } from './francesinha.model';

export interface Favorite {
  id: number;
  userId: number;
  francesinhaId: number;
  francesinha?: Francesinha;
  createdAt: string;
}