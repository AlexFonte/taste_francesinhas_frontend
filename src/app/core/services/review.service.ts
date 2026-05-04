import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review, ReviewRequest } from '../models/review.model';
import { ReviewsPagedResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {

  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/francesinhas`;

  getByFrancesinha(francesinhaId: number, page = 0, size = 10): Observable<ReviewsPagedResponse> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ReviewsPagedResponse>(`${this.base}/${francesinhaId}/reviews`, { params });
  }

  create(francesinhaId: number, request: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.base}/${francesinhaId}/reviews`, request);
  }
}