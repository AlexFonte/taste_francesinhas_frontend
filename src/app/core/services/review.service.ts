import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review } from '../models/review.model';
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

export interface ReviewRequest {
  scoreFlavor:       number;
  scoreSauce:        number;
  scoreBread:        number;
  scorePresentation: number;
  comment:           string;
  // Solo se envia true cuando la review se crea junto con una propuesta de francesinha
  // (la francesinha estara en estado PENDING). En el resto de casos se omite.
  propuesta?:        boolean;
}