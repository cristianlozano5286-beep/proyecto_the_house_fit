import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const rolGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.estaAutenticado()) {
    router.navigate(['/login'], {
      queryParams: {
        bloqueado: '1',
        destino: state.url || '/',
      },
    });
    return false;
  }

  const rolesPermitidos = route.data?.['roles'] as string[] | undefined;
  if (!rolesPermitidos || rolesPermitidos.length === 0) {
    return true;
  }

  if (rolesPermitidos.includes(authService.obtenerRol())) {
    return true;
  }

  router.navigate(['/panel/dashboard']);
  return false;
};

