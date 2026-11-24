import { HttpInterceptorFn } from '@angular/common/http';

// Agrega el token a cada petición para que el MID sepa quién es el usuario
export const tokenInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const token = localStorage.getItem('tokenSesion');

  if (token) {
    peticion = peticion.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return siguiente(peticion);
};
