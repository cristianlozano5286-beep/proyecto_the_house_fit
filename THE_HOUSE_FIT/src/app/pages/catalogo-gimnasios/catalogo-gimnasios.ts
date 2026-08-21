import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GimnasiosService } from '../../services/gimnasios';
import { InstructoresService } from '../../services/instructores';
import { BlogService } from '../../services/blog';
import { Gimnasio } from '../../models/catalogo.models';

type Orden = 'relevancia' | 'precio-asc' | 'precio-desc' | 'calificacion';

@Component({
  selector: 'app-catalogo-gimnasios',
  imports: [FormsModule],
  templateUrl: './catalogo-gimnasios.html',
  styleUrl: './catalogo-gimnasios.css',
})
export class CatalogoGimnasiosComponent {
  gimnasios: Gimnasio[] = [];
  gimnasiosFiltrados: Gimnasio[] = [];

  // Barra de búsqueda estilo Airbnb: Dónde / Servicio / Precio
  destino: string = '';
  servicioFiltro: string = '';
  precioMax: number | null = null;
  orden: Orden = 'relevancia';
  soloFavoritos: boolean = false;

  gimnasioSeleccionado: Gimnasio | null = null;
  fotoActiva: number = 0;

  destinosDisponibles: string[] = [];
  serviciosDisponibles: string[] = [];
  mostrarSugerencias: boolean = false;

  constructor(
    private gimnasiosService: GimnasiosService,
    private instructoresService: InstructoresService,
    private blogService: BlogService,
  ) {
    this.gimnasios = this.gimnasiosService.listar().filter((g) => g.activo);
    this.gimnasiosFiltrados = [...this.gimnasios];

    const servicios = new Set<string>();
    this.gimnasios.forEach((g) => g.servicios.forEach((s) => servicios.add(s)));
    this.serviciosDisponibles = Array.from(servicios);

    const destinos = new Set<string>();
    this.gimnasios.forEach((g) => {
      destinos.add(g.ciudad);
      destinos.add(`${g.ciudad}, ${g.pais}`);
    });
    this.destinosDisponibles = Array.from(destinos);
  }

  cerrarSugerenciasDiferido(): void {
    // Pequeño retraso para permitir que el (mousedown) de una sugerencia se registre antes del blur.
    setTimeout(() => (this.mostrarSugerencias = false), 150);
  }

  seleccionarDestino(d: string): void {
    this.destino = d;
    this.mostrarSugerencias = false;
    this.buscar();
  }

  toggleServicio(servicio: string): void {
    this.servicioFiltro = this.servicioFiltro === servicio ? '' : servicio;
    this.buscar();
  }

  limpiarFiltros(): void {
    this.destino = '';
    this.servicioFiltro = '';
    this.precioMax = null;
    this.orden = 'relevancia';
    this.soloFavoritos = false;
    this.buscar();
  }

  buscar(): void {
    const texto = this.destino.trim().toLowerCase();

    let resultado = this.gimnasios.filter((g) => {
      const coincideDestino =
        texto === '' ||
        g.nombre.toLowerCase().includes(texto) ||
        g.barrio.toLowerCase().includes(texto) ||
        g.ciudad.toLowerCase().includes(texto) ||
        g.pais.toLowerCase().includes(texto);

      const coincideServicio = this.servicioFiltro === '' || g.servicios.includes(this.servicioFiltro);

      const coincidePrecio = this.precioMax === null || g.precio <= this.precioMax;

      const coincideFavorito = !this.soloFavoritos || this.esFavorito(g.id);

      return coincideDestino && coincideServicio && coincidePrecio && coincideFavorito;
    });

    resultado = this.ordenarLista(resultado);
    this.gimnasiosFiltrados = resultado;
  }

  private ordenarLista(lista: Gimnasio[]): Gimnasio[] {
    const copia = [...lista];
    switch (this.orden) {
      case 'precio-asc':
        return copia.sort((a, b) => a.precio - b.precio);
      case 'precio-desc':
        return copia.sort((a, b) => b.precio - a.precio);
      case 'calificacion':
        return copia.sort((a, b) => this.promedio(b.id) - this.promedio(a.id));
      default:
        return copia;
    }
  }

  // ----- Favoritos -----
  esFavorito(id: number): boolean {
    return this.gimnasiosService.esFavorito(id);
  }

  alternarFavorito(event: Event, id: number): void {
    event.stopPropagation();
    this.gimnasiosService.alternarFavorito(id);
    if (this.soloFavoritos) this.buscar();
  }

  // ----- Detalle tipo "listing" de Airbnb -----
  verDetalle(gimnasio: Gimnasio): void {
    this.gimnasioSeleccionado = gimnasio;
    this.fotoActiva = 0;
    document.body.style.overflow = 'hidden';
  }

  cerrarDetalle(): void {
    this.gimnasioSeleccionado = null;
    document.body.style.overflow = '';
  }

  cambiarFoto(index: number): void {
    this.fotoActiva = index;
  }

  fotoSiguiente(event: Event): void {
    event.stopPropagation();
    if (!this.gimnasioSeleccionado) return;
    const total = this.gimnasioSeleccionado.fotos.length;
    this.fotoActiva = (this.fotoActiva + 1) % total;
  }

  fotoAnterior(event: Event): void {
    event.stopPropagation();
    if (!this.gimnasioSeleccionado) return;
    const total = this.gimnasioSeleccionado.fotos.length;
    this.fotoActiva = (this.fotoActiva - 1 + total) % total;
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

  formatoPrecio(g: Gimnasio): string {
    const valor = g.moneda === 'COP' ? g.precio.toLocaleString('es-CO') : g.precio.toLocaleString('en-US');
    const simbolo = g.moneda === 'COP' ? '$' : g.moneda === 'EUR' ? '€' : '$';
    return `${simbolo}${valor} ${g.moneda}`;
  }
}