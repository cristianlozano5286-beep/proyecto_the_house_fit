import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.estaAutenticado()) {
    return true;
  }

  router.navigate(['/login'], {
    queryParams: {
      bloqueado: '1',
      destino: state.url || '/',
    },
  });
  return false;
};
