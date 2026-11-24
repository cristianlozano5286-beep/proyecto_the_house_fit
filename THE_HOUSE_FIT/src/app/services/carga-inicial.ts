import { Injectable } from '@angular/core';
import { AuthService } from './auth';
import { BlogService } from './blog';
import { ClasesService } from './clases';
import { ContenidoService } from './contenido';
import { GimnasiosService } from './gimnasios';
import { InstructoresService } from './instructores';
import { MembresiasContabilidadService } from './membresias-contabilidad';
import { PagosService } from './pagos';
import { ProductosService } from './productos';

/*
  Trae los datos del MID cuando se abre la app, antes de mostrar la
  primera página. Así las páginas pueden seguir leyendo de los servicios
  sin esperar nada.

  - cargarTodo(): lo que puede ver cualquiera (gimnasios, rutinas, etc.)
                  y, si ya hay sesión, lo del usuario (favoritos, reservas...)
  - cargarPrivados(): se llama después de iniciar sesión
  - limpiarPrivados(): se llama al cerrar sesión
*/
@Injectable({ providedIn: 'root' })
export class CargaInicialService {
  constructor(
    private authService: AuthService,
    private gimnasiosService: GimnasiosService,
    private instructoresService: InstructoresService,
    private productosService: ProductosService,
    private clasesService: ClasesService,
    private blogService: BlogService,
    private contenidoService: ContenidoService,
    private pagosService: PagosService,
    private membresiasService: MembresiasContabilidadService,
  ) {}

  async cargarTodo(): Promise<void> {
    // allSettled: si una lista falla (por ejemplo el MID está apagado) la app igual abre
    await Promise.allSettled([
      this.gimnasiosService.cargar(),
      this.instructoresService.cargar(),
      this.productosService.cargar(),
      this.clasesService.cargar(),
      this.blogService.cargar(),
      this.contenidoService.cargar(),
      this.pagosService.cargar(),
      this.membresiasService.cargar(),
    ]);

    if (this.authService.estaAutenticado()) {
      await this.cargarPrivados();
    }
  }

  async cargarPrivados(): Promise<void> {
    const pendientes: Promise<void>[] = [
      this.gimnasiosService.cargarFavoritos(),
      this.clasesService.cargarReservas(),
      this.pagosService.cargarTransacciones(),
    ];

    // la lista de usuarios solo la puede ver el Administrador
    if (this.authService.obtenerRol() === 'Administrador') {
      pendientes.push(this.authService.cargarUsuarios());
    }

    const resultados = await Promise.allSettled(pendientes);

    // si el token ya venció el MID responde 401: se cierra la sesión
    const vencido = resultados.some((r) => r.status === 'rejected' && r.reason?.status === 401);
    if (vencido) {
      this.authService.cerrarSesion();
      this.limpiarPrivados();
    }
  }

  limpiarPrivados(): void {
    this.gimnasiosService.limpiarFavoritos();
    this.clasesService.limpiarReservas();
    this.pagosService.limpiarTransacciones();
  }
}
