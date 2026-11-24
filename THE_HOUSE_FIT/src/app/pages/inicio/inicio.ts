import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GimnasiosService } from '../../services/gimnasios';
import { BlogService } from '../../services/blog';
import { InstructoresService } from '../../services/instructores';
import { MembresiasContabilidadService } from '../../services/membresias-contabilidad';
import { AuthService } from '../../services/auth';
import { Gimnasio, Instructor } from '../../models/catalogo.models';
import { Noticia, Resena } from '../../models/blog.models';
import { prepareCardToHeroTransition } from '../../utils/route-transitions';
import { GymDetailModalComponent } from '../../shared/gym-detail-modal/gym-detail-modal';

interface CategoriaFiltro {
  nombre: string;
  clave: string;
}

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, FormsModule, GymDetailModalComponent],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioComponent implements AfterViewInit {
  gimnasios: Gimnasio[] = [];
  gimnasiosFiltrados: Gimnasio[] = [];
  noticiasRecientes: Noticia[] = [];
  resenasDestacadas: Resena[] = [];

  categorias: CategoriaFiltro[] = [
    { nombre: 'Todos', clave: 'todos' },
    { nombre: 'Musculación', clave: 'musculacion' },
    { nombre: 'Crossfit', clave: 'crossfit' },
    { nombre: 'Yoga', clave: 'yoga' },
    { nombre: 'Spinning', clave: 'spinning' },
    { nombre: 'Cardio', clave: 'cardio' },
    { nombre: 'Entrenamiento funcional', clave: 'funcional' },
    { nombre: 'Calistenia', clave: 'calistenia' },
    { nombre: 'Boxeo', clave: 'boxeo' },
    { nombre: 'Powerlifting', clave: 'powerlifting' },
  ];

  // Conteo de gimnasios por disciplina (badge en cada pestaña)
  conteoCategorias: { [nombre: string]: number } = {};

  // Flechas de desplazamiento de la barra de categorías
  @ViewChild('catTrack') catTrack?: ElementRef<HTMLDivElement>;
  puedeIzq = false;
  puedeDer = false;

  categoriaSeleccionada: string = 'Todos';
  ciudadSeleccionada: string = 'Todas';
  ciudades: string[] = [];

  // Control de foto activa por tarjeta (carrusel de Airbnb en la card)
  fotosPorTarjeta: { [gymId: number]: number } = {};

  // Modal de detalle
  gimnasioSeleccionado: Gimnasio | null = null;

  // Feedback Toast
  mensajeToast: string = '';
  mostrarToast: boolean = false;
  toastTimer: any;

  constructor(
    private gimnasiosService: GimnasiosService,
    private blogService: BlogService,
    private instructoresService: InstructoresService,
    private contabilidadService: MembresiasContabilidadService,
    private authService: AuthService,
    private router: Router
  ) {
    this.gimnasios = this.gimnasiosService.listar().filter((g) => g.activo);
    this.gimnasiosFiltrados = [...this.gimnasios];
    this.ciudades = ['Todas', ...this.gimnasiosService.ciudadesDisponibles()];
    this.noticiasRecientes = this.blogService.listarNoticias().slice(0, 3);
    this.resenasDestacadas = this.blogService.listarResenas().slice(0, 3);

    for (const cat of this.categorias) {
      this.conteoCategorias[cat.nombre] =
        cat.nombre === 'Todos'
          ? this.gimnasios.length
          : this.gimnasios.filter((g) =>
              g.servicios.some((s) => s.toLowerCase().includes(cat.nombre.toLowerCase()))
            ).length;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.actualizarFlechas());
  }

  prepararTransicionFlyer(event: Event, rutaDestino: string): void {
    prepareCardToHeroTransition(event, rutaDestino);
  }

  @HostListener('window:resize')
  actualizarFlechas(): void {
    const el = this.catTrack?.nativeElement;
    if (!el) return;
    this.puedeIzq = el.scrollLeft > 4;
    this.puedeDer = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
  }

  desplazarCategorias(direccion: number): void {
    const el = this.catTrack?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: direccion * el.clientWidth * 0.6, behavior: 'smooth' });
  }

  filtrarPorCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    this.aplicarFiltros();
  }

  filtrarPorCiudad(ciudad: string): void {
    this.ciudadSeleccionada = ciudad;
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    this.gimnasiosFiltrados = this.gimnasios.filter((g) => {
      const cumpleCat =
        this.categoriaSeleccionada === 'Todos' ||
        g.servicios.some((s) => s.toLowerCase().includes(this.categoriaSeleccionada.toLowerCase()));

      const cumpleCiudad =
        this.ciudadSeleccionada === 'Todas' ||
        g.ciudad.toLowerCase() === this.ciudadSeleccionada.toLowerCase();

      return cumpleCat && cumpleCiudad;
    });
  }

  // Carrusel embebido en tarjeta individual
  fotoActualDe(gym: Gimnasio): string {
    const idx = this.fotosPorTarjeta[gym.id] || 0;
    return gym.fotos[idx] || gym.fotos[0] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80';
  }

  indiceFotoActual(gym: Gimnasio): number {
    return this.fotosPorTarjeta[gym.id] || 0;
  }

  esFavoritoAtletas(gimnasioId: number): boolean {
    return this.promedio(gimnasioId) >= 4.7;
  }

  get gimnasiosPopularesYopal(): Gimnasio[] {
    return this.gimnasios.filter((g) => g.ciudad.toLowerCase() === 'yopal');
  }

  get gimnasiosDestacadosInternacionales(): Gimnasio[] {
    return this.gimnasios.filter((g) => g.ciudad.toLowerCase() !== 'yopal');
  }

  desplazarCarruselSeccion(contenedor: HTMLElement, direccion: number): void {
    if (!contenedor) return;
    contenedor.scrollBy({ left: direccion * contenedor.clientWidth * 0.75, behavior: 'smooth' });
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

  // Favoritos
  esFavorito(id: number): boolean {
    return this.gimnasiosService.esFavorito(id);
  }

  alternarFavorito(event: Event, gym: Gimnasio): void {
    event.stopPropagation();
    this.gimnasiosService.alternarFavorito(gym.id);
    const estado = this.esFavorito(gym.id);
    this.dispararToast(
      estado
        ? `Guardado en tus favoritos ♥ (${gym.nombre})`
        : `Eliminado de tus favoritos (${gym.nombre})`
    );
  }

  // Calificación
  promedio(gimnasioId: number): number {
    return this.blogService.promedioPuntuacion(gimnasioId);
  }

  totalResenas(gimnasioId: number): number {
    return this.blogService.resenasPorGimnasio(gimnasioId).length;
  }

  formatoPrecio(g: Gimnasio): string {
    const valor = g.moneda === 'COP' ? g.precio.toLocaleString('es-CO') : g.precio.toLocaleString('en-US');
    const simbolo = g.moneda === 'COP' ? '$' : g.moneda === 'EUR' ? '€' : '$';
    return `${simbolo}${valor} ${g.moneda}`;
  }

  abrirModalDetalle(gym: Gimnasio): void {
    this.gimnasioSeleccionado = gym;
  }

  cerrarModalDetalle(): void {
    this.gimnasioSeleccionado = null;
  }

  onModalToast(mensaje: string): void {
    this.dispararToast(mensaje);
  }

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
    if (lower.includes('spa') || lower.includes('sauna')) return '💆';
    return '⚡';
  }

  instructoresDe(gimnasioId: number): Instructor[] {
    return this.instructoresService.listar().filter((i) => i.gimnasioId === gimnasioId);
  }

  resenasDe(gimnasioId: number): Resena[] {
    return this.blogService.resenasPorGimnasio(gimnasioId);
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
