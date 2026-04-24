import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Restaurant } from '../models/restaurant.model';
import { RestaurantsPagedResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class RestaurantService {

  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/restaurants`;

  getAll(filters: { name?: string; city?: string }, page = 0, size = 20): Observable<RestaurantsPagedResponse> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filters.name) params = params.set('name', filters.name);
    if (filters.city) params = params.set('city', filters.city);
    return this.http.get<RestaurantsPagedResponse>(this.base, { params });
  }

  getById(id: number): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.base}/${id}`);
  }

  create(payload: RestaurantRequest): Observable<Restaurant> {
    return this.http.post<Restaurant>(this.base, payload);
  }
}

export interface RestaurantRequest {
  name:     string;
  city:     string;
  address?: string;
  phone?:   string;
}