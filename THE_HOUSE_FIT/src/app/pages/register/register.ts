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
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../services/auth';
import { CargaInicialService } from '../../services/carga-inicial';

export interface EscenaMinimalRegister {
  id: string;
  numero: string;
  etiqueta: string;
  tituloSans: string;
  tituloSerif: string;
  palabraEditorial: string;
  subtituloEditorial: string;
  descripcionCorta: string;
  imagen: string;
  posicionY: string;
  metricaValor: string;
  metricaLabel: string;
}

@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent implements OnInit, OnDestroy {
  /** FORMULARIO PRINCIPAL DEL COMPONENTE */
  registerForm: FormGroup;

  /** Paso 1: formulario. Paso 2: verificación de correo (HU04, HU05) */
  paso: 1 | 2 = 1;
  codigoIngresado: string = '';
  mensajeVerificacion: string = '';
  correoRegistrado: string = '';
  esAnfitrion: boolean = false;
  cargandoSubmit: boolean = false;

  mostrarPassword: boolean = false;
  mostrarConfirmarPassword: boolean = false;

  // Control de aviso cuando el usuario intenta ir a una sección sin registrarse aún
  rutaDestinoPendiente: string = '';
  seccionBloqueadaNombre: string = '';
  resaltarFormulario: boolean = false;

  indiceEscena: number = 0;
  pausarAutoSlide: boolean = false;
  private autoSlideTimer: any = null;

  // Escenas para Registro de Usuario (Atleta) — Estilo Bento Arquitectónico igual a /login
  readonly escenasUsuario: EscenaMinimalRegister[] = [
    {
      id: 'focus',
      numero: '01',
      etiqueta: 'FOCUS',
      tituloSans: 'Tu disciplina',
      tituloSerif: 'evolucionó.',
      palabraEditorial: 'Focus',
      subtituloEditorial: 'Hipertrofia · Rutinas Pro · Sedes verificadas',
      descripcionCorta:
        'Crea tu pasaporte personal para reservar en gimnasios aliados, seguir planes biomecánicos y medir tu progreso.',
      imagen: 'assets/login/focus-athlete.jpg',
      posicionY: '28%',
      metricaValor: '+1,480',
      metricaLabel: 'ATLETAS ENFOCADOS HOY',
    },
    {
      id: 'visions',
      numero: '02',
      etiqueta: 'AESTHETICS',
      tituloSans: 'Tu físico',
      tituloSerif: 'reconstruido.',
      palabraEditorial: 'Evolve',
      subtituloEditorial: 'Precisión metabólica · Laboratorio IMC clínico',
      descripcionCorta:
        'Donde la estética clásica y la ciencia deportiva moderna convergen para esculpir tu mejor versión.',
      imagen: 'assets/login/winged-statue.jpg',
      posicionY: '22%',
      metricaValor: '98.6%',
      metricaLabel: 'PRECISIÓN BIOMÉTRICA',
    },
    {
      id: 'sanctuary',
      numero: '03',
      etiqueta: 'YOU VS YOU',
      tituloSans: 'Más allá',
      tituloSerif: 'del límite.',
      palabraEditorial: 'Conquer',
      subtituloEditorial: 'Tú contra ti mismo en cada entrenamiento',
      descripcionCorta:
        'Entrena en los templos mejor equipados del país con entrenadores certificados y suplementación oficial.',
      imagen: 'assets/login/you-vs-you-gym.jpg',
      posicionY: '18%',
      metricaValor: '24/7',
      metricaLabel: 'ACCESO AL TEMPLO',
    },
    {
      id: 'legacy',
      numero: '04',
      etiqueta: 'LEGADO',
      tituloSans: 'El estándar',
      tituloSerif: 'permanece.',
      palabraEditorial: 'Legacy',
      subtituloEditorial: 'Fuerza clásica · Nivel de campeonato',
      descripcionCorta:
        'Forja un legado de disciplina real. Regístrate en segundos y desbloquea todo el universo The House Fit.',
      imagen: 'assets/login/legend-pose.jpg',
      posicionY: '22%',
      metricaValor: '100%',
      metricaLabel: 'RENDIMIENTO PURO',
    },
  ];

  // Escenas para Registro de Anfitrión (Publica tu Gym) — Estilo Partner Sanctuary
  readonly escenasAnfitrion: EscenaMinimalRegister[] = [
    {
      id: 'host-sanctuary',
      numero: '01',
      etiqueta: 'SANCTUARY',
      tituloSans: 'Tu gimnasio',
      tituloSerif: 'en otra dimensión.',
      palabraEditorial: 'Sanctuary',
      subtituloEditorial: 'Vitrina digital 24/7 para sedes y centros de entrenamiento',
      descripcionCorta:
        'Posiciona tu sede frente a miles de atletas en tu ciudad y gestiona planes, horarios, instructores y reservas sin fricción.',
      imagen: 'assets/login/you-vs-you-gym.jpg',
      posicionY: '16%',
      metricaValor: '24/7',
      metricaLabel: 'VITRINA OFICIAL',
    },
    {
      id: 'host-visions',
      numero: '02',
      etiqueta: 'PRESTIGE',
      tituloSans: 'Arquitectura',
      tituloSerif: 'de alto nivel.',
      palabraEditorial: 'Prestige',
      subtituloEditorial: 'Sello de verificación oficial Creador Gym',
      descripcionCorta:
        'Destaca tus zonas de peso libre, maquinaria biomecánica y amenidades con una presentación visual de lujo.',
      imagen: 'assets/login/winged-statue.jpg',
      posicionY: '22%',
      metricaValor: 'PRO',
      metricaLabel: 'SELLO VERIFICADO',
    },
    {
      id: 'host-focus',
      numero: '03',
      etiqueta: 'GROWTH',
      tituloSans: 'Conecta con',
      tituloSerif: 'atletas reales.',
      palabraEditorial: 'Growth',
      subtituloEditorial: 'Asistente guiado paso a paso al crear tu cuenta',
      descripcionCorta:
        'Al completar tu registro de anfitrión entrarás directamente al publicador oficial para lanzar tu gimnasio hoy mismo.',
      imagen: 'assets/login/focus-athlete.jpg',
      posicionY: '26%',
      metricaValor: 'DIRECTO',
      metricaLabel: 'PASE AL PUBLICADOR',
    },
    {
      id: 'host-legacy',
      numero: '04',
      etiqueta: 'EMPIRE',
      tituloSans: 'Expande',
      tituloSerif: 'tu imperio.',
      palabraEditorial: 'Empire',
      subtituloEditorial: 'Panel administrativo para una o múltiples sedes',
      descripcionCorta:
        'Controla tus tarifas mensuales, pases diarios, galería fotográfica y comunidad desde un solo ecosistema.',
      imagen: 'assets/login/legend-pose.jpg',
      posicionY: '22%',
      metricaValor: '100%',
      metricaLabel: 'CONTROL DE SEDE',
    },
  ];

  // Parallax suave
  private targetMouseX = 0;
  private targetMouseY = 0;
  private currentMouseX = 0;
  private currentMouseY = 0;
  private rafId: number | null = null;
  private readonly onMouseMoveBound = (e: MouseEvent) => this.leerMouseObjetivo(e);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private cargaInicial: CargaInicialService,
    private cdr: ChangeDetectorRef,
    private elRef: ElementRef<HTMLElement>,
    private ngZone: NgZone,
  ) {
    this.registerForm = this.fb.group(
      {
        /** PRIMER CAMPO DEL FORMULARIO */
        nombre: ['', [Validators.required, Validators.minLength(3)]],

        /** SEGUNDO CAMPO DEL FORMULARIO */
        apellido: ['', [Validators.required, Validators.minLength(3)]],

        /** TERCER CAMPO DEL FORMULARIO */
        correo: ['', [Validators.required, Validators.email]],

        /** CUARTO CAMPO DEL FORMULARIO */
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/),
          ],
        ],

        /** QUINTO CAMPO DEL FORMULARIO */
        confirmarPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordsIguales,
      },
    );
  }

  get escenasActivas(): EscenaMinimalRegister[] {
    return this.esAnfitrion ? this.escenasAnfitrion : this.escenasUsuario;
  }

  get escenaActual(): EscenaMinimalRegister {
    const lista = this.escenasActivas;
    return lista[this.indiceEscena % lista.length] || lista[0];
  }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(async (params) => {
      const modoHost = params['tipo'] === 'anfitrion';
      if (this.esAnfitrion !== modoHost) {
        this.esAnfitrion = modoHost;
        this.indiceEscena = 0;
        this.cdr.markForCheck();
      } else {
        this.esAnfitrion = modoHost;
      }

      // Si ya está logueado con rol de anfitrión/admin y entra como anfitrión, abrir directamente el publicador
      const rolActual = this.authService.obtenerRol();
      if (
        this.esAnfitrion &&
        this.authService.estaAutenticado() &&
        (rolActual === 'Creador gym' || rolActual === 'Administrador')
      ) {
        await this.cargaInicial.cargarPrivados();
        await this.router.navigate(['/publicar-gimnasio'], { queryParams: { iniciar: 'true' } });
        return;
      }

      const correo = params['verificar'];
      if (correo && this.paso !== 2) {
        this.correoRegistrado = correo;
        this.paso = 2;
        await this.reenviarCodigo();
      }
    });

    if (typeof window !== 'undefined') {
      this.aplicarVariablesCss();
      this.ngZone.runOutsideAngular(() => {
        window.addEventListener('mousemove', this.onMouseMoveBound, { passive: true });
        this.iniciarLoopParallax();
      });

      this.autoSlideTimer = setInterval(() => {
        if (!this.pausarAutoSlide) {
          this.indiceEscena = (this.indiceEscena + 1) % this.escenasActivas.length;
          this.cdr.markForCheck();
        }
      }, 5400);
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
  }

  cambiarModo(esHost: boolean): void {
    if (this.esAnfitrion === esHost) return;
    this.esAnfitrion = esHost;
    this.indiceEscena = 0;
    this.mensajeVerificacion = '';
    this.seccionBloqueadaNombre = '';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: esHost ? { tipo: 'anfitrion' } : {},
      replaceUrl: true,
    });
    this.cdr.markForCheck();
  }

  intentarIrASeccion(ruta: string, nombreSeccion: string): void {
    if (this.authService.estaAutenticado()) {
      this.router.navigateByUrl(ruta);
      return;
    }
    this.rutaDestinoPendiente = ruta;
    this.seccionBloqueadaNombre = nombreSeccion;
    this.mensajeVerificacion = `Completa tu registro o inicia sesión para entrar a ${nombreSeccion}.`;
    this.activarPulsoFormulario();
    const input = document.getElementById('nombre') as HTMLInputElement | null;
    input?.focus();
    this.cdr.markForCheck();
  }

  private activarPulsoFormulario(): void {
    this.resaltarFormulario = true;
    setTimeout(() => {
      this.resaltarFormulario = false;
      this.cdr.markForCheck();
    }, 1500);
  }

  seleccionarEscena(index: number): void {
    this.indiceEscena = index;
    this.pausarAutoSlide = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.pausarAutoSlide = false;
    }, 9000);
  }

  escenaAnterior(): void {
    const total = this.escenasActivas.length;
    this.seleccionarEscena((this.indiceEscena - 1 + total) % total);
  }

  escenaSiguiente(): void {
    const total = this.escenasActivas.length;
    this.seleccionarEscena((this.indiceEscena + 1) % total);
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
        this.currentMouseX += dMx * 0.08;
        this.currentMouseY += dMy * 0.08;
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

  /** METODOS GET PARA ACCEDER A LOS DATOS EN EL HTML */
  get nombre() {
    return this.registerForm.get('nombre');
  }

  get apellido() {
    return this.registerForm.get('apellido');
  }

  get correo() {
    return this.registerForm.get('correo');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmarPassword() {
    return this.registerForm.get('confirmarPassword');
  }

  get valorPassword(): string {
    return this.password?.value || '';
  }

  get tieneMin8(): boolean {
    return this.valorPassword.length >= 8;
  }

  get tieneMayusMinus(): boolean {
    return /[A-Z]/.test(this.valorPassword) && /[a-z]/.test(this.valorPassword);
  }

  get tieneNumero(): boolean {
    return /\d/.test(this.valorPassword);
  }

  passwordsIguales(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmarPassword = form.get('confirmarPassword')?.value;

    if (password !== confirmarPassword) {
      return { passwordsNoCoinciden: true };
    }
    return null;
  }

  // MÉTODO PARA EL REGISTRO DE USUARIO (HU01, HU02, HU03)
  async registrarUsuario(): Promise<void> {
    /** VALIDACION SI EL FORMULARIO ES INVALIDO */
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.activarPulsoFormulario();
      this.cdr.markForCheck();
      return;
    }

    this.cargandoSubmit = true;
    this.mensajeVerificacion = '';
    this.cdr.markForCheck();

    try {
      const { nombre, apellido, correo, password } = this.registerForm.value;
      const nombreCompleto = `${nombre} ${apellido}`;
      const rolElegido = this.esAnfitrion ? 'Creador gym' : 'Usuario';

      const { error, mensaje } = await this.authService.registrarUsuario(nombreCompleto, correo, password, rolElegido);
      if (error) {
        this.mensajeVerificacion = error;
        return;
      }

      this.codigoIngresado = '';
      this.mensajeVerificacion = mensaje ?? '';
      this.correoRegistrado = correo;
      this.paso = 2;
      this.cdr.markForCheck();
    } finally {
      this.cargandoSubmit = false;
      this.cdr.markForCheck();
    }
  }

  // pide otro código al MID
  async reenviarCodigo(): Promise<void> {
    const error = await this.authService.enviarCodigoVerificacion(this.correoRegistrado);
    this.mensajeVerificacion = error ?? "Te enviamos un código nuevo.";
    this.cdr.markForCheck();
  }

  // Confirmación del código de verificación (HU04, HU05)
  async confirmarCodigo(): Promise<void> {
    const error = await this.authService.verificarCodigo(
      this.correoRegistrado,
      this.codigoIngresado,
    );
    if (error) {
      this.mensajeVerificacion = error;
      this.cdr.markForCheck();
      return;
    }

    await this.cargaInicial.cargarPrivados();

    if (this.esAnfitrion) {
      await this.router.navigate(['/publicar-gimnasio'], { queryParams: { iniciar: 'true' } });
    } else if (this.rutaDestinoPendiente && this.rutaDestinoPendiente !== '/login') {
      await this.router.navigateByUrl(this.rutaDestinoPendiente);
    } else {
      await this.router.navigate(['/panel/dashboard']);
    }
  }
}
