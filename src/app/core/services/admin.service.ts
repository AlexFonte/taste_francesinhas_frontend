import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Francesinha, FrancesinhaStatus } from '../models/francesinha.model';
import { FrancesinhasPagedResponse, ReviewsPagedResponse } from '../models/page.model';
import { AdminStats } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/francesinhas`;

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.base}/stats`);
  }

  getPending(page = 0, size = 10): Observable<FrancesinhasPagedResponse> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<FrancesinhasPagedResponse>(`${this.base}/pending`, { params });
  }

  getPendingById(id: number): Observable<Francesinha> {
    return this.http.get<Francesinha>(`${this.base}/pending/${id}`);
  }

  getPendingReviews(id: number, page = 0, size = 10): Observable<ReviewsPagedResponse> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ReviewsPagedResponse>(`${this.base}/pending/${id}/reviews`, { params });
  }

  // PATCH /francesinhas/pending/{id}/status con body { status: 'ACCEPTED' | 'REJECTED' }
  updateStatus(id: number, status: Extract<FrancesinhaStatus, 'ACCEPTED' | 'REJECTED'>): Observable<Francesinha> {
    return this.http.patch<Francesinha>(`${this.base}/pending/${id}/status`, { status });
  }
}