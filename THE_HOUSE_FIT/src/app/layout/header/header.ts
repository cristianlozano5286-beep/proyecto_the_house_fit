import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CargaInicialService } from '../../services/carga-inicial';

@Component({
  selector: 'app-header',
  imports: [RouterLink, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  busquedaHeader: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private cargaInicial: CargaInicialService,
  ) {}

  nombreSistema: string = 'The House Fit';
  descripcionSistema: string ='';
  fechaActual = signal('');
  horaActual = signal('');

  get usuario(): string {
    return this.authService.obtenerNombre() || 'Usuario';
  }

  get rol(): string {
    return this.authService.obtenerRol() || 'Usuario';
  }

  get fotoPerfil(): string {
    return this.authService.obtenerFotoPerfil();
  }

  get seccionActual(): string {
    const url = this.router.url || '';
    if (url.includes('perfil')) return 'Mi Perfil';
    if (url.includes('/gimnasios')) return 'Mis Gimnasios';
    if (url.includes('/instructores')) return 'Instructores';
    if (url.includes('/productos')) return 'Inventario Tienda';
    if (url.includes('/contenido')) return 'Contenido Fit';
    if (url.includes('/entrenamiento')) return 'Planes y Rutinas';
    if (url.includes('/reservar-clase')) return 'Agenda de Clases';
    if (url.includes('/resenas')) return 'Reseñas';
    if (url.includes('/noticias')) return 'Noticias y Blog';
    if (url.includes('/pagos')) return 'Pagos y Facturación';
    if (url.includes('/usuarios')) return 'Usuarios';
    return 'Vista General';
  }

  private intervalo: any;

  ngOnInit(): void {
    this.actualizarFechaHora();
    this.intervalo = setInterval(() => {
      this.actualizarFechaHora();
    }, 1000);
  }

  obtenerInicial(): string {
    return this.usuario ? this.usuario.charAt(0).toUpperCase() : 'U';
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalo);
  }

  actualizarFechaHora(): void {
    const ahora = new Date();
    const fechaFormateada = ahora
      .toLocaleDateString('es-CO', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      .replace(/\./g, '');
    this.fechaActual.set(fechaFormateada);
    this.horaActual.set(ahora.toLocaleTimeString('es-CO', { hour12: false }));
  }

  buscarEnCatalogo(): void {
    const q = this.busquedaHeader.trim();
    if (!q) {
      this.router.navigate(['/gimnasios']);
      return;
    }
    this.router.navigate(['/gimnasios'], { queryParams: { q } });
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.cargaInicial.limpiarPrivados();
    this.router.navigate(['/login']);
  }
}
