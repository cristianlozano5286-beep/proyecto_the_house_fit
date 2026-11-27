import { Injectable, OnDestroy, computed, signal } from '@angular/core';

export type EsquemaColor = 'light' | 'dark';

const STORAGE_KEY = 'color-scheme';

interface ViewTransitionLike {
  ready: Promise<void>;
  finished: Promise<void>;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService implements OnDestroy {
  private readonly temaResueltoSignal = signal<EsquemaColor>('dark');
  readonly temaActual = this.temaResueltoSignal.asReadonly();
  readonly esClaro = computed(() => this.temaResueltoSignal() === 'light');
  readonly esOscuro = computed(() => this.temaResueltoSignal() === 'dark');

  private mediaQuery?: MediaQueryList;
  private transicionActiva = false;

  private readonly onSystemChange = (): void => {
    // Nunca borramos el valor guardado en localStorage al cambiar el SO;
    // solo actualizamos el estado resuelto si el usuario está siguiendo el sistema.
    const stored = this.leerPreferenciaGuardada();
    if (!stored) {
      this.sincronizarDOM('light dark');
    }
  };

  private readonly onStorageSync = (event: StorageEvent): void => {
    if (event.key !== STORAGE_KEY && event.key !== null) {
      return;
    }
    const stored = this.leerPreferenciaGuardada();
    this.sincronizarDOM(stored ?? 'light dark');
  };

  constructor() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const stored = this.leerPreferenciaGuardada();
    this.sincronizarDOM(stored ?? 'light dark');

    if (typeof window.matchMedia === 'function') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener?.('change', this.onSystemChange);
    }
    window.addEventListener('storage', this.onStorageSync);
  }

  ngOnDestroy(): void {
    if (typeof window === 'undefined') return;
    this.mediaQuery?.removeEventListener?.('change', this.onSystemChange);
    window.removeEventListener('storage', this.onStorageSync);
  }

  /**
   * Alterna entre tema oscuro y claro con la animación de onda circular radial
   * (View Transitions API + WAAPI clip-path) partiendo desde el botón pulsado.
   */
  alternarTema(event?: MouseEvent): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }
    if (this.transicionActiva) {
      return;
    }

    const actual = this.obtenerEsquemaRenderizado();
    const destino: EsquemaColor = actual === 'dark' ? 'light' : 'dark';
    const sistema = this.obtenerPreferenciaSistema();

    const aplicarCambio = () => {
      if (destino !== sistema) {
        this.guardarPreferencia(destino);
        this.sincronizarDOM(destino);
      } else {
        this.limpiarPreferencia();
        this.sincronizarDOM('light dark');
      }
    };

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => ViewTransitionLike;
    };

    if (typeof doc.startViewTransition !== 'function') {
      aplicarCambio();
      return;
    }

    const triggerEl =
      event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    let originX = window.innerWidth - 52;
    let originY = 34;
    if (triggerEl) {
      const rect = triggerEl.getBoundingClientRect();
      originX = rect.left + rect.width / 2;
      originY = rect.top + rect.height / 2;
    } else if (event && (event.clientX > 0 || event.clientY > 0)) {
      originX = event.clientX;
      originY = event.clientY;
    }

    const rootEl = document.documentElement;
    this.transicionActiva = true;

    if (reduceMotion) {
      rootEl.classList.add('thf-theme-vt-reduced');
      const vt = doc.startViewTransition(() => aplicarCambio());
      vt.finished.finally(() => {
        rootEl.classList.remove('thf-theme-vt-reduced');
        this.transicionActiva = false;
      });
      return;
    }

    rootEl.classList.add('thf-theme-vt');
    const vt = doc.startViewTransition(() => aplicarCambio());

    vt.ready
      .then(() => {
        const maxRadius = Math.hypot(
          Math.max(originX, window.innerWidth - originX),
          Math.max(originY, window.innerHeight - originY),
        );

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${originX}px ${originY}px)`,
              `circle(${maxRadius}px at ${originX}px ${originY}px)`,
            ],
          },
          {
            duration: 520,
            easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      })
      .catch(() => {
        // Fallback silencioso si la transición es interrumpida
      });

    vt.finished.finally(() => {
      rootEl.classList.remove('thf-theme-vt');
      this.transicionActiva = false;
      if (triggerEl && document.activeElement === document.body) {
        triggerEl.focus({ preventScroll: true });
      }
    });
  }

  private obtenerPreferenciaSistema(): EsquemaColor {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private obtenerEsquemaRenderizado(): EsquemaColor {
    const stored = this.leerPreferenciaGuardada();
    if (stored) {
      return stored;
    }
    return this.obtenerPreferenciaSistema();
  }

  private leerPreferenciaGuardada(): EsquemaColor | null {
    try {
      const val = localStorage.getItem(STORAGE_KEY);
      return val === 'light' || val === 'dark' ? val : null;
    } catch {
      return null;
    }
  }

  private guardarPreferencia(esquema: EsquemaColor): void {
    try {
      localStorage.setItem(STORAGE_KEY, esquema);
    } catch {
      // El tema se aplica igualmente aunque localStorage esté bloqueado
    }
  }

  private limpiarPreferencia(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignorar si el almacenamiento está restringido
    }
  }

  private sincronizarDOM(metaContent: 'light' | 'dark' | 'light dark'): void {
    if (typeof document === 'undefined') return;

    let meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'color-scheme';
      document.head.appendChild(meta);
    }
    meta.content = metaContent;

    const resuelto: EsquemaColor =
      metaContent === 'light' || metaContent === 'dark'
        ? metaContent
        : this.obtenerPreferenciaSistema();

    document.documentElement.dataset['theme'] = resuelto;
    this.temaResueltoSignal.set(resuelto);

    const bg = resuelto === 'light' ? '#f4f3ee' : '#12141a';
    const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.content = bg;
    }
    const bgColorMeta = document.querySelector<HTMLMetaElement>('meta[name="background-color"]');
    if (bgColorMeta) {
      bgColorMeta.content = bg;
    }
  }
}
