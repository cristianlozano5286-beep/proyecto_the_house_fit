import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GimnasiosService } from '../../services/gimnasios';
import { InstructoresService } from '../../services/instructores';
import { BlogService } from '../../services/blog';
import { Gimnasio } from '../../models/catalogo.models';

@Component({
  selector: 'app-catalogo-gimnasios',
  imports: [FormsModule],
  templateUrl: './catalogo-gimnasios.html',
  styleUrl: './catalogo-gimnasios.css',
})
export class CatalogoGimnasiosComponent {
  gimnasios: Gimnasio[] = [];
  gimnasiosFiltrados: Gimnasio[] = [];
  textoBusqueda: string = '';
  servicioFiltro: string = '';
  gimnasioSeleccionado: Gimnasio | null = null;

  // Lista única de servicios para el filtro (HU17)
  serviciosDisponibles: string[] = [];

  constructor(
    private gimnasiosService: GimnasiosService,
    private instructoresService: InstructoresService,
    private blogService: BlogService,
  ) {
    this.gimnasios = this.gimnasiosService.listar().filter((g) => g.activo);
    this.gimnasiosFiltrados = [...this.gimnasios];
    const set = new Set<string>();
    this.gimnasios.forEach((g) => g.servicios.forEach((s) => set.add(s)));
    this.serviciosDisponibles = Array.from(set);
  }

  buscar(): void {
    this.gimnasiosFiltrados = this.gimnasios.filter((g) => {
      const coincideTexto =
        g.nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
        g.barrio.toLowerCase().includes(this.textoBusqueda.toLowerCase());
      const coincideServicio = this.servicioFiltro === '' || g.servicios.includes(this.servicioFiltro);
      return coincideTexto && coincideServicio;
    });
  }

  verDetalle(gimnasio: Gimnasio): void {
    this.gimnasioSeleccionado = gimnasio;
  }

  cerrarDetalle(): void {
    this.gimnasioSeleccionado = null;
  }

  instructoresDe(gimnasioId: number) {
    return this.instructoresService.listar().filter((i) => i.gimnasioId === gimnasioId && i.activo);
  }

  resenasDe(gimnasioId: number) {
    return this.blogService.resenasPorGimnasio(gimnasioId);
  }

  promedio(gimnasioId: number): number {
    return this.blogService.promedioPuntuacion(gimnasioId);
  }
}
