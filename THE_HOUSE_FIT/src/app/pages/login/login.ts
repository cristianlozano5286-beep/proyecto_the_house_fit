import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef,
  NgZone,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CargaInicialService } from '../../services/carga-inicial';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle';

export interface EscenaBleap {
  id: string;
  numero: string;
  etiquetaCorta: string;
  palabraSans: string;
  palabraSerif: string;
  palabraBento: string;
  subtituloBento: string;
  metricaValor: string;
  metricaLabel: string;
  descripcion: string;
  imagenPrincipal: string;
  imagenSecundaria: string;
  posicionY: string;
}

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, ThemeToggleComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  email: string = '';
  password: string = '';
  mensaje: string = '';
  cargando: boolean = false;
  mostrarPassword: boolean = false;
  paso: 'credenciales' | 'password' = 'credenciales';

  // Control de la secuencia de Intro Cinemática estilo Bleap al entrar a la página
  // Fases:
  // 1: "Todo • evolucionó" (0.0s - 1.6s)
  // 2: "Tu forma de entrenar no." -> Flash de luz -> "Así que la reconstruimos." + Giro de Logo (1.6s - 3.6s)
  // 3: Ensamblaje de Cuadrícula Bento Arquitectónica + "Focus / Earn" + 4 Fotos + Contador (3.6s - 5.6s)
  // 4: Tarjetas 3D Flotando en Profundidad (Depth-of-Field) + "beyond limits" + Logo The House Fit (5.6s - 7.5s)
  // 5: Desvanecimiento suave hacia el Login Apple Glass (7.5s - 8.1s)
  introActiva: boolean = true;
  introSaliendo: boolean = false;
  faseIntro: 1 | 2 | 3 | 4 = 1;
  subFaseActo2: 'negacion' | 'reconstruimos' | 'logo' = 'negacion';
  palabraBentoIntro: 'Focus' | 'Supera' = 'Focus';
  private introTimers: any[] = [];

  // Control de bloqueo de navegación cuando el usuario aún no ha iniciado sesión
  rutaDestinoPendiente: string = '';
  seccionBloqueadaNombre: string = '';
  resaltarFormulario: boolean = false;
  private autoSlideTimer: any = null;
  pausarAutoSlide: boolean = false;

  // 4 Escenas inspiradas en Bleap ("Everything • evolved") con las 4 fotos del usuario
  indiceEscenaActiva: number = 0;
  readonly escenasHero: EscenaBleap[] = [
    {
      id: 'focus',
      numero: '01',
      etiquetaCorta: 'FOCUS',
      palabraSans: 'El entrenamiento',
      palabraSerif: 'evolucionó.',
      palabraBento: 'Focus',
      subtituloBento: 'Mentalidad inquebrantable · Sedes verificadas',
      metricaValor: '+1,480',
      metricaLabel: 'ATLETAS ENFOCADOS HOY',
      descripcion:
        'Un ecosistema diseñado desde cero donde tus reservas, rutinas Pro y biometría convergen en un solo lugar.',
      imagenPrincipal: 'assets/login/focus-athlete.jpg',
      imagenSecundaria: 'assets/login/you-vs-you-gym.jpg',
      posicionY: '35%',
    },
    {
      id: 'wings',
      numero: '02',
      etiquetaCorta: 'AESTHETICS',
      palabraSans: 'Tu físico',
      palabraSerif: 'reconstruido.',
      palabraBento: 'Evolve',
      subtituloBento: 'Biomecánica · Hipertrofia · Nutrición clínica',
      metricaValor: '98.6%',
      metricaLabel: 'PRECISIÓN BIOMÉTRICA',
      descripcion:
        'Esculpe tu mejor versión con planes metabólicos exactos y seguimiento real de tu progreso serie tras serie.',
      imagenPrincipal: 'assets/login/winged-statue.jpg',
      imagenSecundaria: 'assets/login/focus-athlete.jpg',
      posicionY: '28%',
    },
    {
      id: 'youvsyou',
      numero: '03',
      etiquetaCorta: 'YOU VS YOU',
      palabraSans: 'Más allá',
      palabraSerif: 'del límite.',
      palabraBento: 'Conquer',
      subtituloBento: 'Tú contra ti mismo en cada entrenamiento',
      metricaValor: '24/7',
      metricaLabel: 'ACCESO AL TEMPLO',
      descripcion:
        'Conecta con los gimnasios mejor equipados, entrenadores certificados y suplementación élite sin intermediarios.',
      imagenPrincipal: 'assets/login/you-vs-you-gym.jpg',
      imagenSecundaria: 'assets/login/legend-pose.jpg',
      posicionY: '45%',
    },
    {
      id: 'legacy',
      numero: '04',
      etiquetaCorta: 'LEGADO',
      palabraSans: 'La disciplina',
      palabraSerif: 'permanece.',
      palabraBento: 'Legacy',
      subtituloBento: 'Fuerza clásica · Estándar de campeonato',
      metricaValor: '100%',
      metricaLabel: 'RENDIMIENTO PURO',
      descripcion:
        'Forja un legado que imponga respeto. Regístrate e inicia sesión para desbloquear todo el universo The House Fit.',
      imagenPrincipal: 'assets/login/legend-pose.jpg',
      imagenSecundaria: 'assets/login/winged-statue.jpg',
      posicionY: '30%',
    },
  ];

  // Interpolación suave (lerp) a 60fps para el movimiento 3D del ratón
  private targetMouseX = 0;
  private targetMouseY = 0;
  private currentMouseX = 0;
  private currentMouseY = 0;
  private rafId: number | null = null;

  private readonly onMouseMoveBound = (e: MouseEvent) => this.leerMouseObjetivo(e);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cargaInicial: CargaInicialService,
    private cdr: ChangeDetectorRef,
    private elRef: ElementRef<HTMLElement>,
    private ngZone: NgZone,
  ) {}

  get escenaActual(): EscenaBleap {
    return this.escenasHero[this.indiceEscenaActiva] || this.escenasHero[0];
  }

  ngOnInit(): void {
    // Aseguramos que al abrir /login no exista una sesión fantasma sin autenticar
    this.authService.cerrarSesion();

    // Ejecutamos la animación estilo Bleap cada vez que se entra a la página
    this.reproducirIntroBleap();

    this.route.queryParams.subscribe((params) => {
      if (params['email']) {
        this.email = params['email'];
        this.cdr.markForCheck();
      }
      if (params['destino']) {
        this.rutaDestinoPendiente = params['destino'];
      }
      if (params['bloqueado'] === '1') {
        const nombreSec = this.obtenerNombreSeccionPorRuta(params['destino'] || '/');
        this.seccionBloqueadaNombre = nombreSec;
        this.mensaje = `Inicia sesión o regístrate para entrar a ${nombreSec}.`;
        this.activarPulsoFormulario();
        this.cdr.markForCheck();
      }
    });

    if (typeof window !== 'undefined') {
      this.aplicarVariablesCss();

      this.ngZone.runOutsideAngular(() => {
        window.addEventListener('mousemove', this.onMouseMoveBound, { passive: true });
        this.iniciarLoopParallax();
      });

      this.iniciarAutoSlide();
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.onMouseMoveBound);
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
    }
    this.limpiarTimersIntro();
  }

  private limpiarTimersIntro(): void {
    for (const t of this.introTimers) {
      clearTimeout(t);
    }
    this.introTimers = [];
  }

  /**
   * Reproduce la película de introducción idéntica al ritmo del video Bleap (Pinterest).
   */
  reproducirIntroBleap(): void {
    this.limpiarTimersIntro();
    this.introActiva = true;
    this.introSaliendo = false;
    this.faseIntro = 1;
    this.subFaseActo2 = 'negacion';
    this.palabraBentoIntro = 'Focus';
    this.cdr.markForCheck();

    // 1.5s -> Acto 2A: "Tu forma de entrenar no."
    this.introTimers.push(
      setTimeout(() => {
        this.faseIntro = 2;
        this.subFaseActo2 = 'negacion';
        this.cdr.markForCheck();
      }, 1500),
    );

    // 2.35s -> Acto 2B: Barrido de luz líquida + "Así que la reconstruimos."
    this.introTimers.push(
      setTimeout(() => {
        this.subFaseActo2 = 'reconstruimos';
        this.cdr.markForCheck();
      }, 2350),
    );

    // 3.25s -> Acto 2C: Giro del isotipo oficial en el centro
    this.introTimers.push(
      setTimeout(() => {
        this.subFaseActo2 = 'logo';
        this.cdr.markForCheck();
      }, 3250),
    );

    // 3.95s -> Acto 3A: Cuadrícula Bento Arquitectónica ("Focus") + 4 Fotos
    this.introTimers.push(
      setTimeout(() => {
        this.faseIntro = 3;
        this.palabraBentoIntro = 'Focus';
        this.cdr.markForCheck();
      }, 3950),
    );

    // 4.95s -> Acto 3B: Cambio rápido dentro de la cuadrícula a "Supera" + Contador
    this.introTimers.push(
      setTimeout(() => {
        this.palabraBentoIntro = 'Supera';
        this.cdr.markForCheck();
      }, 4950),
    );

    // 5.9s -> Acto 4: Tarjetas 3D Flotando en Profundidad + "beyond limits" + Logo The House Fit
    this.introTimers.push(
      setTimeout(() => {
        this.faseIntro = 4;
        this.cdr.markForCheck();
      }, 5900),
    );

    // 7.7s -> Salida suave revelando el Login
    this.introTimers.push(
      setTimeout(() => {
        this.finalizarIntro();
      }, 7700),
    );
  }

  finalizarIntro(): void {
    this.limpiarTimersIntro();
    this.introSaliendo = true;
    this.cdr.markForCheck();

    this.introTimers.push(
      setTimeout(() => {
        this.introActiva = false;
        this.introSaliendo = false;
        this.cdr.markForCheck();
      }, 550),
    );
  }

  private iniciarAutoSlide(): void {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
    }
    this.autoSlideTimer = setInterval(() => {
      if (!this.pausarAutoSlide && !this.introActiva) {
        this.indiceEscenaActiva = (this.indiceEscenaActiva + 1) % this.escenasHero.length;
        this.cdr.markForCheck();
      }
    }, 5200);
  }

  seleccionarEscena(index: number): void {
    this.indiceEscenaActiva = index;
    this.pausarAutoSlide = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.pausarAutoSlide = false;
    }, 9000);
  }

  escenaAnterior(): void {
    const total = this.escenasHero.length;
    this.seleccionarEscena((this.indiceEscenaActiva - 1 + total) % total);
  }

  escenaSiguiente(): void {
    const total = this.escenasHero.length;
    this.seleccionarEscena((this.indiceEscenaActiva + 1) % total);
  }

  intentarIrASeccion(ruta: string, nombreSeccion: string): void {
    if (this.authService.estaAutenticado()) {
      this.router.navigateByUrl(ruta);
      return;
    }

    this.rutaDestinoPendiente = ruta;
    this.seccionBloqueadaNombre = nombreSeccion;
    this.mensaje = `Inicia sesión o regístrate para entrar a ${nombreSeccion}.`;
    this.activarPulsoFormulario();
    this.irAlFormulario();
    this.cdr.markForCheck();
  }

  private obtenerNombreSeccionPorRuta(ruta: string): string {
    const limpia = ruta.toLowerCase();
    if (limpia.includes('gimnasios')) return 'Sedes';
    if (limpia.includes('rutina')) return 'Rutinas';
    if (limpia.includes('tienda')) return 'Tienda';
    if (limpia.includes('imc')) return 'Lab IMC';
    if (limpia.includes('blog')) return 'Blog';
    if (limpia.includes('nutricion')) return 'Nutrición';
    return 'Inicio';
  }

  private activarPulsoFormulario(): void {
    this.resaltarFormulario = true;
    setTimeout(() => {
      this.resaltarFormulario = false;
      this.cdr.markForCheck();
    }, 1500);
  }

  private leerMouseObjetivo(event: MouseEvent): void {
    const w = Math.max(window.innerWidth, 1);
    const h = Math.max(window.innerHeight, 1);
    this.targetMouseX = (event.clientX / w - 0.5) * 2;
    this.targetMouseY = (event.clientY / h - 0.5) * 2;
  }

  private iniciarLoopParallax(): void {
    const tick = () => {
      const dMx = this.targetMouseX - this.currentMouseX;
      const dMy = this.targetMouseY - this.currentMouseY;

      if (Math.abs(dMx) > 0.001 || Math.abs(dMy) > 0.001) {
        this.currentMouseX += dMx * 0.09;
        this.currentMouseY += dMy * 0.09;
        this.aplicarVariablesCss();
      }

      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private aplicarVariablesCss(): void {
    const host = this.elRef.nativeElement;
    host.style.setProperty('--mx', this.currentMouseX.toFixed(4));
    host.style.setProperty('--my', this.currentMouseY.toFixed(4));
  }

  irAlFormulario(): void {
    if (this.introActiva) {
      this.finalizarIntro();
    }
    setTimeout(() => {
      const input = document.getElementById('emailInput') as HTMLInputElement | null;
      input?.focus({ preventScroll: false });
    }, 120);
    this.activarPulsoFormulario();
  }

  volverArriba(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async login(): Promise<void> {
    if (!this.email.trim()) {
      this.mensaje = 'Por favor ingresa tu correo electrónico.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.password) {
      this.mensaje = 'Por favor ingresa tu contraseña para continuar.';
      this.cdr.markForCheck();
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.cdr.markForCheck();

    try {
      const error = await this.authService.iniciarSesion(this.email, this.password);

      if (error) {
        this.mensaje = error;
        return;
      }

      await this.cargaInicial.cargarPrivados();

      if (this.rutaDestinoPendiente && this.rutaDestinoPendiente !== '/login') {
        await this.router.navigateByUrl(this.rutaDestinoPendiente);
      } else {
        await this.router.navigate(['/panel/dashboard']);
      }
    } catch (err: any) {
      console.error('Error durante el inicio de sesión:', err);
      this.mensaje = err?.message || 'Error de conexión con el servidor. Intenta de nuevo.';
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  get faltaVerificar(): boolean {
    return this.mensaje.toLowerCase().includes('verifica');
  }

  irAVerificar(): void {
    this.router.navigate(['/register'], { queryParams: { verificar: this.email.trim().toLowerCase() } });
  }

  irAPublicaTuGym(): void {
    this.router.navigate(['/register'], { queryParams: { tipo: 'anfitrion' } });
  }

  loginSocial(red: string): void {
    const proveedor = red === 'google' ? 'Google' : 'Apple';
    if (!this.email.trim()) {
      this.mensaje = `Ingresa tu correo o regístrate para continuar con ${proveedor}.`;
      this.irAlFormulario();
      this.cdr.markForCheck();
      return;
    }
    this.login();
  }
}
