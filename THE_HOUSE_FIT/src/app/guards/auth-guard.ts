import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { routes } from '../app.routes';

export const authGuard: CanActivateFn = () => {
  const router= inject(Router);


  //Simulacion de autenticacion
  const autenticado = localStorage.getItem('usuarioLogueado');
  if(autenticado==='true'){
    return true;
  }
  router.navigate(['/login']);
  return false;
};
