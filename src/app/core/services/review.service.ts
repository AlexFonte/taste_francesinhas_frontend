import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Review, ReviewRequest} from '../models/review.model';
import {ReviewsPagedResponse} from '../models/page.model';

@Injectable({providedIn: 'root'})
export class ReviewService {

	private readonly http = inject(HttpClient);
	private readonly base = `${environment.apiUrl}/francesinhas`;

	getByFrancesinha(francesinhaId: number, page = 0, size = 10): Observable<ReviewsPagedResponse> {
		const params = new HttpParams().set('page', page).set('size', size);
		return this.http.get<ReviewsPagedResponse>(`${this.base}/${francesinhaId}/reviews`, {params});
	}

	// El backend espera multipart/form-data con dos partes:
	//   - "review": JSON con los scores y comentario (Content-Type application/json via Blob).
	//   - "file": binario de la foto, opcional. Si llega null se omite y la review queda sin foto.
	// No fijamos Content-Type manualmente: el navegador anade el boundary del multipart automaticamente.
	create(francesinhaId: number, request: ReviewRequest, image?: File | null): Observable<Review> {
		const formData = new FormData();
		formData.append('review', new Blob([JSON.stringify(request)], {type: 'application/json'}));
		if (image) {
			formData.append('file', image);
		}
		return this.http.post<Review>(`${this.base}/${francesinhaId}/reviews`, formData);
	}
}
