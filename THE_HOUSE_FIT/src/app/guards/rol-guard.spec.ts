import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { rolGuard } from './rol-guard';
import { AuthService } from '../services/auth';

describe('rolGuard', () => {
  const crearMockRouter = () => {
    const navegaciones: unknown[][] = [];
    return {
      navegaciones,
      router: {
        navigate: (comandos: unknown[]) => {
          navegaciones.push(comandos);
          return Promise.resolve(true);
        },
      },
    };
  };

  it('permite acceso cuando el rol del usuario está autorizado', () => {
    const { router, navegaciones } = crearMockRouter();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        {
          provide: AuthService,
          useValue: { estaAutenticado: () => true, obtenerRol: () => 'Creador gym' },
        },
      ],
    });

    const route = { data: { roles: ['Administrador', 'Creador gym'] } } as unknown as ActivatedRouteSnapshot;
    const state = { url: '/publicar-gimnasio' } as RouterStateSnapshot;

    const resultado = TestBed.runInInjectionContext(() => rolGuard(route, state));
    expect(resultado).toBe(true);
    expect(navegaciones.length).toBe(0);
  });

  it('bloquea a un Usuario regular de rutas de creación/edición de gimnasios y redirige al dashboard', () => {
    const { router, navegaciones } = crearMockRouter();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        {
          provide: AuthService,
          useValue: { estaAutenticado: () => true, obtenerRol: () => 'Usuario' },
        },
      ],
    });

    const route = { data: { roles: ['Administrador', 'Creador gym'] } } as unknown as ActivatedRouteSnapshot;
    const state = { url: '/publicar-gimnasio' } as RouterStateSnapshot;

    const resultado = TestBed.runInInjectionContext(() => rolGuard(route, state));
    expect(resultado).toBe(false);
    expect(navegaciones[0]).toEqual(['/panel/dashboard']);
  });
});

