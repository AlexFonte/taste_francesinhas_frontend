import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Francesinha, FrancesinhaType, FrancesinhaProposeRequest } from '../models/francesinha.model';
import { FrancesinhasPagedResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class FrancesinhaService {

  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/francesinhas`;

  getAllFrancesinhas(filters: { name?: string; city?: string; type?: FrancesinhaType; restaurantId?: number }, page: number, size = 10): Observable<FrancesinhasPagedResponse> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filters.name)         params = params.set('name', filters.name);
    if (filters.city)         params = params.set('city', filters.city);
    if (filters.type)         params = params.set('type', filters.type);
    if (filters.restaurantId) params = params.set('restaurantId', filters.restaurantId);
    return this.http.get<FrancesinhasPagedResponse>(this.base, { params });
  }

  getById(id: number): Observable<Francesinha> {
    return this.http.get<Francesinha>(`${this.base}/${id}`);
  }

  propose(payload: FrancesinhaProposeRequest): Observable<Francesinha> {
    return this.http.post<Francesinha>(`${this.base}/propose`, payload);
  }
}