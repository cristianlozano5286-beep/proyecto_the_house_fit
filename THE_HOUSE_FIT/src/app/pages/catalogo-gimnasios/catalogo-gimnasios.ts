import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GimnasiosService } from '../../services/gimnasios';
import { InstructoresService } from '../../services/instructores';
import { BlogService } from '../../services/blog';
import { MembresiasContabilidadService } from '../../services/membresias-contabilidad';
import { AuthService } from '../../services/auth';
import { Gimnasio, Instructor } from '../../models/catalogo.models';
import { Resena } from '../../models/blog.models';
import { GymDetailModalComponent } from '../../shared/gym-detail-modal/gym-detail-modal';

type Orden = 'relevancia' | 'precio-asc' | 'precio-desc' | 'calificacion';

@Component({
  selector: 'app-catalogo-gimnasios',
  imports: [FormsModule, GymDetailModalComponent],
  templateUrl: './catalogo-gimnasios.html',
  styleUrl: './catalogo-gimnasios.css',
})
export class CatalogoGimnasiosComponent implements OnInit {
  @ViewChild('inputDestino') inputDestino?: ElementRef<HTMLInputElement>;
  @ViewChild('inputPrecio') inputPrecio?: ElementRef<HTMLInputElement>;

  gimnasios: Gimnasio[] = [];
  gimnasiosFiltrados: Gimnasio[] = [];

  // Barra de búsqueda estilo Airbnb: Dónde / Servicio / Precio
  destino: string = '';
  servicioFiltro: string = '';
  precioMax: number | null = null;
  orden: Orden = 'relevancia';
  soloFavoritos: boolean = false;
  campoActivo: 'donde' | 'servicio' | 'precio' | null = null;

  // Estados para los menús desplegables personalizados
  dropdownServicioAbierto: boolean = false;
  dropdownOrdenAbierto: boolean = false;
  ordenSeleccionadoTexto: string = 'Relevancia';

  gimnasioSeleccionado: Gimnasio | null = null;

  destinosDisponibles: string[] = [];
  serviciosDisponibles: string[] = [];
  mostrarSugerencias: boolean = false;

  // Fotos de tarjetas
  fotosPorTarjeta: { [gymId: number]: number } = {};

  // Feedback Toast
  mensajeToast: string = '';
  mostrarToast: boolean = false;
  toastTimer: any;

  obtenerIconoServicio(s: string): string {
    const lower = s.toLowerCase();
    if (lower.includes('muscul') || lower.includes('pesa')) return '🏋️';
    if (lower.includes('cross')) return '🔥';
    if (lower.includes('yoga')) return '🧘';
    if (lower.includes('spin') || lower.includes('bici')) return '🚴';
    if (lower.includes('cardio') || lower.includes('correr')) return '🏃';
    if (lower.includes('funcional')) return '🎯';
    if (lower.includes('calistenia')) return '🤸';
    if (lower.includes('box')) return '🥊';
    if (lower.includes('power')) return '🏆';
    if (lower.includes('pilates')) return '🌿';
    if (lower.includes('zumba') || lower.includes('baile')) return '💃';
    if (lower.includes('nutric') || lower.includes('asesor')) return '🥗';
    if (lower.includes('aire') || lower.includes('clima')) return '❄️';
    if (lower.includes('spa') || lower.includes('sauna') || lower.includes('turco')) return '💆';
    if (lower.includes('wi-fi') || lower.includes('wifi') || lower.includes('internet')) return '📶';
    if (lower.includes('ducha')) return '🚿';
    if (lower.includes('casillero') || lower.includes('locker')) return '🔐';
    if (lower.includes('hidrat') || lower.includes('agua')) return '💧';
    if (lower.includes('peso libre') || lower.includes('mancuerna')) return '🏋️';
    if (lower.includes('maquina') || lower.includes('máquina')) return '⚙️';
    if (lower.includes('toalla')) return '🧺';
    if (lower.includes('parque') || lower.includes('estacion')) return '🅿️';
    if (lower.includes('piscina') || lower.includes('nata')) return '🏊';
    if (lower.includes('entrenador') || lower.includes('personal')) return '🧑‍🏫';
    if (lower.includes('24')) return '🕒';
    return '✨';
  }

  indiceFotoActual(gym: Gimnasio): number {
    return this.fotosPorTarjeta[gym.id] || 0;
  }

  esFavoritoAtletas(gymId: number): boolean {
    return this.promedio(gymId) >= 4.7;
  }

  constructor(
    private gimnasiosService: GimnasiosService,
    private instructoresService: InstructoresService,
    private blogService: BlogService,
    private contabilidadService: MembresiasContabilidadService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
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

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe((params) => {
      if (params['fav'] === 'true') {
        this.soloFavoritos = true;
      }
      if (params['q']) {
        this.destino = params['q'];
      }
      if (params['servicio']) {
        this.servicioFiltro = params['servicio'];
      }
      if (params['precioMax']) {
        const p = Number(params['precioMax']);
        this.precioMax = !isNaN(p) && p > 0 ? p : null;
      }
      this.buscar();
    });

    if (this.gimnasios.length === 0) {
      await this.gimnasiosService.cargar();
      this.gimnasios = this.gimnasiosService.listar().filter((g) => g.activo);
      this.actualizarDestinosYServicios();
      this.buscar();
    }
  }

  private actualizarDestinosYServicios(): void {
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.custom-dropdown')) {
      this.dropdownServicioAbierto = false;
      if (this.campoActivo === 'servicio') {
        this.campoActivo = null;
      }
    }
    if (!target.closest('.custom-select-wrapper')) {
      this.dropdownOrdenAbierto = false;
    }
    if (!target.closest('.search-field.grow')) {
      this.mostrarSugerencias = false;
      if (this.campoActivo === 'donde') {
        this.campoActivo = null;
      }
    }
    if (!target.closest('.precio-field') && this.campoActivo === 'precio') {
      this.campoActivo = null;
    }
  }

  enfocarDestino(event?: Event): void {
    if (event) {
      // No detener la propagación a menos que sea un botón de limpieza
      const target = event.target as HTMLElement;
      if (target.classList.contains('btn-clear-input')) {
        return;
      }
    }
    this.campoActivo = 'donde';
    this.mostrarSugerencias = true;
    this.dropdownServicioAbierto = false;
    this.dropdownOrdenAbierto = false;
    setTimeout(() => {
      this.inputDestino?.nativeElement?.focus();
    }, 10);
  }

  enfocarPrecio(event?: Event): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('btn-clear-input')) {
        return;
      }
    }
    this.campoActivo = 'precio';
    this.mostrarSugerencias = false;
    this.dropdownServicioAbierto = false;
    this.dropdownOrdenAbierto = false;
    setTimeout(() => {
      this.inputPrecio?.nativeElement?.focus();
    }, 10);
  }

  // Carrusel por tarjeta
  fotoActualDe(gym: Gimnasio): string {
    const idx = this.fotosPorTarjeta[gym.id] || 0;
    return gym.fotos[idx] || gym.fotos[0];
  }

  siguienteFotoTarjeta(event: Event, gym: Gimnasio): void {
    event.stopPropagation();
    const actual = this.fotosPorTarjeta[gym.id] || 0;
    this.fotosPorTarjeta[gym.id] = (actual + 1) % gym.fotos.length;
  }

  anteriorFotoTarjeta(event: Event, gym: Gimnasio): void {
    event.stopPropagation();
    const actual = this.fotosPorTarjeta[gym.id] || 0;
    this.fotosPorTarjeta[gym.id] = (actual - 1 + gym.fotos.length) % gym.fotos.length;
  }

  // Dropdown Servicio
  toggleDropdownServicio(event: Event): void {
    event.stopPropagation();
    this.dropdownServicioAbierto = !this.dropdownServicioAbierto;
    this.dropdownOrdenAbierto = false;
    this.mostrarSugerencias = false;
    // Solo un segmento resaltado a la vez
    this.campoActivo = this.dropdownServicioAbierto ? 'servicio' : null;
  }

  contarGimnasiosCon(servicio: string): number {
    return this.gimnasios.filter((g) => g.servicios.includes(servicio)).length;
  }

  seleccionarServicioCustom(servicio: string): void {
    this.servicioFiltro = servicio;
    this.dropdownServicioAbierto = false;
    this.campoActivo = null;
    this.buscar();
  }

  // Dropdown Ordenamiento
  toggleDropdownOrden(event: Event): void {
    event.stopPropagation();
    this.dropdownOrdenAbierto = !this.dropdownOrdenAbierto;
    this.dropdownServicioAbierto = false;
  }

  seleccionarOrden(valor: Orden, texto: string): void {
    this.orden = valor;
    this.ordenSeleccionadoTexto = texto;
    this.dropdownOrdenAbierto = false;
    this.buscar();
  }

  cerrarSugerenciasDiferido(): void {
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
    this.ordenSeleccionadoTexto = 'Relevancia';
    this.soloFavoritos = false;
    this.dropdownServicioAbierto = false;
    this.dropdownOrdenAbierto = false;
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

      const coincideServicio = this.servicioFiltro === '' || g.servicios.some((s) => s.toLowerCase() === this.servicioFiltro.toLowerCase());
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

  // Favoritos
  esFavorito(id: number): boolean {
    return this.gimnasiosService.esFavorito(id);
  }

  alternarFavorito(event: Event, id: number): void {
    event.stopPropagation();
    this.gimnasiosService.alternarFavorito(id);
    const gym = this.gimnasios.find((g) => g.id === id);
    const estado = this.esFavorito(id);
    this.dispararToast(
      estado
        ? `Guardado en tus favoritos ♥ (${gym?.nombre || 'Gimnasio'})`
        : `Eliminado de tus favoritos (${gym?.nombre || 'Gimnasio'})`
    );
    if (this.soloFavoritos) this.buscar();
  }

  verDetalle(gimnasio: Gimnasio): void {
    this.gimnasioSeleccionado = gimnasio;
  }

  cerrarDetalle(): void {
    this.gimnasioSeleccionado = null;
  }

  onModalToast(mensaje: string): void {
    this.dispararToast(mensaje);
  }

  instructoresDe(gimnasioId: number): Instructor[] {
    return this.instructoresService.listar().filter((i) => i.gimnasioId === gimnasioId && i.activo);
  }

  resenasDe(gimnasioId: number): Resena[] {
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

  private dispararToast(msg: string): void {
    this.mensajeToast = msg;
    this.mostrarToast = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.mostrarToast = false;
    }, 3200);
  }
}