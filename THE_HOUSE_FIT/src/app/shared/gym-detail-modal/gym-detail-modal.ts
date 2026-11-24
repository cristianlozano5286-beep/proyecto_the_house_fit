import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { BlogService } from '../../services/blog';
import { GimnasiosService } from '../../services/gimnasios';
import { InstructoresService } from '../../services/instructores';
import { MembresiasContabilidadService } from '../../services/membresias-contabilidad';
import { PagosService } from '../../services/pagos';
import { WompiPasarelaService } from '../../services/wompi-pasarela';
import { Gimnasio, Instructor } from '../../models/catalogo.models';
import { Resena } from '../../models/blog.models';

export type ModalSeccionAnchor = 'fotos' | 'servicios' | 'resenas' | 'ubicacion' | 'anfitrion';

export interface ZonaEntrenamiento {
  titulo: string;
  subtitulo: string;
  foto: string;
}

export interface CriterioRating {
  etiqueta: string;
  puntuacion: number;
  porcentaje: number;
}

const FOTOS_RESPALDO_ZONA: string[] = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1000&q=80',
];

let supportsDisplayTransitionCache: boolean | undefined;

function canTransitionDisplay(): boolean {
  if (supportsDisplayTransitionCache !== undefined) return supportsDisplayTransitionCache;
  if (
    typeof window === 'undefined' ||
    !window.CSS?.supports?.('transition-behavior', 'allow-discrete') ||
    !document.body
  ) {
    return false;
  }
  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  supportsDisplayTransitionCache = getComputedStyle(probe).display === 'block';
  probe.remove();
  return supportsDisplayTransitionCache;
}

function supportsTopLayerExit(): boolean {
  return typeof window !== 'undefined' && !!window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay();
}

function isOutsideDialogBounds(event: PointerEvent, dialog: HTMLDialogElement): boolean {
  const r = dialog.getBoundingClientRect();
  return (
    event.clientX < r.left ||
    event.clientX > r.right ||
    event.clientY < r.top ||
    event.clientY > r.bottom
  );
}

@Component({
  selector: 'app-gym-detail-modal',
  imports: [FormsModule],
  templateUrl: './gym-detail-modal.html',
  styleUrl: './gym-detail-modal.css',
})
export class GymDetailModalComponent implements OnDestroy {
  private readonly gimnasiosService = inject(GimnasiosService);
  private readonly instructoresService = inject(InstructoresService);
  private readonly blogService = inject(BlogService);
  private readonly contabilidadService = inject(MembresiasContabilidadService);
  private readonly authService = inject(AuthService);
  private readonly wompiService = inject(WompiPasarelaService);
  private readonly pagosService = inject(PagosService);

  @ViewChild('gymDialog') gymDialogRef?: ElementRef<HTMLDialogElement>;
  @ViewChild('modalScroller') modalScrollerRef?: ElementRef<HTMLDivElement>;

  readonly activeGym = signal<Gimnasio | null>(null);
  readonly modalScrolled = signal(false);
  readonly seccionActiva = signal<ModalSeccionAnchor>('fotos');
  readonly lightboxAbierto = signal(false);
  readonly fotoActiva = signal(0);
  readonly planModalSeleccionado = signal<'mensual' | 'diario'>('mensual');
  readonly mostrarFormularioReserva = signal(false);
  readonly mostrarTodosServicios = signal(false);
  readonly mostrarDescripcionCompleta = signal(false);
  readonly reservaExitoMensaje = signal('');
  readonly reservaErrorMensaje = signal('');
  readonly favVersion = signal(0);
  readonly localToast = signal('');

  readonly promedioModal = computed(() => {
    const gym = this.activeGym();
    return gym ? this.blogService.promedioPuntuacion(gym.id) : 0;
  });

  readonly esFavoritoAtletasModal = computed(() => (this.promedioModal() || 4.8) >= 4.7);

  readonly resenasModal = computed(() => {
    const gym = this.activeGym();
    return gym ? this.blogService.resenasPorGimnasio(gym.id) : [];
  });

  readonly totalResenasModal = computed(() => this.resenasModal().length);

  readonly coachesModal = computed(() => {
    const gym = this.activeGym();
    return gym ? this.instructoresService.listar().filter((i) => i.gimnasioId === gym.id) : [];
  });

  readonly fotosMosaicoModal = computed(() => {
    const gym = this.activeGym();
    return gym ? this.fotosMosaico(gym) : [];
  });

  readonly zonasModal = computed(() => {
    const gym = this.activeGym();
    return gym ? this.zonasEntrenamiento(gym) : [];
  });

  readonly serviciosVisiblesModal = computed(() => {
    const gym = this.activeGym();
    if (!gym) return [];
    const lista = gym.servicios || [];
    return this.mostrarTodosServicios() ? lista : lista.slice(0, 6);
  });

  readonly criteriosModal = computed(() => {
    const gym = this.activeGym();
    return gym ? this.criteriosRating(gym.id) : [];
  });

  formReserva = {
    nombre: '',
    cedula: '',
    correo: '',
    celular: '',
    direccionResidencia: '',
    metodoPago: 'Transferencia / Nequi',
  };

  private openTimer: ReturnType<typeof setTimeout> | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private sentinelObserver: IntersectionObserver | null = null;
  private sectionObserver: IntersectionObserver | null = null;
  private pressedOutside = false;
  private closingInProgress = false;

  @Input() set gimnasio(value: Gimnasio | null) {
    if (value) {
      this.abrirConGimnasio(value);
    } else if (this.activeGym() && !this.closingInProgress) {
      void this.closeTopLayer();
    }
  }

  @Output() cerrada = new EventEmitter<void>();
  @Output() toastMensaje = new EventEmitter<string>();

  ngOnDestroy(): void {
    if (this.openTimer) clearTimeout(this.openTimer);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.desconectarObservadores();
    const dialog = this.gymDialogRef?.nativeElement;
    if (dialog?.open) {
      dialog.close();
    }
  }

  private abrirConGimnasio(gym: Gimnasio): void {
    this.closingInProgress = false;
    this.desconectarObservadores();
    this.activeGym.set(gym);
    this.modalScrolled.set(false);
    this.seccionActiva.set('fotos');
    this.lightboxAbierto.set(false);
    this.fotoActiva.set(0);
    this.planModalSeleccionado.set('mensual');
    this.mostrarFormularioReserva.set(false);
    this.mostrarTodosServicios.set(false);
    this.mostrarDescripcionCompleta.set(false);
    this.reservaExitoMensaje.set('');
    this.reservaErrorMensaje.set('');

    const usr = this.authService.obtenerUsuario();
    this.formReserva = {
      nombre: usr?.nombre || '',
      cedula: '',
      correo: usr?.correo || '',
      celular: '',
      direccionResidencia: '',
      metodoPago: 'Transferencia / Nequi',
    };

    if (this.openTimer) clearTimeout(this.openTimer);
    this.openTimer = setTimeout(() => {
      const dialog = this.gymDialogRef?.nativeElement;
      if (!dialog) return;
      dialog.removeAttribute('data-closing');
      if (!dialog.open) {
        dialog.showModal();
      }
      const scroller = this.modalScrollerRef?.nativeElement;
      if (scroller) {
        scroller.scrollTop = 0;
        this.iniciarObservadoresScroll(scroller);
      }
    }, 0);
  }

  onDialogCancel(event: Event): void {
    event.preventDefault();
    if (this.lightboxAbierto()) {
      this.lightboxAbierto.set(false);
      return;
    }
    this.cerrarModal();
  }

  onDialogNativeClose(): void {
    this.desconectarObservadores();
    const dialog = this.gymDialogRef?.nativeElement;
    if (dialog) {
      dialog.returnValue = '';
      dialog.removeAttribute('data-closing');
    }
    this.closingInProgress = false;
    this.lightboxAbierto.set(false);
    if (this.activeGym()) {
      this.activeGym.set(null);
      this.cerrada.emit();
    }
  }

  onDialogPointerDown(event: PointerEvent): void {
    if ('closedBy' in HTMLDialogElement.prototype) return;
    const dialog = this.gymDialogRef?.nativeElement;
    if (!dialog) return;
    this.pressedOutside = isOutsideDialogBounds(event, dialog);
  }

  onDialogPointerUp(event: PointerEvent): void {
    if ('closedBy' in HTMLDialogElement.prototype) return;
    const dialog = this.gymDialogRef?.nativeElement;
    if (!dialog) return;
    if (this.pressedOutside && isOutsideDialogBounds(event, dialog)) {
      this.pressedOutside = false;
      this.cerrarModal();
    } else {
      this.pressedOutside = false;
    }
  }

  @HostListener('window:keydown', ['$event'])
  onWindowKeydown(event: KeyboardEvent): void {
    if (!this.lightboxAbierto()) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.fotoSiguiente(event);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.fotoAnterior(event);
    }
  }

  cerrarModal(): void {
    if (this.closingInProgress) return;
    void this.closeTopLayer();
  }

  private async closeTopLayer(): Promise<void> {
    const dialog = this.gymDialogRef?.nativeElement;
    this.closingInProgress = true;
    this.lightboxAbierto.set(false);

    if (!dialog || !dialog.open) {
      this.closingInProgress = false;
      this.activeGym.set(null);
      this.cerrada.emit();
      return;
    }

    if (!supportsTopLayerExit()) {
      dialog.setAttribute('data-closing', '');
      const animations = dialog.getAnimations({ subtree: true });
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise<void>((r) => setTimeout(r, 2000)),
        ]);
      }
      if (!dialog.hasAttribute('data-closing')) {
        this.closingInProgress = false;
        return;
      }
      dialog.removeAttribute('data-closing');
    }

    dialog.close();
  }

  private desconectarObservadores(): void {
    this.sentinelObserver?.disconnect();
    this.sentinelObserver = null;
    this.sectionObserver?.disconnect();
    this.sectionObserver = null;
  }

  private iniciarObservadoresScroll(scroller: HTMLElement): void {
    this.desconectarObservadores();
    if (typeof IntersectionObserver === 'undefined') return;

    const sentinel = scroller.querySelector('#thf-scroll-sentinel');
    if (sentinel) {
      this.sentinelObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          const rootTop = entry.rootBounds?.top ?? 0;
          const passed = !entry.isIntersecting && entry.boundingClientRect.top < rootTop;
          if (this.modalScrolled() !== passed) {
            this.modalScrolled.set(passed);
          }
        },
        { root: scroller, threshold: 0 }
      );
      this.sentinelObserver.observe(sentinel);
    }

    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const key = (entry.target as HTMLElement).dataset['sectionAnchor'] as ModalSeccionAnchor | undefined;
          if (key && this.seccionActiva() !== key) {
            this.seccionActiva.set(key);
          }
        }
      },
      { root: scroller, rootMargin: '-18% 0px -68% 0px', threshold: 0 }
    );

    const anchors: ModalSeccionAnchor[] = ['fotos', 'servicios', 'resenas', 'ubicacion'];
    for (const key of anchors) {
      const node = scroller.querySelector(`#gym-sec-${key}`) as HTMLElement | null;
      if (node) {
        node.dataset['sectionAnchor'] = key;
        this.sectionObserver.observe(node);
      }
    }
  }

  scrollASeccion(seccion: ModalSeccionAnchor): void {
    const scroller = this.modalScrollerRef?.nativeElement;
    if (!scroller) return;
    const target = scroller.querySelector(`#gym-sec-${seccion}`) as HTMLElement | null;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.seccionActiva.set(seccion);
    }
  }

  abrirGaleria(index = 0): void {
    this.fotoActiva.set(index);
    this.lightboxAbierto.set(true);
  }

  cerrarGaleria(): void {
    this.lightboxAbierto.set(false);
  }

  cambiarFotoModal(index: number): void {
    this.fotoActiva.set(index);
  }

  fotoSiguiente(event: Event): void {
    event.stopPropagation();
    const gym = this.activeGym();
    if (!gym) return;
    const total = this.fotosMosaico(gym).length;
    this.fotoActiva.set((this.fotoActiva() + 1) % total);
  }

  fotoAnterior(event: Event): void {
    event.stopPropagation();
    const gym = this.activeGym();
    if (!gym) return;
    const total = this.fotosMosaico(gym).length;
    this.fotoActiva.set((this.fotoActiva() - 1 + total) % total);
  }

  fotosMosaico(gym: Gimnasio): string[] {
    const vistas = new Set<string>();
    const resultado: string[] = [];
    const esUrlValida = (url: string) =>
      !!url && !url.includes('photo-1583500178690-f7fd8b7e6c33');

    for (const url of [...(gym.fotos || []), ...FOTOS_RESPALDO_ZONA]) {
      if (!esUrlValida(url)) continue;
      const key = url.startsWith('http') ? url.split('?')[0] : url.slice(0, 120);
      if (vistas.has(key)) continue;
      vistas.add(key);
      resultado.push(url);
      if (resultado.length >= 5 && (gym.fotos || []).length <= 5) break;
    }
    return resultado;
  }

  onFotoError(event: Event, index = 0): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.dataset['fallbackApplied']) return;
    img.dataset['fallbackApplied'] = '1';
    img.src = FOTOS_RESPALDO_ZONA[index % FOTOS_RESPALDO_ZONA.length];
  }

  zonasEntrenamiento(gym: Gimnasio): ZonaEntrenamiento[] {
    const fotos = this.fotosMosaico(gym);
    const s = gym.servicios || [];
    return [
      {
        titulo: s[0] || 'Zona de Fuerza y Pesas Libres',
        subtitulo: 'Racks olímpicos, mancuernas calibradas y máquinas guiadas',
        foto: fotos[1] || fotos[0],
      },
      {
        titulo: s[1] || 'Acondicionamiento & Metabólico',
        subtitulo: 'Circuito de alta intensidad, ergómetros y funcional',
        foto: fotos[2] || fotos[0],
      },
      {
        titulo: s[2] || 'Bienestar y Recuperación',
        subtitulo: 'Zona de estiramiento, duchas privadas y lockers digitales',
        foto: fotos[3] || fotos[0],
      },
    ];
  }

  serviciosVisibles(gym: Gimnasio): string[] {
    const lista = gym.servicios || [];
    return this.mostrarTodosServicios() ? lista : lista.slice(0, 6);
  }

  iconoClaveServicio(s: string): string {
    const lower = s.toLowerCase();
    if (lower.includes('muscul') || lower.includes('pesa')) return 'weights';
    if (lower.includes('cross') || lower.includes('hiit')) return 'flame';
    if (lower.includes('yoga') || lower.includes('pilates')) return 'spark';
    if (lower.includes('spin') || lower.includes('bici')) return 'bike';
    if (lower.includes('cardio') || lower.includes('correr')) return 'heart';
    if (lower.includes('funcional')) return 'target';
    if (lower.includes('calistenia') || lower.includes('box')) return 'bolt';
    if (lower.includes('power')) return 'trophy';
    if (lower.includes('aire') || lower.includes('clima')) return 'snow';
    if (lower.includes('ducha') || lower.includes('spa') || lower.includes('sauna')) return 'drop';
    if (lower.includes('wi-fi') || lower.includes('wifi')) return 'wifi';
    if (lower.includes('locker') || lower.includes('casillero')) return 'lock';
    return 'bolt';
  }

  criteriosRating(gymId: number): CriterioRating[] {
    const avg = Math.min(5, Math.max(4.4, this.promedio(gymId) || 4.8));
    const vals = [
      Math.min(5, +(avg + 0.1).toFixed(1)),
      Math.min(5, +avg.toFixed(1)),
      Math.min(5, +(avg + 0.05).toFixed(1)),
      Math.min(5, +(avg - 0.1).toFixed(1)),
      Math.min(5, +avg.toFixed(1)),
    ];
    const labels = [
      'Equipamiento y máquinas',
      'Limpieza y ventilación',
      'Atención de coaches',
      'Ubicación y horario',
      'Relación precio / calidad',
    ];
    return labels.map((etiqueta, idx) => ({
      etiqueta,
      puntuacion: vals[idx],
      porcentaje: Math.round((vals[idx] / 5) * 100),
    }));
  }

  esFavorito(gymId: number): boolean {
    this.favVersion();
    return this.gimnasiosService.esFavorito(gymId);
  }

  alternarFavorito(event: Event, gym: Gimnasio): void {
    event.stopPropagation();
    this.gimnasiosService.alternarFavorito(gym.id);
    this.favVersion.update((v) => v + 1);
    const estado = this.esFavorito(gym.id);
    this.toastMensaje.emit(
      estado ? `Guardado en tus favoritos (${gym.nombre})` : `Eliminado de tus favoritos (${gym.nombre})`
    );
    this.mostrarToastEnModal(
      estado ? `Guardado en tus favoritos (${gym.nombre})` : `Eliminado de tus favoritos (${gym.nombre})`
    );
  }

  compartirSede(gym: Gimnasio): void {
    const texto = `${gym.nombre} · ${gym.direccion}, ${gym.ciudad} — The House Fit`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(`${window.location.href} — ${texto}`).catch(() => {});
    }
    this.toastMensaje.emit(`Enlace de ${gym.nombre} copiado para compartir`);
    this.mostrarToastEnModal(`Enlace de ${gym.nombre} copiado para compartir`);
  }

  esFavoritoAtletas(gymId: number): boolean {
    return (this.promedio(gymId) || 4.8) >= 4.7;
  }

  promedio(gymId: number): number {
    return this.blogService.promedioPuntuacion(gymId);
  }

  resenasDe(gymId: number): Resena[] {
    return this.blogService.resenasPorGimnasio(gymId);
  }

  totalResenas(gymId: number): number {
    return this.resenasDe(gymId).length;
  }

  instructoresDe(gymId: number): Instructor[] {
    return this.instructoresService.listar().filter((i) => i.gimnasioId === gymId);
  }

  seleccionarPlanModal(plan: 'mensual' | 'diario'): void {
    this.planModalSeleccionado.set(plan);
  }

  formatoPrecioPlanModal(g: Gimnasio): string {
    const base =
      this.planModalSeleccionado() === 'mensual' ? g.precio : Math.max(1, Math.round(g.precio / 10));
    const valor = g.moneda === 'COP' ? base.toLocaleString('es-CO') : base.toLocaleString('en-US');
    const simbolo = g.moneda === 'COP' ? '$' : g.moneda === 'EUR' ? '€' : '$';
    return `${simbolo}${valor} ${g.moneda}`;
  }

  irAReservar(): void {
    this.mostrarFormularioReserva.set(true);
    this.reservaErrorMensaje.set('');
    this.reservaExitoMensaje.set('');
    const scroller = this.modalScrollerRef?.nativeElement;
    const card = scroller?.querySelector('#gym-booking-sidebar') as HTMLElement | null;
    if (card && scroller && scroller.scrollTop > 520) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  abrirMapa(gym: Gimnasio): void {
    const ubicacion = [gym.nombre, gym.direccion, gym.barrio, gym.ciudad, gym.pais]
      .filter((p) => !!p?.trim())
      .join(', ');
    const direccionEncoded = encodeURIComponent(ubicacion);
    window.open(`https://www.google.com/maps/search/?api=1&query=${direccionEncoded}`, '_blank', 'noopener,noreferrer');
  }

  async confirmarPagoMembresiaModal(gym: Gimnasio): Promise<void> {
    const { nombre, cedula, correo, celular, direccionResidencia, metodoPago } = this.formReserva;
    if (!nombre.trim() || !cedula.trim() || !correo.trim() || !celular.trim() || !direccionResidencia.trim()) {
      this.reservaErrorMensaje.set(
        'Por favor completa nombre, cédula, correo, celular y dirección de residencia.'
      );
      return;
    }
    const tipoMembresia = this.planModalSeleccionado() === 'mensual' ? 'mensual' : 'diaria';
    const monto =
      this.planModalSeleccionado() === 'mensual' ? gym.precio : Math.max(10000, Math.round(gym.precio / 10));
    const concepto = `${tipoMembresia === 'mensual' ? 'Membresía Mensual' : 'Pase Diario'} · ${gym.nombre}`;

    const resultado = await this.wompiService.pagarConSandbox({
      concepto,
      monto,
      moneda: gym.moneda || 'COP',
      usuario: nombre.trim(),
      correo: correo.trim(),
      cedula: cedula.trim(),
      celular: celular.trim(),
      gimnasioNombre: gym.nombre,
      metodoInicial: metodoPago,
    });

    if (!resultado?.aprobado) {
      return;
    }

    const afiliado = this.contabilidadService.registrarPagoMembresia({
      gimnasioId: gym.id,
      gimnasioNombre: gym.nombre,
      nombre,
      cedula,
      correo,
      celular,
      direccionResidencia,
      tipoMembresia,
      monto,
      moneda: gym.moneda,
      metodoPago: resultado.metodoNombre,
      estadoPago: resultado.estadoPago,
      pasarela: resultado.pasarela,
      referenciaPago: resultado.referencia,
      fechaHoraPago: resultado.fechaHora,
    });

    await this.pagosService.confirmarPagoPasarela({
      concepto,
      monto,
      metodoNombre: resultado.metodoNombre,
      pasarela: resultado.pasarela,
      referencia: resultado.referencia,
      usuario: nombre.trim(),
      cedula: cedula.trim(),
      correo: correo.trim(),
      gimnasioNombre: gym.nombre,
    });

    this.reservaErrorMensaje.set('');
    this.mostrarFormularioReserva.set(false);
    this.reservaExitoMensaje.set(
      `Transferencia ${resultado.estadoPago} (${resultado.referencia}). Ingreso en ${gym.nombre} habilitado con Cédula N.° ${afiliado.cedula} el ${resultado.fechaHora}.`
    );
    this.toastMensaje.emit(`Pago aprobado (${resultado.referencia}) · Cédula ${afiliado.cedula}`);
    this.mostrarToastEnModal(`Pago aprobado en PostgreSQL (${resultado.referencia})`);
  }

  private mostrarToastEnModal(msg: string): void {
    this.localToast.set(msg);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.localToast.set('');
    }, 2800);
  }
}
