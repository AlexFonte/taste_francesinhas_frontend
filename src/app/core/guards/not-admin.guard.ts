import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Permite acceso a anonimos y USER, pero el ADMIN no entra: lo mandamos a /admin
export const notAdminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  return auth.isAdmin() ? router.createUrlTree(['/admin']) : true;
};