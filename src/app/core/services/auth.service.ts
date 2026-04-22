import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base   = `${environment.apiUrl}/auth`;

  private readonly _auth = signal<LoginResponse | null>(this.loadFromStorage());

  readonly auth = this._auth.asReadonly();
  readonly isLoggedIn   = computed(() => this._auth() !== null);
  readonly accessToken  = computed(() => this._auth()?.accessToken  ?? null);
  readonly refreshToken = computed(() => this._auth()?.refreshToken ?? null);
  readonly email        = computed(() => this._auth()?.email        ?? null);
  readonly role         = computed(() => this._auth()?.role         ?? 'ANONYMOUS' as const);
  readonly isAdmin      = computed(() => this._auth()?.role === 'ADMIN');

  constructor() {
    effect(() => {
      const auth = this._auth();
      if (auth) {
        localStorage.setItem('auth', JSON.stringify(auth));
      } else {
        localStorage.removeItem('auth');
      }
    });
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, request).pipe(
      tap(res => this._auth.set(res))
    );
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/signup`, request).pipe(
      tap(res => this._auth.set(res))
    );
  }

  refresh(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/refresh`, { refreshToken: this.refreshToken() }).pipe(
      tap(res => this._auth.set(res))
    );
  }

  logout(): void {
    this._auth.set(null);
    this.router.navigate(['/auth/login']);
  }

  private loadFromStorage(): LoginResponse | null {
    try {
      const raw = localStorage.getItem('auth');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
