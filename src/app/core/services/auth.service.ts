import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/auth`;

  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_KEY = 'refreshToken';
  private readonly EMAIL_KEY = 'email_user';
  private readonly IDUSER_KEY = 'id_user';

  private readonly _isLoggedIn = signal<boolean>(!!localStorage.getItem(this.TOKEN_KEY));
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, request).pipe(
      tap(res => this.saveTokens(res))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/signup`, request).pipe(
      tap(res => this.saveTokens(res))
    );
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.base}/refresh`, { refreshToken }).pipe(
      tap(res => this.saveTokens(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
    localStorage.removeItem(this.IDUSER_KEY);
    this._isLoggedIn.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  private saveTokens(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.accessToken);
    localStorage.setItem(this.REFRESH_KEY, res.refreshToken);
    localStorage.setItem(this.EMAIL_KEY, res.emailUser);
    localStorage.setItem(this.IDUSER_KEY, res.idUser.toString());
    this._isLoggedIn.set(true);
  }
}
