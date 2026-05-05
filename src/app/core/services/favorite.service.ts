import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FavoritesPagedResponse } from '../models/page.model';
import { FrancesinhaType } from '../models/francesinha.model';

export interface FavoriteFilters {
  name?: string;
  city?: string;
  type?: FrancesinhaType;
}

@Injectable({ providedIn: 'root' })
export class FavoriteService {

  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/favorites`;

  isFavorite(francesinhaId: number): Observable<boolean> {
    return this.http.get<{ isFavorite: boolean }>(`${this.base}/${francesinhaId}`).pipe(
      map(res => res.isFavorite)
    );
  }

  toggle(francesinhaId: number): Observable<{ added: boolean; francesinhaId: number }> {
    return this.http.post<{ added: boolean; francesinhaId: number }>(`${this.base}/${francesinhaId}`, {});
  }

  getFavoriteIds(): Observable<Set<number>> {
    const params = new HttpParams().set('size', 200);
    return this.http.get<FavoritesPagedResponse>(this.base, { params }).pipe(
      map(res => new Set(res.favorites.map(f => f.francesinha.id)))
    );
  }

  getFavorites(filters: FavoriteFilters, page: number, size: number = 12): Observable<FavoritesPagedResponse> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filters.name) params = params.set('name', filters.name);
    if (filters.city) params = params.set('city', filters.city);
    if (filters.type) params = params.set('type', filters.type);
    return this.http.get<FavoritesPagedResponse>(this.base, { params });
  }
}
