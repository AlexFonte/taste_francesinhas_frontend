import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

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
    return this.http.get<{ favorites: { francesinhaId: number }[] }>(`${this.base}`, { params }).pipe(
      map(res => new Set(res.favorites.map(f => f.francesinhaId)))
    );
  }
}