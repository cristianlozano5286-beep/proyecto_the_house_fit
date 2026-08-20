import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { routes } from '../app.routes';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const router= inject(Router);
  const authService = inject(AuthService);


  //Simulacion de autenticacion
  if (authService.estaAutenticado()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
