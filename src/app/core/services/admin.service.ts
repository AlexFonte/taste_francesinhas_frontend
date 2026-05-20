import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Francesinha, FrancesinhaStatus, PendingFrancesinha} from '../models/francesinha.model';
import {FrancesinhasPagedResponse} from '../models/page.model';
import {AdminStats} from '../models/admin.model';

@Injectable({providedIn: 'root'})
export class AdminService {

	private readonly http = inject(HttpClient);
	private readonly base = `${environment.apiUrl}/francesinhas`;

	getStats(): Observable<AdminStats> {
		return this.http.get<AdminStats>(`${this.base}/stats`);
	}

	getPending(page = 0, size = 10): Observable<FrancesinhasPagedResponse> {
		const params = new HttpParams().set('page', page).set('size', size);
		return this.http.get<FrancesinhasPagedResponse>(`${this.base}/pending`, {params});
	}

	// Listado de francesinhas ya revisadas (aprobadas o rechazadas), solo para el admin.
	getProposals(status: Extract<FrancesinhaStatus, 'ACCEPTED' | 'REJECTED'>, page = 0, size = 10): Observable<FrancesinhasPagedResponse> {
		const params = new HttpParams().set('status', status).set('page', page).set('size', size);
		return this.http.get<FrancesinhasPagedResponse>(`${this.base}/admin`, {params});
	}

	// Detalle de la propuesta: la francesinha pendiente + la review de la propuesta, en un solo DTO.
	getPendingById(id: number): Observable<PendingFrancesinha> {
		return this.http.get<PendingFrancesinha>(`${this.base}/pending/${id}`);
	}

	// PATCH /francesinhas/pending/{id}/status con body { status: 'ACCEPTED' | 'REJECTED' }
	updateStatus(id: number, status: Extract<FrancesinhaStatus, 'ACCEPTED' | 'REJECTED'>): Observable<Francesinha> {
		return this.http.patch<Francesinha>(`${this.base}/pending/${id}/status`, {status});
	}
}
