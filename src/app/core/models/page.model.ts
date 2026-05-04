import { Francesinha } from './francesinha.model';
import { Restaurant } from './restaurant.model';
import { Review } from './review.model';
import { Favorite } from './favorite.model';

export interface FrancesinhasPagedResponse {
  francesinhas: Francesinha[];
  total:        number;
  totalPages:   number;
  pageNumber:   number;
  pageSize:     number;
}

export interface RestaurantsPagedResponse {
  restaurants: Restaurant[];
  total:       number;
  totalPages:  number;
  pageNumber:  number;
  pageSize:    number;
}

export interface FavoritesPagedResponse {
  favorites:  Favorite[];
  total:      number;
  totalPages: number;
  pageNumber: number;
  pageSize:   number;
}

export interface ReviewsPagedResponse {
  reviews:    Review[];
  total:      number;
  totalPages: number;
  pageNumber: number;
  pageSize:   number;
}