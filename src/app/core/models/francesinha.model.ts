import {Restaurant} from './restaurant.model';
import {Review} from './review.model';

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
  avgFlavor: number;
  avgSauce: number;
  avgBread: number;
  avgPresentation: number;
  // Foto de portada para la card del listado. Es la foto de la review mas reciente con foto;
  // null si ninguna review tiene foto.
  coverPhotoUrl?: string;
  // TODAS las URLs de fotos de las reviews, ordenadas por fecha DESC. Solo viene en el detalle
  // (GET /francesinhas/{id}); en los listados es undefined. Alimenta el carrusel del detalle
  // sin depender de la paginacion del endpoint de reviews.
  photoUrls?: string[];
  createdAt: string;
}

// Detalle de una francesinha pendiente para la pantalla de validaicion del admin:
// la francesinha y la review que que se hicienron en la propuesta, toda la info en una sola DTO.
// review puede ser null, en el caso que pase algo raro, pero por defecto siempre deberia llegar != null
export interface PendingFrancesinha {
	francesinha: Francesinha;
	review: Review | null;
}

export interface FrancesinhaProposeRequest {
  restaurantId: number;
  name:         string;
  description?: string;
  price:        number;
  hasEgg:       boolean;
  hasFries:     boolean;
  isSpicy:      boolean;
  type:         FrancesinhaType;
}
