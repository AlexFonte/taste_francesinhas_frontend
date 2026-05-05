import { Francesinha } from './francesinha.model';

// id es el id de la propia entidad Favorite (no de la francesinha).
// La francesinha viene siempre poblada desde el backend (FavoriteResponse incluye el
// FrancesinhaResponse completo). createdAt es la fecha en que se anadio el favorito.
export interface Favorite {
  id:          number;
  francesinha: Francesinha;
  createdAt:   string;
}