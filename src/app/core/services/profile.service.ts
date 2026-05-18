import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserStats } from '../models/profile.model';
import { MyReviewsPagedResponse, ProposalsPagedResponse } from '../models/page.model';
import { FrancesinhaStatus, FrancesinhaType } from '../models/francesinha.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {

  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/profile`;

  getStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.base}/stats`);
  }

  getMyReviews(filters: { name?: string; city?: string; type?: FrancesinhaType }, page: number, size: number = 10): Observable<MyReviewsPagedResponse> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filters.name) params = params.set('name', filters.name);
    if (filters.city) params = params.set('city', filters.city);
    if (filters.type) params = params.set('type', filters.type);
    return this.http.get<MyReviewsPagedResponse>(`${this.base}/reviews`, { params });
  }

  // Si llega el filtro status . el backend filtra por ese estado concreto. Si no, por defecto devuele todas todas
  getMyProposals(status: FrancesinhaStatus | null, page: number, size: number = 10): Observable<ProposalsPagedResponse> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<ProposalsPagedResponse>(`${this.base}/proposals`, { params });
  }
}
