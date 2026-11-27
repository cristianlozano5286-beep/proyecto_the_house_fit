import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth';
import { GimnasiosService } from '../../services/gimnasios';
import { Gimnasio } from '../../models/catalogo.models';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle';

@Component({
  selector: 'app-public-nav',
  imports: [RouterLink, RouterLinkActive, FormsModule, ThemeToggleComponent],
  templateUrl: './public-nav.html',
  styleUrl: './public-nav.css',
})
export class PublicNavComponent implements OnInit, AfterViewInit, OnDestroy {
  menuAbierto = false;
  closingMenu = false;
  closingBuscador = false;
  private readonly scrolledState = signal(false);
  private readonly buscadorAbiertoState = signal(false);
  modalInstalarAbierto = false;
  esModoStandalone = false;
  private deferredInstallPrompt: any = null;
  private supportsDisplayTransition?: boolean;
  private closeBuscadorTimer: ReturnType<typeof setTimeout> | null = null;
  private closeMenuTimer: ReturnType<typeof setTimeout> | null = null;
  private gliderSyncTimer: ReturnType<typeof setTimeout> | null = null;
  private pillResizeObserver?: ResizeObserver;

  // Geometría compositor-friendly para glider y panel anclado al segmento
  gliderX = 0;
  gliderWidth = 0;
  panelX = 0;
  panelWidth = 460;
  panelOrigin = '18% top';
  tabDir: 'next' | 'prev' = 'next';
  private readonly ordenSecciones: Record<'donde' | 'servicio' | 'precio', number> = {
    donde: 0,
    servicio: 1,
    precio: 2,
  };

  get scrolled(): boolean {
    return this.scrolledState();
  }

  set scrolled(value: boolean) {
    this.scrolledState.set(value);
  }

  // Estado del buscador interactivo
  get buscadorAbierto(): boolean {
    return this.buscadorAbiertoState();
  }

  set buscadorAbierto(value: boolean) {
    this.buscadorAbiertoState.set(value);
  }

  seccionActiva: 'donde' | 'servicio' | 'precio' = 'donde';
  textoBusqueda = '';
  ciudadFiltro = '';
  servicioFiltro = '';
  precioMaxFiltro: number | null = null;
  precioManualTexto = '';

  private scrollRafId: number | null = null;
  private scrollAlAbrirBuscador = 0;
  private routerSub?: Subscription;

  private readonly boundScrollHandler = (event?: Event): void => {
    if (this.esScrollInternoIgnorable(event?.target)) {
      return;
    }
    this.procesarScrollFrame(event);
    if (this.scrollRafId === null && typeof window !== 'undefined') {
      this.scrollRafId = requestAnimationFrame(() => {
        this.scrollRafId = null;
        this.procesarScrollFrame();
      });
    }
  };

  constructor(
    private authService: AuthService,
    private gimnasiosService: GimnasiosService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private elRef: ElementRef<HTMLElement>
  ) {
    this.sincronizarAlturaHeader();
    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        if (typeof window !== 'undefined') {
          this.scrolled = this.obtenerScrollY() > 36;
          this.sincronizarAlturaHeader();
          this.cdr.markForCheck();
          requestAnimationFrame(() => {
            this.scrolled = this.obtenerScrollY() > 36;
            this.sincronizarAlturaHeader();
            this.cdr.markForCheck();
          });
        }
      });
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.scrolled = this.obtenerScrollY() > 36;
      this.esModoStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      this.sincronizarAlturaHeader();
      if (this.authService.estaAutenticado()) {
        this.authService.sincronizarPerfil().then(() => this.cdr.markForCheck());
      }
      this.ngZone.runOutsideAngular(() => {
        window.addEventListener('scroll', this.boundScrollHandler, {
          passive: true,
          capture: true,
        });
      });
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event): void {
    this.boundScrollHandler(event);
  }

  @HostListener('document:scroll', ['$event'])
  onDocumentScroll(event: Event): void {
    this.boundScrollHandler(event);
  }

  @HostListener('window:wheel')
  @HostListener('window:touchmove')
  onPointerScrollActivity(): void {
    if (typeof document !== 'undefined' && document.querySelector('.airbnb-modal-backdrop')) {
      return;
    }
    if (this.scrollRafId === null && typeof window !== 'undefined') {
      this.scrollRafId = requestAnimationFrame(() => {
        this.scrollRafId = null;
        this.procesarScrollFrame();
      });
    }
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(event: Event): void {
    event.preventDefault();
    this.deferredInstallPrompt = event;
    this.cdr.markForCheck();
  }

  async instalarAppMovil(): Promise<void> {
    this.cerrarMenu();
    if (this.deferredInstallPrompt) {
      this.deferredInstallPrompt.prompt();
      const choice = await this.deferredInstallPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        this.deferredInstallPrompt = null;
      }
      this.cdr.markForCheck();
      return;
    }
    this.modalInstalarAbierto = true;
    this.cdr.markForCheck();
  }

  cerrarModalInstalar(): void {
    this.modalInstalarAbierto = false;
    this.cdr.markForCheck();
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;
    const container = this.elRef.nativeElement.querySelector<HTMLElement>('.nav-search-container');
    if (container && typeof ResizeObserver !== 'undefined') {
      this.pillResizeObserver = new ResizeObserver(() => {
        if (this.buscadorAbierto) {
          this.actualizarGeometriaBuscador();
        }
      });
      this.pillResizeObserver.observe(container);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.boundScrollHandler, { capture: true });
      if (this.scrollRafId !== null) {
        cancelAnimationFrame(this.scrollRafId);
        this.scrollRafId = null;
      }
    }
    this.pillResizeObserver?.disconnect();
    if (this.closeBuscadorTimer) clearTimeout(this.closeBuscadorTimer);
    if (this.closeMenuTimer) clearTimeout(this.closeMenuTimer);
    if (this.gliderSyncTimer) clearTimeout(this.gliderSyncTimer);
    this.routerSub?.unsubscribe();
  }

  private esScrollInternoIgnorable(target: EventTarget | null | undefined): boolean {
    if (typeof document !== 'undefined' && document.querySelector('.airbnb-modal-backdrop')) {
      return true;
    }
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    if (target === document.documentElement || target === document.body) {
      return false;
    }
    return Boolean(
      target.classList.contains('search-modal-scrollable-content') ||
        target.classList.contains('modal-scrollable-body') ||
        target.closest('.airbnb-modal-backdrop') ||
        target.closest('.airbnb-modal-card') ||
        target.closest('.nav-search-dropdown-panel') ||
        target.closest('.airbnb-user-dropdown') ||
        target.closest('.modal-content') ||
        target.closest('.dialog-card')
    );
  }

  private obtenerScrollY(event?: Event): number {
    if (typeof window === 'undefined') {
      return 0;
    }
    let targetScrollTop = 0;
    const target = event?.target;
    if (
      target instanceof HTMLElement &&
      !this.esScrollInternoIgnorable(target) &&
      target.scrollHeight > target.clientHeight
    ) {
      targetScrollTop = target.scrollTop || 0;
    }
    return Math.max(
      window.scrollY || 0,
      window.pageYOffset || 0,
      document.scrollingElement?.scrollTop || 0,
      document.documentElement?.scrollTop || 0,
      document.body?.scrollTop || 0,
      targetScrollTop
    );
  }

  private procesarScrollFrame(event?: Event): void {
    if (typeof window === 'undefined') {
      return;
    }
    const y = this.obtenerScrollY(event);

    // Histéresis para evitar rebotes o parpadeos cerca del umbral superior
    let nuevoScrolled = this.scrolled;
    if (!this.scrolled && y > 36) {
      nuevoScrolled = true;
    } else if (this.scrolled && y < 10) {
      nuevoScrolled = false;
    }

    const debeCerrarBuscador =
      this.buscadorAbierto && Math.abs(y - this.scrollAlAbrirBuscador) > 48;

    if (nuevoScrolled !== this.scrolled || debeCerrarBuscador) {
      this.scrolled = nuevoScrolled;
      if (debeCerrarBuscador) {
        this.cerrarBuscador();
      }
      this.sincronizarAlturaHeader();
      this.cdr.markForCheck();
      try {
        this.cdr.detectChanges();
      } catch {
        // Ignorar si la vista está en medio de un ciclo de verificación o HMR
      }
    }
  }

  get expandido(): boolean {
    return !this.scrolled || this.buscadorAbierto;
  }

  private sincronizarAlturaHeader(): void {
    if (typeof document !== 'undefined') {
      const expandidoActual = this.expandido;
      // Mantenemos --public-nav-height constante en 152px para evitar reflujos de layout (CLS) al hacer scroll
      document.documentElement.style.setProperty('--public-nav-height', '152px');
      document.documentElement.classList.toggle('nav-is-scrolled', this.scrolled);

      const hostHeader = this.elRef?.nativeElement?.querySelector<HTMLElement>('header.airbnb-nav');
      if (hostHeader) {
        hostHeader.classList.toggle('scrolled', this.scrolled);
        hostHeader.classList.toggle('is-expanded', expandidoActual);
        hostHeader.classList.toggle('is-compact', !expandidoActual);
      }

      const headers = document.querySelectorAll<HTMLElement>('header.airbnb-nav');
      headers.forEach((h) => {
        h.classList.toggle('scrolled', this.scrolled);
        h.classList.toggle('is-expanded', expandidoActual);
        h.classList.toggle('is-compact', !expandidoActual);
      });
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-pill-wrapper')) {
      this.cerrarMenu();
    }
    if (!target.closest('.nav-search-container') && !target.closest('.compact-docked-pill')) {
      if (this.buscadorAbierto) {
        this.cerrarBuscador();
      }
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.cerrarBuscador();
    this.cerrarMenu();
  }

  // --- Auth & Usuario ---
  get autenticado(): boolean {
    return this.authService.estaAutenticado();
  }

  get nombreUsuario(): string {
    return this.authService.obtenerNombre() || 'Mi Cuenta';
  }

  get inicialUsuario(): string {
    const nombre = this.authService.obtenerNombre();
    return nombre ? nombre.charAt(0).toUpperCase() : 'U';
  }

  get rolUsuario(): string {
    return this.authService.obtenerRol() || 'Usuario';
  }

  get correoUsuario(): string {
    return this.authService.obtenerCorreo();
  }

  get fotoPerfilUsuario(): string {
    return this.authService.obtenerFotoPerfil();
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    if (this.menuAbierto) {
      this.cerrarMenu();
    } else {
      if (this.closeMenuTimer) {
        clearTimeout(this.closeMenuTimer);
        this.closeMenuTimer = null;
      }
      this.closingMenu = false;
      this.menuAbierto = true;
      if (this.buscadorAbierto) {
        this.cerrarBuscador();
      }
    }
  }

  cerrarMenu(): void {
    if (!this.menuAbierto) return;
    if (this.canTransitionDisplay()) {
      this.menuAbierto = false;
      this.closingMenu = false;
      return;
    }
    this.closingMenu = true;
    this.menuAbierto = false;
    if (this.closeMenuTimer) clearTimeout(this.closeMenuTimer);
    this.closeMenuTimer = setTimeout(() => {
      this.closingMenu = false;
      this.cdr.markForCheck();
    }, 180);
  }

  get esPaginaCatalogo(): boolean {
    return this.router.url.includes('/gimnasios');
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.cerrarMenu();
    this.router.navigate(['/login']);
  }

  // --- Buscador Interactivo ---
  cambiarSeccion(seccion: 'donde' | 'servicio' | 'precio'): void {
    this.tabDir =
      this.ordenSecciones[seccion] >= this.ordenSecciones[this.seccionActiva]
        ? 'next'
        : 'prev';
    this.seccionActiva = seccion;
    this.sincronizarGeometriaConFrames();
  }

  abrirBuscador(seccion: 'donde' | 'servicio' | 'precio' = 'donde', event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.closeBuscadorTimer) {
      clearTimeout(this.closeBuscadorTimer);
      this.closeBuscadorTimer = null;
    }
    this.closingBuscador = false;
    this.tabDir =
      this.ordenSecciones[seccion] >= this.ordenSecciones[this.seccionActiva]
        ? 'next'
        : 'prev';
    this.seccionActiva = seccion;
    this.buscadorAbierto = true;
    this.cerrarMenu();
    if (typeof window !== 'undefined') {
      this.scrollAlAbrirBuscador = this.obtenerScrollY();
    }
    this.sincronizarAlturaHeader();
    this.sincronizarGeometriaConFrames();
  }

  toggleBuscador(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.buscadorAbierto) {
      this.cerrarBuscador();
    } else {
      this.abrirBuscador(this.seccionActiva, event);
    }
  }

  cerrarBuscador(): void {
    if (!this.buscadorAbierto) return;
    if (this.canTransitionDisplay()) {
      this.buscadorAbierto = false;
      this.closingBuscador = false;
      this.sincronizarAlturaHeader();
      return;
    }
    this.closingBuscador = true;
    this.buscadorAbierto = false;
    this.sincronizarAlturaHeader();
    if (this.closeBuscadorTimer) clearTimeout(this.closeBuscadorTimer);
    this.closeBuscadorTimer = setTimeout(() => {
      this.closingBuscador = false;
      this.cdr.markForCheck();
    }, 200);
  }

  private sincronizarGeometriaConFrames(): void {
    if (typeof window === 'undefined') return;
    requestAnimationFrame(() => this.actualizarGeometriaBuscador());
    if (this.gliderSyncTimer) clearTimeout(this.gliderSyncTimer);
    this.gliderSyncTimer = setTimeout(() => {
      this.actualizarGeometriaBuscador();
    }, 230);
  }

  private actualizarGeometriaBuscador(): void {
    if (typeof window === 'undefined') return;
    const host = this.elRef.nativeElement;
    const container = host.querySelector<HTMLElement>('.nav-search-container');
    const pill = host.querySelector<HTMLElement>('.nav-search-pill');
    const seg = pill?.querySelector<HTMLElement>(`[data-seg="${this.seccionActiva}"]`);

    if (pill && seg) {
      this.gliderX = seg.offsetLeft;
      this.gliderWidth = seg.offsetWidth;
    }

    if (container) {
      const containerW = container.offsetWidth || 780;
      if (window.innerWidth <= 768) {
        this.panelWidth = Math.min(containerW, window.innerWidth - 24);
        this.panelX = 0;
        this.panelOrigin = 'top center';
      } else if (this.seccionActiva === 'donde') {
        this.panelWidth = Math.min(476, containerW);
        this.panelX = 0;
        this.panelOrigin = '18% top';
      } else if (this.seccionActiva === 'servicio') {
        this.panelWidth = Math.min(580, containerW);
        this.panelX = Math.max(0, Math.round((containerW - this.panelWidth) / 2));
        this.panelOrigin = '50% top';
      } else {
        this.panelWidth = Math.min(476, containerW);
        this.panelX = Math.max(0, containerW - this.panelWidth);
        this.panelOrigin = '82% top';
      }
    }

    this.cdr.markForCheck();
  }

  private canTransitionDisplay(): boolean {
    if (this.supportsDisplayTransition !== undefined) {
      return this.supportsDisplayTransition;
    }
    if (
      typeof window === 'undefined' ||
      typeof document === 'undefined' ||
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
    this.supportsDisplayTransition = getComputedStyle(probe).display === 'block';
    probe.remove();
    return this.supportsDisplayTransition;
  }

  onBotonBuscarClick(event: Event): void {
    event.stopPropagation();
    if (this.buscadorAbierto && (this.hayFiltrosActivos || this.totalResultados > 0)) {
      this.ejecutarBusqueda();
    } else {
      this.abrirBuscador('donde', event);
    }
  }

  seleccionarCiudad(c: string): void {
    this.ciudadFiltro = this.ciudadFiltro === c ? '' : c;
    if (this.ciudadFiltro) {
      this.textoBusqueda = '';
    }
  }

  seleccionarServicio(s: string): void {
    this.servicioFiltro = this.servicioFiltro === s ? '' : s;
  }

  seleccionarPrecio(p: number | null): void {
    const nuevo = this.precioMaxFiltro === p ? null : p;
    this.precioMaxFiltro = nuevo;
    this.precioManualTexto = nuevo !== null ? String(nuevo) : '';
  }

  onPrecioManualInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const soloDigitos = input.value.replace(/\D/g, '');
    if (input.value !== soloDigitos) {
      input.value = soloDigitos;
    }
    this.precioManualTexto = soloDigitos;
    if (!soloDigitos) {
      this.precioMaxFiltro = null;
      return;
    }
    const numero = Number(soloDigitos);
    this.precioMaxFiltro = Number.isFinite(numero) && numero > 0 ? numero : null;
  }

  limpiarPrecioManual(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.precioMaxFiltro = null;
    this.precioManualTexto = '';
  }

  limpiarFiltros(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.textoBusqueda = '';
    this.ciudadFiltro = '';
    this.servicioFiltro = '';
    this.precioMaxFiltro = null;
    this.precioManualTexto = '';
  }

  get hayFiltrosActivos(): boolean {
    return Boolean(this.textoBusqueda.trim() || this.ciudadFiltro || this.servicioFiltro || this.precioMaxFiltro !== null);
  }

  get etiquetaDonde(): string {
    if (this.ciudadFiltro) return this.ciudadFiltro;
    if (this.textoBusqueda.trim()) return this.textoBusqueda.trim();
    return 'Explora gimnasios';
  }

  get etiquetaServicio(): string {
    return this.servicioFiltro || 'CrossFit, Pesas...';
  }

  get etiquetaPrecio(): string {
    if (this.precioMaxFiltro !== null && this.precioMaxFiltro > 0) {
      return `≤ $${this.precioMaxFiltro.toLocaleString('es-CO')}`;
    }
    return 'Flexible';
  }

  get ciudadesDisponibles(): string[] {
    return this.gimnasiosService.ciudadesDisponibles();
  }

  get serviciosDisponibles(): string[] {
    return [
      'Musculación',
      'Crossfit',
      'Yoga',
      'Spinning',
      'Cardio',
      'Entrenamiento funcional',
      'Calistenia',
      'Boxeo',
      'Powerlifting',
      'Pilates',
    ];
  }

  get gimnasiosFiltradosPreview(): Gimnasio[] {
    const todos = this.gimnasiosService.listar().filter((g) => g.activo);
    const texto = this.textoBusqueda.trim().toLowerCase();
    const ciudad = this.ciudadFiltro.trim().toLowerCase();

    return todos.filter((g) => {
      // Coincidencia por texto
      const coincideTexto =
        texto === '' ||
        g.nombre.toLowerCase().includes(texto) ||
        g.barrio.toLowerCase().includes(texto) ||
        g.ciudad.toLowerCase().includes(texto) ||
        g.servicios.some((s) => s.toLowerCase().includes(texto));

      // Coincidencia por ciudad chip
      const coincideCiudad = ciudad === '' || g.ciudad.toLowerCase() === ciudad;

      // Coincidencia por disciplina
      const coincideServicio =
        this.servicioFiltro === '' ||
        g.servicios.some((s) => s.toLowerCase() === this.servicioFiltro.toLowerCase());

      // Coincidencia por precio
      const coincidePrecio =
        this.precioMaxFiltro === null || g.precio <= this.precioMaxFiltro;

      return coincideTexto && coincideCiudad && coincideServicio && coincidePrecio;
    });
  }

  get totalResultados(): number {
    return this.gimnasiosFiltradosPreview.length;
  }

  ejecutarBusqueda(): void {
    const queryParams: Record<string, string | number> = {};
    const termino = this.textoBusqueda.trim() || this.ciudadFiltro.trim();
    if (termino) queryParams['q'] = termino;
    if (this.servicioFiltro) queryParams['servicio'] = this.servicioFiltro;
    if (this.precioMaxFiltro !== null) queryParams['precioMax'] = this.precioMaxFiltro;

    this.cerrarBuscador();
    this.router.navigate(['/gimnasios'], { queryParams });
  }

  irAGimnasio(gym: Gimnasio): void {
    this.cerrarBuscador();
    this.router.navigate(['/gimnasios'], { queryParams: { q: gym.nombre } });
  }

  formatoPrecio(g: Gimnasio): string {
    const valor =
      g.moneda === 'COP'
        ? g.precio.toLocaleString('es-CO')
        : g.precio.toLocaleString('en-US');
    const simbolo = g.moneda === 'COP' ? '$' : g.moneda === 'EUR' ? '€' : '$';
    return `${simbolo}${valor} ${g.moneda}`;
  }

  obtenerIconoServicio(s: string): string {
    const lower = s.toLowerCase();
    if (lower.includes('muscul') || lower.includes('pesa')) return '🏋️';
    if (lower.includes('cross')) return '🔥';
    if (lower.includes('yoga')) return '🧘';
    if (lower.includes('spin') || lower.includes('bici')) return '🚴';
    if (lower.includes('cardio')) return '🏃';
    if (lower.includes('funcional')) return '🎯';
    if (lower.includes('calistenia')) return '🤸';
    if (lower.includes('box')) return '🥊';
    if (lower.includes('power')) return '🏆';
    if (lower.includes('pilates')) return '🌿';
    if (lower.includes('zumba')) return '💃';
    return '⚡';
  }
}
