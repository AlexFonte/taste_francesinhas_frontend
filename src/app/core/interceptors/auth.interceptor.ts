import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Estado compartido entre invocaciones del interceptor: si dos peticiones caducan a la vez
// solo una dispara el refresh y el resto espera al nuevo token. Asi evitamos N llamadas concurrentes a /auth/refresh y bucles raros.
let refreshing = false;
const tokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Las rutas de /auth/* no deben dispararse a si mismas: un 401 en login es
      // credenciales incorrectas, y un 401 en refresh significa que el refresh
      // tambien caduco -> logout directo.
      const isAuthEndpoint = req.url.includes('/auth/');
      if (err.status !== 401 || isAuthEndpoint || !auth.isLoggedIn()) {
        return throwError(() => err);
      }
      return handle401(req, next, auth);
    })
  );
};

function handle401(req: HttpRequest<unknown>, next: HttpHandlerFn, auth: AuthService): Observable<any> {
  // Si ya hay un refresh en curso, nos suscribimos  y reintentamos
  // cuando llegue el nuevo token. Si llega null el refresh fallo -> propagamos el error.
  if (refreshing) {
    return tokenSubject.pipe(
      filter((t): t is string => t !== null),
      take(1),
      switchMap(t => next(req.clone({ setHeaders: { Authorization: `Bearer ${t}` } })))
    );
  }

  refreshing = true;
  tokenSubject.next(null);

  return auth.refresh().pipe(
    switchMap(res => {
      refreshing = false;
      tokenSubject.next(res.accessToken);
      return next(req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } }));
    }),
    catchError(err => {
      // Refresh fallo (refresh token caducado, invalidado o sin red): cerramos sesion.
      refreshing = false;
      tokenSubject.next(null);
      auth.logout();
      return throwError(() => err);
    })
  );
}
