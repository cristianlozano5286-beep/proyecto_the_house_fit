import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../services/auth';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle';

interface SeccionUsuario {
  id: 'perfil' | 'entrenamiento' | 'reservar-clase' | 'resenas' | 'pagos';
  nombre: string;
  badge: string;
  descripcion: string;
  ruta: string;
  roles: string[];
}

/**
 * Apartado dedicado en pantalla completa para las secciones del Usuario
 * (Mi entrenamiento, Reservar clase, Reseñas y Pagos).
 * Replica la experiencia de los apartados dedicados del Creador gym:
 * cabecera propia, pestañas de navegación entre secciones y salida al panel.
 */
@Component({
  selector: 'app-mi-espacio-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
  templateUrl: './mi-espacio-layout.html',
  styleUrl: './mi-espacio-layout.css',
})
export class MiEspacioLayoutComponent implements OnInit, OnDestroy {
  nombreUsuario = 'Atleta';
  animarEntrada = true;
  private navSub?: Subscription;
  private urlActual = '';

  readonly secciones: SeccionUsuario[] = [
    {
      id: 'perfil',
      nombre: 'Mi perfil',
      badge: 'MI PERFIL',
      descripcion: 'Administra tu foto, identidad deportiva y accesos personales',
      ruta: '/mi-perfil',
      roles: ['Administrador', 'Creador gym', 'Usuario', 'Entrenador'],
    },
    {
      id: 'entrenamiento',
      nombre: 'Mi entrenamiento',
      badge: 'MI ENTRENAMIENTO',
      descripcion: 'Rutinas, guías físicas y tu plan nutricional personalizado',
      ruta: '/mi-espacio/entrenamiento',
      roles: ['Usuario', 'Entrenador'],
    },
    {
      id: 'reservar-clase',
      nombre: 'Reservar clase',
      badge: 'RESERVAS',
      descripcion: 'Asegura tu cupo en las clases de los gimnasios afiliados',
      ruta: '/mi-espacio/reservar-clase',
      roles: ['Usuario', 'Entrenador'],
    },
    {
      id: 'resenas',
      nombre: 'Reseñas',
      badge: 'RESEÑAS',
      descripcion: 'Comparte tu experiencia y valora las sedes donde entrenas',
      ruta: '/mi-espacio/resenas',
      roles: ['Administrador', 'Usuario', 'Entrenador'],
    },
    {
      id: 'pagos',
      nombre: 'Pagos',
      badge: 'PAGOS',
      descripcion: 'Membresías, pases y facturación con pasarela segura',
      ruta: '/mi-espacio/pagos',
      roles: ['Usuario', 'Entrenador'],
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const sesion = this.authService.obtenerUsuario();
    if (sesion?.nombre) {
      this.nombreUsuario = sesion.nombre.split(' ')[0];
    }
    this.urlActual = this.router.url;
    this.navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.urlActual = e.urlAfterRedirects;
      });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  get rolUsuario(): string {
    return this.authService.obtenerRol() || 'Usuario';
  }

  get seccionesVisibles(): SeccionUsuario[] {
    const rol = this.rolUsuario;
    const visibles = this.secciones.filter((s) => s.roles.includes(rol));
    return visibles.length ? visibles : this.secciones;
  }

  get seccionActual(): SeccionUsuario {
    return (
      this.secciones.find((s) => this.urlActual.startsWith(s.ruta)) ?? this.secciones[0]
    );
  }

  esRutaActiva(ruta: string): boolean {
    return this.urlActual.startsWith(ruta);
  }

  alActivarSeccion(): void {
    this.animarEntrada = true;
  }

  salirAlPanel(): void {
    this.router.navigate(['/panel/dashboard']);
  }
}

