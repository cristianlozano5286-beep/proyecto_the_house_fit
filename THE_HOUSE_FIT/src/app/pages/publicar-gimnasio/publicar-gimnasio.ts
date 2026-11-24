import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { mensajeDeError } from '../../services/api';
import { AuthService } from '../../services/auth';
import { GimnasiosService } from '../../services/gimnasios';
import { Gimnasio } from '../../models/catalogo.models';

export type PantallaWizard =
  | 'hub'
  | 'configura-direccion'
  | 'describe-espacio'
  | 'tipo-espacio'
  | 'tipo-acceso'
  | 'ubicacion-marcador'
  | 'ubicacion-privacidad'
  | 'datos-basicos'
  | 'completado-paso1'
  | 'stand-out'
  | 'comodidades'
  | 'fotos'
  | 'titulo-gimnasio'
  | 'descripcion-aspectos'
  | 'descripcion-texto'
  | 'intro-paso3'
  | 'reservaciones-tipo'
  | 'precios-gimnasio'
  | 'descuentos-gimnasio'
  | 'seguridad-gimnasio'
  | 'datos-fiscales'
  | 'publicacion-exitosa'
  | 'completado-paso2';

export interface TipoEspacioItem {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
}

export interface TipoAccesoItem {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
}

export interface ComodidadItem {
  id: string;
  nombre: string;
  icono: string;
  categoria: 'basicos' | 'equipamiento' | 'servicios';
}

export interface FotoGimnasio {
  id: string;
  url: string;
  titulo: string;
  esPortada: boolean;
}

export interface AspectoDestacadoItem {
  id: string;
  nombre: string;
  icono: string;
}

interface BorradorGimnasio {
  fechaInicio: string;
  nombre: string;
  paisRegion: string;
  direccion: string;
  apartamentoPiso: string;
  ciudad: string;
  departamento: string;
  tipoEspacio?: string;
  tipoAcceso?: string;
  marcadorX?: number;
  marcadorY?: number;
  mostrarUbicacionExacta?: boolean;
  aforoMaximo?: number;
  zonasEntrenamiento?: number;
  entrenadoresPlanta?: number;
  duchasVestidores?: number;
  lockersDisponibles?: number;
  comodidades?: string[];
  fotos?: FotoGimnasio[];
  tituloGimnasio?: string;
  aspectosDestacados?: string[];
  descripcionGimnasio?: string;
  tipoReservacion?: 'aprobar_primeras' | 'inmediata';
  precioBaseCOP?: number;
  ajusteFinDeSemanaPorcentaje?: number;
  descuentoPromocionActivo?: boolean;
  descuentoUltimoMinutoActivo?: boolean;
  descuentoSemanalActivo?: boolean;
  tieneCamaraExterior?: boolean;
  tieneMonitorRuido?: boolean;
  tieneArmasOPropiedad?: boolean;
  descripcionCamarasSeguridad?: string;
  paisFiscal?: string;
  direccionFiscal?: string;
  apartamentoFiscal?: string;
  ciudadFiscal?: string;
  departamentoFiscal?: string;
  esEmpresa?: boolean | null;
  pantallaGuardada: PantallaWizard;
}

@Component({
  selector: 'app-publicar-gimnasio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './publicar-gimnasio.html',
  styleUrl: './publicar-gimnasio.css',
})
export class PublicarGimnasioComponent implements OnInit {
  // Control de pantallas del flujo
  pantallaActual: PantallaWizard = 'hub';

  // Modo edición en pantalla completa (idéntico a crear gimnasio)
  esModoEdicion = false;
  gimnasioEditandoId: number | null = null;

  // Modal de dirección
  modalDireccionAbierto = false;
  pasoModalDireccion: 'buscar' | 'confirmar' = 'buscar';
  busquedaDireccion = '';

  // Datos del formulario de dirección
  paisRegion = 'Colombia - CO';
  direccion = 'Transversal 7 #35-10';
  apartamentoPiso = '';
  ciudad = 'Yopal';
  departamento = 'Casanare';

  // Paso 1 - Pantallas
  tipoEspacioSeleccionado: string = 'comercial';
  tiposEspacio: TipoEspacioItem[] = [
    { id: 'comercial', nombre: 'Gimnasio Comercial', icono: '🏋️‍♂️', descripcion: 'Sala de pesas, máquinas guiadas y zona de fuerza' },
    { id: 'crossfit', nombre: 'Box de CrossFit', icono: '⚡', descripcion: 'WODs, jaulas, barras olímpicas y kettlebells' },
    { id: 'yoga', nombre: 'Estudio Yoga & Pilates', icono: '🧘‍♀️', descripcion: 'Esterillas, ambiente zen, reformer y movilidad' },
    { id: 'boxeo', nombre: 'Boxeo & Artes Marciales', icono: '🥊', descripcion: 'Ring, tatami de combate y sacos de golpeo' },
    { id: 'calistenia', nombre: 'Parque de Calistenia', icono: '🤸‍♂️', descripcion: 'Barras de dominadas, paralelas y peso corporal' },
    { id: 'spinning', nombre: 'Sala de Spinning / Cycling', icono: '🚴', descripcion: 'Bicicletas estáticas, audio y luces rítmicas' },
    { id: 'funcional', nombre: 'Entrenamiento Funcional', icono: '🏃', descripcion: 'TRX, trineos de empuje y césped sintético' },
    { id: 'natacion', nombre: 'Club Deportivo & Piscina', icono: '🏊', descripcion: 'Carriles de nado, fitness acuático y sauna' },
    { id: 'boutique', nombre: 'Gimnasio Boutique', icono: '🏢', descripcion: 'Atención 1 a 1 personalizada y alta gama' },
    { id: 'escalada', nombre: 'Muro de Escalada / Boulder', icono: '🧗', descripcion: 'Muros de bloque, presas y colchonetas de caída' },
    { id: 'baile', nombre: 'Academia de Baile / Rumba', icono: '💃', descripcion: 'Salón con espejos, tarima y sonido envolvente' },
    { id: 'outdoor', nombre: 'Gimnasio al Aire Libre / Rooftop', icono: '🌿', descripcion: 'Terraza deportiva con ventilación natural' },
  ];

  tipoAccesoSeleccionado: string = 'completo';
  tiposAcceso: TipoAccesoItem[] = [
    {
      id: 'completo',
      titulo: 'Un acceso completo a todas las instalaciones',
      descripcion: 'Los usuarios disponen de acceso libre a toda la sala de musculación, peso libre, máquinas, cardio y zonas comunes.',
      icono: '🏋️',
    },
    {
      id: 'areas',
      titulo: 'Acceso por áreas o salas especializadas',
      descripcion: 'Los usuarios reservan o pagan acceso según la zona de entrenamiento (ej. solo box de CrossFit, sala de yoga o tatami).',
      icono: '🚪',
    },
    {
      id: 'clases',
      titulo: 'Clases dirigidas o sesiones grupales',
      descripcion: 'El acceso es exclusivamente durante las clases programadas con un instructor certificado (spinning, funcional, boxeo, yoga).',
      icono: '👥',
    },
  ];

  marcadorX = 50;
  marcadorY = 50;
  zoomNivel = 15;
  mostrarUbicacionExacta = true;

  aforoMaximo = 40;
  zonasEntrenamiento = 3;
  entrenadoresPlanta = 2;
  duchasVestidores = 4;
  lockersDisponibles = 25;

  // Paso 2 - Comodidades (Image 2)
  comodidades: ComodidadItem[] = [
    // Básicos e Higiene
    { id: 'aire', nombre: 'Aire acondicionado', icono: '❄️', categoria: 'basicos' },
    { id: 'duchas', nombre: 'Duchas con agua caliente', icono: '🚿', categoria: 'basicos' },
    { id: 'lockers', nombre: 'Casilleros / Lockers', icono: '🔒', categoria: 'basicos' },
    { id: 'wifi', nombre: 'Wi-Fi de alta velocidad', icono: '📶', categoria: 'basicos' },
    { id: 'agua', nombre: 'Estación de hidratación', icono: '💧', categoria: 'basicos' },
    { id: 'toallas', nombre: 'Servicio de toallas', icono: '🧼', categoria: 'basicos' },
    { id: 'parking_auto', nombre: 'Parqueadero de autos', icono: '🚗', categoria: 'basicos' },
    { id: 'parking_bici', nombre: 'Bici-parking seguro', icono: '🚲', categoria: 'basicos' },

    // Zonas y Equipamiento
    { id: 'peso_libre', nombre: 'Peso libre y mancuernas', icono: '🏋️‍♂️', categoria: 'equipamiento' },
    { id: 'maquinas', nombre: 'Máquinas guiadas y poleas', icono: '⚙️', categoria: 'equipamiento' },
    { id: 'cardio', nombre: 'Área de cardio y cintas', icono: '🏃', categoria: 'equipamiento' },
    { id: 'crossfit', nombre: 'Jaulas y barras olímpicas', icono: '⚡', categoria: 'equipamiento' },
    { id: 'yoga', nombre: 'Sala de yoga y tatami', icono: '🧘‍♀️', categoria: 'equipamiento' },
    { id: 'boxeo', nombre: 'Ring y sacos de boxeo', icono: '🥊', categoria: 'equipamiento' },
    { id: 'spinning', nombre: 'Sala de spinning / cycling', icono: '🚴', categoria: 'equipamiento' },
    { id: 'piscina', nombre: 'Piscina / Zona húmeda', icono: '🏊', categoria: 'equipamiento' },
    { id: 'sauna', nombre: 'Sauna y baño turco', icono: '🧖', categoria: 'equipamiento' },
    { id: 'cafeteria', nombre: 'Barra de batidos y proteínas', icono: '🥑', categoria: 'equipamiento' },

    // Servicios Profesionales
    { id: 'entrenadores', nombre: 'Entrenadores en sala', icono: '🧑‍🏫', categoria: 'servicios' },
    { id: 'nutricion', nombre: 'Asesoría nutricional & InBody', icono: '🥗', categoria: 'servicios' },
    { id: 'primeros_auxilios', nombre: 'Primeros auxilios', icono: '🩹', categoria: 'servicios' },
    { id: 'sonido', nombre: 'Música & sonido motivacional', icono: '🎵', categoria: 'servicios' },
  ];

  comodidadesSeleccionadas: string[] = ['aire', 'duchas', 'lockers', 'peso_libre', 'maquinas', 'cardio', 'wifi'];

  // Paso 2 - Fotos (Images 3, 4, 5)
  fotos: FotoGimnasio[] = [];
  modalFotosAbierto = false;
  fotoMenuAbiertoId: string | null = null;
  modalAyudaAbierto = false;

  fotosSugeridasBiblioteca: FotoGimnasio[] = [
    {
      id: 'foto-1',
      url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
      titulo: 'Sala principal de musculación y peso libre',
      esPortada: true,
    },
    {
      id: 'foto-2',
      url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
      titulo: 'Zona de cardio y cintas de alta velocidad',
      esPortada: false,
    },
    {
      id: 'foto-3',
      url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      titulo: 'Área de crossfit y levantamiento olímpico',
      esPortada: false,
    },
    {
      id: 'foto-4',
      url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      titulo: 'Estudio de yoga, pilates y estiramiento',
      esPortada: false,
    },
    {
      id: 'foto-5',
      url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
      titulo: 'Recepción, vestidores y zona de casilleros',
      esPortada: false,
    },
    {
      id: 'foto-6',
      url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      titulo: 'Sala de spinning e indoor cycling',
      esPortada: false,
    },
  ];

  // Paso 2 - Título del Gimnasio (Image 2)
  tituloGimnasio = '';

  // Paso 2 - Aspectos destacados (Image 3)
  aspectosDestacados: string[] = ['equipamiento', 'central'];
  aspectosDisponibles: AspectoDestacadoItem[] = [
    { id: 'tranquilo', nombre: 'Tranquilo & Concentrado', icono: '🧘' },
    { id: 'excepcional', nombre: 'Excepcional & Alta Gama', icono: '⚡' },
    { id: 'familias', nombre: 'Para todos los niveles', icono: '👥' },
    { id: 'elegante', nombre: 'Elegante & Moderno', icono: '✨' },
    { id: 'central', nombre: 'Ubicación Central', icono: '📍' },
    { id: 'espacioso', nombre: 'Espacioso & Ventilado', icono: '🏢' },
    { id: 'equipamiento', nombre: 'Equipamiento Top de Fuerza', icono: '🏋️‍♂️' },
    { id: 'combate', nombre: 'Zona de Combate & Tatami', icono: '🥊' },
  ];

  // Paso 2 - Descripción detallada (Image 4)
  descripcionGimnasio = 'Rodéate de la mejor energía y equipamiento en este destacado espacio fitness.';

  // Paso 3 - Preferencias en las reservaciones (Nueva Imagen 1)
  tipoReservacion: 'aprobar_primeras' | 'inmediata' = 'aprobar_primeras';

  // Paso 3 - Precios (Nueva Imagen 2)
  precioBaseCOP: number = 116351;
  ajusteFinDeSemanaPorcentaje: number = 7;
  get precioFinDeSemanaCOP(): number {
    return Math.round(this.precioBaseCOP * (1 + this.ajusteFinDeSemanaPorcentaje / 100));
  }

  // Paso 3 - Descuentos (Nueva Imagen 3)
  descuentoPromocionActivo: boolean = true;
  descuentoUltimoMinutoActivo: boolean = true;
  descuentoSemanalActivo: boolean = true;

  // Paso 3 - Seguridad (Nueva Imagen 4 y 5)
  tieneCamaraExterior: boolean = false;
  tieneMonitorRuido: boolean = false;
  tieneArmasOPropiedad: boolean = false;
  descripcionCamarasSeguridad: string = '';
  modalCamarasAbierto: boolean = false;

  // Paso 3 - Datos finales y normativos (Nuevas Imágenes 1 y 2)
  paisFiscal: string = 'Colombia';
  direccionFiscal: string = '';
  apartamentoFiscal: string = '';
  ciudadFiscal: string = '';
  departamentoFiscal: string = '';
  esEmpresa: boolean | null = null;
  modalDetallesEmpresaAbierto: boolean = false;

  // Paso 3 - Publicación exitosa
  publicandoEnProceso: boolean = false;
  errorPublicacion = '';

  get gimnasiosEditables(): Gimnasio[] {
    return this.gimnasiosExistentes.filter((gimnasio) => this.gimnasiosService.puedeGestionar(gimnasio));
  }
  gimnasioPublicadoId: number | null = null;

  // Datos generales del anfitrión y gimnasio
  nombreUsuario = 'Daniel';
  gimnasiosExistentes: Gimnasio[] = [];
  modalPlantillasAbierto = false;

  // Manejo de borrador
  borrador: BorradorGimnasio | null = null;
  fechaHoy = '';

  paisesDisponibles = [
    { codigo: 'Colombia - CO', nombre: 'Colombia' },
    { codigo: 'España - ES', nombre: 'España' },
    { codigo: 'Estados Unidos - US', nombre: 'Estados Unidos' },
    { codigo: 'México - MX', nombre: 'México' },
    { codigo: 'Argentina - AR', nombre: 'Argentina' },
    { codigo: 'Chile - CL', nombre: 'Chile' },
    { codigo: 'Perú - PE', nombre: 'Perú' },
  ];

  constructor(
    private authService: AuthService,
    private gimnasiosService: GimnasiosService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    const usuario = this.authService.obtenerUsuario();
    if (usuario && usuario.nombre) {
      this.nombreUsuario = usuario.nombre.split(' ')[0];
    }

    const fecha = new Date();
    const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    this.fechaHoy = fecha.toLocaleDateString('es-ES', opciones);

    this.esModoEdicion =
      this.router.url.startsWith('/editar-gimnasio') ||
      this.route.snapshot.queryParamMap.get('modo') === 'editar';

    this.cargarBorrador();
    this.gimnasiosExistentes = this.gimnasiosService.listar();
    await this.gimnasiosService.cargar();
    this.gimnasiosExistentes = this.gimnasiosService.listar();

    const editarIdParam = Number(this.route.snapshot.queryParamMap.get('editarId'));
    if (editarIdParam) {
      const gymEncontrado = this.gimnasiosService.obtener(editarIdParam);
      if (gymEncontrado && this.gimnasiosService.puedeGestionar(gymEncontrado)) {
        this.iniciarEdicionDeGimnasio(gymEncontrado);
        return;
      }
    }

    if (this.esModoEdicion) {
      // En modo edición, mostrar la pantalla completa de selección de gimnasio ("Hola de nuevo, Daniel")
      this.pantallaActual = 'hub';
      this.cdr.markForCheck();
      return;
    }

    const iniciar = this.route.snapshot.queryParamMap.get('iniciar') === 'true';
    const nuevo = this.route.snapshot.queryParamMap.get('nuevo') === 'true';
    const pantallaParam = this.route.snapshot.queryParamMap.get('pantalla');

    if (pantallaParam) {
      this.pantallaActual = this.normalizarPantalla(pantallaParam);
    } else if (iniciar || nuevo || !this.borrador) {
      // Iniciar inmediatamente en el paso 1 del asistente para publicar gimnasio
      this.pantallaActual = 'describe-espacio';
    } else if (this.pantallaActual && this.pantallaActual !== 'hub') {
      this.pantallaActual = this.normalizarPantalla(this.pantallaActual);
    }
    this.cdr.markForCheck();
  }

  iniciarEdicionDeGimnasio(gym: Gimnasio): void {
    if (!this.gimnasiosService.puedeGestionar(gym)) return;
    this.esModoEdicion = true;
    this.gimnasioEditandoId = gym.id;

    this.tituloGimnasio = gym.nombre || '';
    this.direccion = gym.direccion || 'Calle Central';
    this.apartamentoPiso = gym.apartamentoPiso || gym.barrio || '';
    this.ciudad = gym.ciudad || 'Yopal';
    this.departamento =
      gym.departamento ||
      (gym.ciudad === 'Yopal' || gym.ciudad === 'Aguazul' ? 'Casanare' : 'Cundinamarca');
    this.paisRegion =
      gym.pais === 'España'
        ? 'España - ES'
        : gym.pais === 'Estados Unidos'
          ? 'Estados Unidos - US'
          : 'Colombia - CO';

    this.tipoEspacioSeleccionado = gym.tipoEspacio || 'comercial';
    this.tipoAccesoSeleccionado = gym.tipoAcceso || 'completo';
    this.marcadorX = gym.marcadorX ?? 50;
    this.marcadorY = gym.marcadorY ?? 50;
    this.mostrarUbicacionExacta = gym.mostrarUbicacionExacta ?? true;

    this.aforoMaximo = gym.aforoMaximo ?? 40;
    this.zonasEntrenamiento = gym.zonasEntrenamiento ?? 3;
    this.entrenadoresPlanta = gym.entrenadoresPlanta ?? 2;
    this.duchasVestidores = gym.duchasVestidores ?? 4;
    this.lockersDisponibles = gym.lockersDisponibles ?? 25;

    this.comodidadesSeleccionadas =
      gym.comodidades && gym.comodidades.length > 0
        ? [...gym.comodidades]
        : ['aire', 'duchas', 'lockers', 'peso_libre', 'maquinas', 'cardio', 'wifi'];

    const urls = gym.fotos && gym.fotos.length > 0 ? gym.fotos : [];
    this.fotos = urls.map((url, idx) => ({
      id: `gym-foto-${gym.id}-${idx}`,
      url,
      titulo: idx === 0 ? `Portada de ${gym.nombre}` : `Instalaciones ${idx + 1}`,
      esPortada: idx === 0,
    }));

    // Si tiene menos de 5 fotos, completamos con las de biblioteca para que el mosaico de 5 fotos luzca completo
    for (const sugerida of this.fotosSugeridasBiblioteca) {
      if (this.fotos.length >= 5) break;
      if (!this.fotos.some((f) => f.url === sugerida.url)) {
        this.fotos.push({
          ...sugerida,
          id: `gym-sug-${gym.id}-${this.fotos.length}`,
          esPortada: this.fotos.length === 0,
        });
      }
    }

    this.aspectosDestacados =
      gym.aspectosDestacados && gym.aspectosDestacados.length > 0
        ? [...gym.aspectosDestacados]
        : ['equipamiento', 'central'];
    this.descripcionGimnasio =
      gym.descripcion ||
      'Rodéate de la mejor energía y equipamiento en este destacado espacio fitness.';

    this.tipoReservacion = gym.tipoReservacion || 'inmediata';
    this.precioBaseCOP = gym.precio || 120000;
    this.ajusteFinDeSemanaPorcentaje = gym.ajusteFinDeSemanaPorcentaje ?? 7;

    this.descuentoPromocionActivo = gym.descuentoPromocionActivo ?? true;
    this.descuentoUltimoMinutoActivo = gym.descuentoUltimoMinutoActivo ?? true;
    this.descuentoSemanalActivo = gym.descuentoSemanalActivo ?? true;

    this.tieneCamaraExterior = gym.tieneCamaraExterior ?? true;
    this.descripcionCamarasSeguridad =
      gym.descripcionCamarasSeguridad || 'Cámaras de seguridad en acceso y áreas comunes.';
    this.tieneMonitorRuido = gym.tieneMonitorRuido ?? false;
    this.tieneArmasOPropiedad = gym.tieneArmasOPropiedad ?? false;

    this.paisFiscal = gym.paisFiscal || gym.pais || 'Colombia';
    this.direccionFiscal = gym.direccionFiscal || gym.direccion || '';
    this.apartamentoFiscal = gym.apartamentoFiscal || gym.barrio || '';
    this.ciudadFiscal = gym.ciudadFiscal || gym.ciudad || 'Yopal';
    this.departamentoFiscal = gym.departamentoFiscal || this.departamento || 'Casanare';
    this.esEmpresa = gym.esEmpresa ?? true;

    this.pantallaActual = 'describe-espacio';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.markForCheck();
  }

  volverASeleccionGimnasio(): void {
    this.pantallaActual = 'hub';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.markForCheck();
  }

  cambiarAModoEdicion(): void {
    this.esModoEdicion = true;
    this.pantallaActual = 'hub';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.markForCheck();
  }

  cambiarAModoCreacion(): void {
    this.esModoEdicion = false;
    this.gimnasioEditandoId = null;
    this.iniciarNuevoAnuncio();
  }

  /** Normaliza nombres de pantallas antiguos, alias o desfasados a una pantalla válida */
  normalizarPantalla(pantalla: string | undefined | null): PantallaWizard {
    if (!pantalla) return 'hub';
    switch (pantalla) {
      case 'completado-paso1':
      case 'stand-out':
      case 'standout':
      case 'paso2':
      case 'paso-2':
        return 'stand-out';
      case 'comodidades':
      case 'amenities':
        return 'comodidades';
      case 'fotos':
      case 'photos':
      case 'fotos-revision':
        return 'fotos';
      case 'titulo-gimnasio':
      case 'titulo':
        return 'titulo-gimnasio';
      case 'descripcion-aspectos':
      case 'aspectos':
        return 'descripcion-aspectos';
      case 'descripcion-texto':
      case 'descripcion':
        return 'descripcion-texto';
      case 'intro-paso3':
      case 'paso3':
      case 'completado-paso2':
        return 'intro-paso3';
      case 'reservaciones-tipo':
      case 'reservaciones':
        return 'reservaciones-tipo';
      case 'precios-gimnasio':
      case 'precios':
      case 'precio':
        return 'precios-gimnasio';
      case 'descuentos-gimnasio':
      case 'descuentos':
        return 'descuentos-gimnasio';
      case 'seguridad-gimnasio':
      case 'seguridad':
        return 'seguridad-gimnasio';
      case 'datos-fiscales':
      case 'fiscales':
      case 'datos-finales':
        return 'datos-fiscales';
      case 'publicacion-exitosa':
      case 'exito':
        return 'publicacion-exitosa';
      case 'configura-direccion':
        return 'configura-direccion';
      case 'describe-espacio':
      case 'paso1':
      case 'paso-1':
        return 'describe-espacio';
      case 'tipo-espacio':
        return 'tipo-espacio';
      case 'tipo-acceso':
        return 'tipo-acceso';
      case 'ubicacion-marcador':
        return 'ubicacion-marcador';
      case 'ubicacion-privacidad':
        return 'ubicacion-privacidad';
      case 'datos-basicos':
        return 'datos-basicos';
      case 'hub':
        return 'hub';
      default:
        return 'stand-out';
    }
  }

  // Métodos de interacción Paso 2: Título y Aspectos (Images 2, 3, 4)
  toggleAspecto(id: string): void {
    if (this.aspectosDestacados.includes(id)) {
      this.aspectosDestacados = this.aspectosDestacados.filter((a) => a !== id);
    } else {
      if (this.aspectosDestacados.length >= 2) {
        this.aspectosDestacados.shift();
      }
      this.aspectosDestacados.push(id);
    }
    this.guardarBorrador('descripcion-aspectos');
    this.cdr.markForCheck();
  }

  esAspectoSeleccionado(id: string): boolean {
    return this.aspectosDestacados.includes(id);
  }

  aplicarTituloSugerido(sugerencia: string): void {
    this.tituloGimnasio = sugerencia;
    this.guardarBorrador('titulo-gimnasio');
    this.cdr.markForCheck();
  }

  // Métodos de interacción Paso 3 (Nuevas Imágenes)
  seleccionarTipoReservacion(tipo: 'aprobar_primeras' | 'inmediata'): void {
    this.tipoReservacion = tipo;
    this.guardarBorrador('reservaciones-tipo');
    this.cdr.markForCheck();
  }

  ajustarPrecioBase(cambio: number): void {
    const nuevo = this.precioBaseCOP + cambio;
    if (nuevo >= 10000) {
      this.precioBaseCOP = nuevo;
      this.guardarBorrador('precios-gimnasio');
      this.cdr.markForCheck();
    }
  }

  toggleDescuento(tipo: 'promocion' | 'ultimoMinuto' | 'semanal'): void {
    if (tipo === 'promocion') this.descuentoPromocionActivo = !this.descuentoPromocionActivo;
    if (tipo === 'ultimoMinuto') this.descuentoUltimoMinutoActivo = !this.descuentoUltimoMinutoActivo;
    if (tipo === 'semanal') this.descuentoSemanalActivo = !this.descuentoSemanalActivo;
    this.guardarBorrador('descuentos-gimnasio');
    this.cdr.markForCheck();
  }

  toggleSeguridad(tipo: 'camara' | 'ruido' | 'armas'): void {
    if (tipo === 'camara') {
      this.tieneCamaraExterior = !this.tieneCamaraExterior;
      if (this.tieneCamaraExterior && !this.descripcionCamarasSeguridad) {
        this.abrirModalCamaras();
      }
    }
    if (tipo === 'ruido') this.tieneMonitorRuido = !this.tieneMonitorRuido;
    if (tipo === 'armas') this.tieneArmasOPropiedad = !this.tieneArmasOPropiedad;
    this.guardarBorrador('seguridad-gimnasio');
    this.cdr.markForCheck();
  }

  abrirModalCamaras(): void {
    this.modalCamarasAbierto = true;
    this.cdr.markForCheck();
  }

  cerrarModalCamaras(): void {
    this.modalCamarasAbierto = false;
    this.cdr.markForCheck();
  }

  guardarDescripcionCamaras(): void {
    this.modalCamarasAbierto = false;
    this.guardarBorrador('seguridad-gimnasio');
    this.cdr.markForCheck();
  }

  // Métodos de interacción Paso 3: Datos Finales y Fiscales (Nuevas Imágenes 1 y 2)
  inicializarDatosFiscales(): void {
    if (!this.direccionFiscal) {
      this.direccionFiscal = this.direccion || '';
    }
    if (!this.apartamentoFiscal) {
      this.apartamentoFiscal = this.apartamentoPiso || '';
    }
    if (!this.ciudadFiscal) {
      this.ciudadFiscal = this.ciudad || 'Yopal';
    }
    if (!this.departamentoFiscal) {
      this.departamentoFiscal = this.departamento || 'Casanare';
    }
    if (this.esEmpresa === null) {
      this.esEmpresa = true;
    }
  }

  seleccionarEsEmpresa(val: boolean): void {
    this.esEmpresa = val;
    this.guardarBorrador('datos-fiscales');
    this.cdr.markForCheck();
  }

  abrirModalDetallesEmpresa(): void {
    this.modalDetallesEmpresaAbierto = true;
    this.cdr.markForCheck();
  }

  cerrarModalDetallesEmpresa(): void {
    this.modalDetallesEmpresaAbierto = false;
    this.cdr.markForCheck();
  }

  /**
   * Guarda el gimnasio y redirecciona inmediatamente a la interfaz existente (/panel/dashboard)
   * según la especificación del usuario.
   */
  async crearAnuncioYRedireccionar(): Promise<void> {
    if (this.publicandoEnProceso) return;
    this.errorPublicacion = '';
    this.publicandoEnProceso = true;
    this.cdr.markForCheck();
    try {
      const fotosUrls = this.fotos.map((f) => f.url);
      const comodidadesNombres = this.comodidades
        .filter((c) => this.comodidadesSeleccionadas.includes(c.id))
        .map((c) => c.nombre);

      const datosGym: Omit<Gimnasio, 'id'> = {
        nombre: this.tituloGimnasio || ('Gimnasio ' + (this.ciudadFiscal || this.ciudad)),
        direccion: this.direccion || this.direccionFiscal || 'Calle Central',
        barrio: this.apartamentoPiso || this.apartamentoFiscal || 'Zona Deportiva',
        ciudad: this.ciudad || this.ciudadFiscal || 'Yopal',
        departamento: this.departamento || this.departamentoFiscal || 'Casanare',
        pais: this.paisFiscal || (this.paisRegion.includes('Colombia') ? 'Colombia' : 'España'),
        apartamentoPiso: this.apartamentoPiso,
        telefono: '3201234567',
        horario: 'Lunes a Domingo 5:00am - 10:00pm',
        descripcion: this.descripcionGimnasio,
        imagen: '🏋️‍♂️',
        fotos: fotosUrls.length > 0 ? fotosUrls : ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80'],
        precio: this.precioBaseCOP,
        moneda: 'COP',
        servicios: comodidadesNombres.length > 0 ? comodidadesNombres : ['Musculación', 'Cardio', 'Entrenadores'],
        activo: true,
        lat: 5.3378,
        lng: -72.3959,
        tipoEspacio: this.tipoEspacioSeleccionado,
        tipoAcceso: this.tipoAccesoSeleccionado,
        mostrarUbicacionExacta: this.mostrarUbicacionExacta,
        marcadorX: this.marcadorX,
        marcadorY: this.marcadorY,
        aforoMaximo: this.aforoMaximo,
        zonasEntrenamiento: this.zonasEntrenamiento,
        entrenadoresPlanta: this.entrenadoresPlanta,
        duchasVestidores: this.duchasVestidores,
        lockersDisponibles: this.lockersDisponibles,
        comodidades: [...this.comodidadesSeleccionadas],
        aspectosDestacados: [...this.aspectosDestacados],
        tipoReservacion: this.tipoReservacion,
        ajusteFinDeSemanaPorcentaje: this.ajusteFinDeSemanaPorcentaje,
        descuentoPromocionActivo: this.descuentoPromocionActivo,
        descuentoUltimoMinutoActivo: this.descuentoUltimoMinutoActivo,
        descuentoSemanalActivo: this.descuentoSemanalActivo,
        tieneCamaraExterior: this.tieneCamaraExterior,
        descripcionCamarasSeguridad: this.descripcionCamarasSeguridad,
        tieneMonitorRuido: this.tieneMonitorRuido,
        tieneArmasOPropiedad: this.tieneArmasOPropiedad,
        paisFiscal: this.paisFiscal,
        direccionFiscal: this.direccionFiscal || this.direccion,
        apartamentoFiscal: this.apartamentoFiscal || this.apartamentoPiso,
        ciudadFiscal: this.ciudadFiscal || this.ciudad,
        departamentoFiscal: this.departamentoFiscal || this.departamento,
        esEmpresa: this.esEmpresa ?? false,
      };

      if (this.esModoEdicion && this.gimnasioEditandoId !== null) {
        await this.gimnasiosService.actualizar(this.gimnasioEditandoId, datosGym);
        sessionStorage.setItem('thehousefit_ultimo_gym_id', String(this.gimnasioEditandoId));
        sessionStorage.setItem('thehousefit_anuncio_editado', 'true');
        this.router.navigate(['/panel/dashboard']);
      } else {
        const creado = await this.gimnasiosService.crear(datosGym);
        sessionStorage.setItem('thehousefit_ultimo_gym_id', String(creado.id));
        localStorage.removeItem('thehousefit_borrador_gym');
        this.borrador = null;
        sessionStorage.setItem('thehousefit_anuncio_creado', 'true');
        this.router.navigate(['/panel/dashboard']);
      }
    } catch (error) {
      this.errorPublicacion = mensajeDeError(error);
    } finally {
      this.publicandoEnProceso = false;
      this.cdr.markForCheck();
    }
  }

  async publicarGimnasioFinal(): Promise<void> {
    if (this.publicandoEnProceso) return;
    this.errorPublicacion = '';
    this.publicandoEnProceso = true;
    this.cdr.markForCheck();
    try {
      const fotosUrls = this.fotos.map((f) => f.url);
      const comodidadesNombres = this.comodidades
        .filter((c) => this.comodidadesSeleccionadas.includes(c.id))
        .map((c) => c.nombre);

      const nuevoGym: Omit<Gimnasio, 'id'> = {
        nombre: this.tituloGimnasio || ('Gimnasio ' + this.ciudad),
        direccion: this.direccion || 'Calle Central',
        barrio: this.apartamentoPiso || 'Zona Deportiva',
        ciudad: this.ciudad || 'Yopal',
        pais: this.paisRegion.includes('Colombia') ? 'Colombia' : 'España',
        telefono: '3201234567',
        horario: 'Lunes a Domingo 5:00am - 10:00pm',
        descripcion: this.descripcionGimnasio,
        imagen: '🏋️‍♂️',
        fotos: fotosUrls.length > 0 ? fotosUrls : ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80'],
        precio: this.precioBaseCOP,
        moneda: 'COP',
        servicios: comodidadesNombres.length > 0 ? comodidadesNombres : ['Musculación', 'Cardio', 'Entrenadores'],
        activo: true,
        lat: 5.3378,
        lng: -72.3959,
      };

      const creado = await this.gimnasiosService.crear(nuevoGym);
      this.gimnasioPublicadoId = creado.id;
      this.pantallaActual = 'publicacion-exitosa';
      localStorage.removeItem('thehousefit_borrador_gym');
      this.borrador = null;
    } catch (error) {
      this.errorPublicacion = mensajeDeError(error);
    } finally {
      this.publicandoEnProceso = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.cdr.markForCheck();
    }
  }

  // --- NAVEGACIÓN Y PANTALLAS ---
  iniciarNuevoAnuncio(): void {
    this.borrador = null;
    localStorage.removeItem('thehousefit_borrador_gym');
    this.pantallaActual = 'describe-espacio';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.markForCheck();
  }

  irAPaso(pantalla: PantallaWizard): void {
    this.pantallaActual = pantalla;
    this.guardarBorrador(pantalla);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.markForCheck();
  }

  continuarBorrador(): void {
    if (this.borrador) {
      this.direccion = this.borrador.direccion;
      this.apartamentoPiso = this.borrador.apartamentoPiso;
      this.ciudad = this.borrador.ciudad;
      this.departamento = this.borrador.departamento;
      this.paisRegion = this.borrador.paisRegion;
      this.tipoEspacioSeleccionado = this.borrador.tipoEspacio || this.tipoEspacioSeleccionado;
      this.tipoAccesoSeleccionado = this.borrador.tipoAcceso || this.tipoAccesoSeleccionado;
      this.mostrarUbicacionExacta = this.borrador.mostrarUbicacionExacta ?? true;
      this.aforoMaximo = this.borrador.aforoMaximo ?? 40;
      this.zonasEntrenamiento = this.borrador.zonasEntrenamiento ?? 3;
      this.entrenadoresPlanta = this.borrador.entrenadoresPlanta ?? 2;
      this.duchasVestidores = this.borrador.duchasVestidores ?? 4;
      this.lockersDisponibles = this.borrador.lockersDisponibles ?? 25;
      this.comodidadesSeleccionadas = this.borrador.comodidades || this.comodidadesSeleccionadas;
      this.fotos = this.borrador.fotos || [];
      this.tituloGimnasio = this.borrador.tituloGimnasio || '';
      this.aspectosDestacados = this.borrador.aspectosDestacados || ['equipamiento', 'central'];
      this.descripcionGimnasio = this.borrador.descripcionGimnasio || 'Rodéate de la mejor energía y equipamiento en este destacado espacio fitness.';
      this.tipoReservacion = this.borrador.tipoReservacion || 'aprobar_primeras';
      this.precioBaseCOP = this.borrador.precioBaseCOP ?? 116351;
      this.ajusteFinDeSemanaPorcentaje = this.borrador.ajusteFinDeSemanaPorcentaje ?? 7;
      this.descuentoPromocionActivo = this.borrador.descuentoPromocionActivo ?? true;
      this.descuentoUltimoMinutoActivo = this.borrador.descuentoUltimoMinutoActivo ?? true;
      this.descuentoSemanalActivo = this.borrador.descuentoSemanalActivo ?? true;
      this.tieneCamaraExterior = this.borrador.tieneCamaraExterior ?? false;
      this.tieneMonitorRuido = this.borrador.tieneMonitorRuido ?? false;
      this.tieneArmasOPropiedad = this.borrador.tieneArmasOPropiedad ?? false;
      this.descripcionCamarasSeguridad = this.borrador.descripcionCamarasSeguridad || '';
      this.pantallaActual = this.normalizarPantalla(this.borrador.pantallaGuardada);
    } else {
      this.pantallaActual = 'configura-direccion';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.markForCheck();
  }

  abrirPlantillasExistentes(): void {
    this.modalPlantillasAbierto = true;
    this.cdr.markForCheck();
  }

  cerrarModalPlantillas(): void {
    this.modalPlantillasAbierto = false;
    this.cdr.markForCheck();
  }

  seleccionarPlantilla(gym: Gimnasio): void {
    this.direccion = gym.direccion;
    this.ciudad = gym.ciudad;
    this.departamento = gym.barrio || 'Centro';
    this.paisRegion = `${gym.pais} - ${gym.pais === 'Colombia' ? 'CO' : 'ES'}`;
    this.modalPlantillasAbierto = false;
    this.pantallaActual = 'describe-espacio';
    this.guardarBorrador('describe-espacio');
    this.cdr.markForCheck();
  }

  // --- MODAL DIRECCIÓN ---
  abrirModalDireccion(): void {
    this.modalDireccionAbierto = true;
    this.pasoModalDireccion = 'buscar';
    this.busquedaDireccion = this.direccion || '';
    this.cdr.markForCheck();
  }

  cerrarModalDireccion(): void {
    this.modalDireccionAbierto = false;
    this.cdr.markForCheck();
  }

  usarUbicacionActual(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          this.direccion = this.direccion || 'Transversal 7 #35-10';
          this.ciudad = 'Yopal';
          this.departamento = 'Casanare';
          this.paisRegion = 'Colombia - CO';
          this.pasoModalDireccion = 'confirmar';
          this.cdr.markForCheck();
        },
        () => {
          this.pasoModalDireccion = 'confirmar';
          this.cdr.markForCheck();
        },
      );
    } else {
      this.pasoModalDireccion = 'confirmar';
      this.cdr.markForCheck();
    }
  }

  avanzarAConfirmarDireccion(): void {
    if (this.busquedaDireccion.trim()) {
      this.direccion = this.busquedaDireccion.trim();
    }
    this.pasoModalDireccion = 'confirmar';
    this.cdr.markForCheck();
  }

  retrocederABuscarDireccion(): void {
    this.pasoModalDireccion = 'buscar';
    this.cdr.markForCheck();
  }

  confirmarDireccionYSiguiente(): void {
    if (!this.direccion.trim()) {
      alert('Por favor ingresa tu dirección.');
      return;
    }
    this.modalDireccionAbierto = false;
    this.guardarBorrador('describe-espacio');
    this.pantallaActual = 'describe-espacio';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.markForCheck();
  }

  // --- INTERACCIÓN PASO 1 ---
  seleccionarTipoEspacio(id: string): void {
    this.tipoEspacioSeleccionado = id;
    this.guardarBorrador('tipo-espacio');
  }

  seleccionarTipoAcceso(id: string): void {
    this.tipoAccesoSeleccionado = id;
    this.guardarBorrador('tipo-acceso');
  }

  moverMarcadorEnMapa(event: MouseEvent): void {
    const contenedor = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((event.clientX - contenedor.left) / contenedor.width) * 100;
    const y = ((event.clientY - contenedor.top) / contenedor.height) * 100;
    this.marcadorX = Math.round(Math.max(10, Math.min(90, x)));
    this.marcadorY = Math.round(Math.max(10, Math.min(90, y)));
    this.guardarBorrador('ubicacion-marcador');
    this.cdr.markForCheck();
  }

  zoomIn(): void {
    if (this.zoomNivel < 18) this.zoomNivel++;
  }

  zoomOut(): void {
    if (this.zoomNivel > 12) this.zoomNivel--;
  }

  toggleUbicacionExacta(): void {
    this.mostrarUbicacionExacta = !this.mostrarUbicacionExacta;
    this.guardarBorrador('ubicacion-privacidad');
  }

  incrementar(campo: string): void {
    if (campo === 'aforo') this.aforoMaximo += 5;
    if (campo === 'zonas') this.zonasEntrenamiento += 1;
    if (campo === 'entrenadores') this.entrenadoresPlanta += 1;
    if (campo === 'duchas') this.duchasVestidores += 1;
    if (campo === 'lockers') this.lockersDisponibles += 5;
    this.guardarBorrador('datos-basicos');
    this.cdr.markForCheck();
  }

  decrementar(campo: string): void {
    if (campo === 'aforo' && this.aforoMaximo > 5) this.aforoMaximo -= 5;
    if (campo === 'zonas' && this.zonasEntrenamiento > 1) this.zonasEntrenamiento -= 1;
    if (campo === 'entrenadores' && this.entrenadoresPlanta > 0) this.entrenadoresPlanta -= 1;
    if (campo === 'duchas' && this.duchasVestidores > 0) this.duchasVestidores -= 1;
    if (campo === 'lockers' && this.lockersDisponibles > 0) this.lockersDisponibles -= 5;
    this.guardarBorrador('datos-basicos');
    this.cdr.markForCheck();
  }

  // --- INTERACCIÓN PASO 2: COMODIDADES (IMAGE 2) ---
  toggleComodidad(id: string): void {
    if (this.comodidadesSeleccionadas.includes(id)) {
      this.comodidadesSeleccionadas = this.comodidadesSeleccionadas.filter((c) => c !== id);
    } else {
      this.comodidadesSeleccionadas.push(id);
    }
    this.guardarBorrador('comodidades');
  }

  estaComodidadSeleccionada(id: string): boolean {
    return this.comodidadesSeleccionadas.includes(id);
  }

  get comodidadesBasicas(): ComodidadItem[] {
    return this.comodidades.filter((c) => c.categoria === 'basicos');
  }

  get comodidadesEquipamiento(): ComodidadItem[] {
    return this.comodidades.filter((c) => c.categoria === 'equipamiento');
  }

  get comodidadesServicios(): ComodidadItem[] {
    return this.comodidades.filter((c) => c.categoria === 'servicios');
  }

  // --- INTERACCIÓN PASO 2: FOTOS (IMAGES 3, 4, 5) ---
  abrirModalFotos(): void {
    this.modalFotosAbierto = true;
    this.cdr.markForCheck();
  }

  cerrarModalFotos(): void {
    this.modalFotosAbierto = false;
    this.cdr.markForCheck();
  }

  cargarFotosEjemplo(): void {
    this.fotos = [...this.fotosSugeridasBiblioteca];
    this.modalFotosAbierto = false;
    this.guardarBorrador('fotos');
    this.cdr.markForCheck();
  }

  agregarFotoBiblioteca(foto: FotoGimnasio): void {
    const yaExiste = this.fotos.some((f) => f.id === foto.id);
    if (!yaExiste) {
      const nueva = { ...foto, esPortada: this.fotos.length === 0 };
      this.fotos.push(nueva);
      this.guardarBorrador('fotos');
    }
  }

  onArchivosSeleccionados(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    Array.from(input.files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const id = 'subida-' + Date.now() + '-' + index;
        const esPortada = this.fotos.length === 0;
        this.fotos.push({
          id,
          url: e.target.result,
          titulo: file.name.replace(/\.[^/.]+$/, ''),
          esPortada,
        });
        this.guardarBorrador('fotos');
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    });

    this.modalFotosAbierto = false;
  }

  eliminarFoto(id: string): void {
    const eraPortada = this.fotos.find((f) => f.id === id)?.esPortada;
    this.fotos = this.fotos.filter((f) => f.id !== id);
    if (eraPortada && this.fotos.length > 0) {
      this.fotos[0].esPortada = true;
    }
    this.guardarBorrador('fotos');
    this.cdr.markForCheck();
  }

  establecerComoPortada(id: string): void {
    this.fotos.forEach((f) => {
      f.esPortada = f.id === id;
    });
    // Colocar la portada de primera en la lista
    const idx = this.fotos.findIndex((f) => f.id === id);
    if (idx > -1) {
      const [portada] = this.fotos.splice(idx, 1);
      this.fotos.unshift(portada);
    }
    this.guardarBorrador('fotos');
    this.cdr.markForCheck();
  }

  toggleMenuFoto(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.fotoMenuAbiertoId = this.fotoMenuAbiertoId === id ? null : id;
    this.cdr.markForCheck();
  }

  cerrarMenuFoto(): void {
    this.fotoMenuAbiertoId = null;
    this.cdr.markForCheck();
  }

  moverFotoArriba(id: string, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    const idx = this.fotos.findIndex((f) => f.id === id);
    if (idx > 0) {
      const temp = this.fotos[idx];
      this.fotos[idx] = this.fotos[idx - 1];
      this.fotos[idx - 1] = temp;
      this.fotos.forEach((f, i) => (f.esPortada = i === 0));
      this.guardarBorrador('fotos');
      this.fotoMenuAbiertoId = null;
      this.cdr.markForCheck();
    }
  }

  moverFotoAbajo(id: string, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    const idx = this.fotos.findIndex((f) => f.id === id);
    if (idx >= 0 && idx < this.fotos.length - 1) {
      const temp = this.fotos[idx];
      this.fotos[idx] = this.fotos[idx + 1];
      this.fotos[idx + 1] = temp;
      this.fotos.forEach((f, i) => (f.esPortada = i === 0));
      this.guardarBorrador('fotos');
      this.fotoMenuAbiertoId = null;
      this.cdr.markForCheck();
    }
  }

  abrirModalAyuda(): void {
    this.modalAyudaAbierto = true;
    this.cdr.markForCheck();
  }

  cerrarModalAyuda(): void {
    this.modalAyudaAbierto = false;
    this.cdr.markForCheck();
  }

  get fotoPortada(): FotoGimnasio | undefined {
    return this.fotos.find((f) => f.esPortada) || this.fotos[0];
  }

  get fotosSecundarias(): FotoGimnasio[] {
    const portada = this.fotoPortada;
    return this.fotos.filter((f) => f.id !== portada?.id);
  }

  // --- NAVEGACIÓN MULTIPASO GLOBAL ---
  irPasoSiguiente(): void {
    if (this.pantallaActual === 'describe-espacio') {
      this.pantallaActual = 'tipo-espacio';
    } else if (this.pantallaActual === 'tipo-espacio') {
      this.pantallaActual = 'tipo-acceso';
    } else if (this.pantallaActual === 'tipo-acceso') {
      this.pantallaActual = 'ubicacion-marcador';
    } else if (this.pantallaActual === 'ubicacion-marcador') {
      this.pantallaActual = 'ubicacion-privacidad';
    } else if (this.pantallaActual === 'ubicacion-privacidad') {
      this.pantallaActual = 'datos-basicos';
    } else if (this.pantallaActual === 'datos-basicos' || this.pantallaActual === 'completado-paso1') {
      // Avanza al Paso 2: Intro (Image 1 previa)
      this.guardarBorrador('stand-out');
      this.pantallaActual = 'stand-out';
    } else if (this.pantallaActual === 'stand-out') {
      // Avanza a Comodidades (Image 2 previa)
      this.guardarBorrador('comodidades');
      this.pantallaActual = 'comodidades';
    } else if (this.pantallaActual === 'comodidades') {
      // Avanza a Fotos (Images 3 / 5 previas)
      this.guardarBorrador('fotos');
      this.pantallaActual = 'fotos';
    } else if (this.pantallaActual === 'fotos') {
      if (this.fotos.length < 5) {
        alert('Para continuar con la publicación, agrega al menos 5 fotos de tu gimnasio.');
        return;
      }
      // Avanza a Título del Gimnasio (Nueva Imagen 2)
      this.guardarBorrador('titulo-gimnasio');
      this.pantallaActual = 'titulo-gimnasio';
    } else if (this.pantallaActual === 'titulo-gimnasio') {
      if (!this.tituloGimnasio.trim()) {
        alert('Por favor ingresa un título representativo para tu gimnasio.');
        return;
      }
      // Avanza a Aspectos destacados (Nueva Imagen 3)
      this.guardarBorrador('descripcion-aspectos');
      this.pantallaActual = 'descripcion-aspectos';
    } else if (this.pantallaActual === 'descripcion-aspectos') {
      // Avanza a Redacción de descripción (Nueva Imagen 4)
      this.guardarBorrador('descripcion-texto');
      this.pantallaActual = 'descripcion-texto';
    } else if (this.pantallaActual === 'descripcion-texto') {
      if (!this.descripcionGimnasio.trim()) {
        alert('Por favor comparte una breve descripción sobre lo que hace único a tu gimnasio.');
        return;
      }
      // Avanza al Paso 3: Terminar y Publicar (Nueva Imagen 5)
      this.guardarBorrador('intro-paso3');
      this.pantallaActual = 'intro-paso3';
    } else if (this.pantallaActual === 'intro-paso3') {
      this.guardarBorrador('reservaciones-tipo');
      this.pantallaActual = 'reservaciones-tipo';
    } else if (this.pantallaActual === 'reservaciones-tipo') {
      this.guardarBorrador('precios-gimnasio');
      this.pantallaActual = 'precios-gimnasio';
    } else if (this.pantallaActual === 'precios-gimnasio') {
      this.guardarBorrador('descuentos-gimnasio');
      this.pantallaActual = 'descuentos-gimnasio';
    } else if (this.pantallaActual === 'descuentos-gimnasio') {
      this.guardarBorrador('seguridad-gimnasio');
      this.pantallaActual = 'seguridad-gimnasio';
    } else if (this.pantallaActual === 'seguridad-gimnasio') {
      this.inicializarDatosFiscales();
      this.guardarBorrador('datos-fiscales');
      this.pantallaActual = 'datos-fiscales';
    } else if (this.pantallaActual === 'datos-fiscales') {
      this.crearAnuncioYRedireccionar();
    } else {
      this.pantallaActual = 'stand-out';
      this.guardarBorrador('stand-out');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.markForCheck();
  }

  irPasoAnterior(): void {
    if (this.pantallaActual === 'tipo-espacio') {
      this.pantallaActual = 'describe-espacio';
    } else if (this.pantallaActual === 'tipo-acceso') {
      this.pantallaActual = 'tipo-espacio';
    } else if (this.pantallaActual === 'ubicacion-marcador') {
      this.pantallaActual = 'tipo-acceso';
    } else if (this.pantallaActual === 'ubicacion-privacidad') {
      this.pantallaActual = 'ubicacion-marcador';
    } else if (this.pantallaActual === 'datos-basicos') {
      this.pantallaActual = 'ubicacion-privacidad';
    } else if (this.pantallaActual === 'stand-out' || this.pantallaActual === 'completado-paso1') {
      this.pantallaActual = 'datos-basicos';
    } else if (this.pantallaActual === 'comodidades') {
      this.pantallaActual = 'stand-out';
    } else if (this.pantallaActual === 'fotos') {
      this.pantallaActual = 'comodidades';
    } else if (this.pantallaActual === 'titulo-gimnasio') {
      this.pantallaActual = 'fotos';
    } else if (this.pantallaActual === 'descripcion-aspectos') {
      this.pantallaActual = 'titulo-gimnasio';
    } else if (this.pantallaActual === 'descripcion-texto') {
      this.pantallaActual = 'descripcion-aspectos';
    } else if (this.pantallaActual === 'intro-paso3') {
      this.pantallaActual = 'descripcion-texto';
    } else if (this.pantallaActual === 'reservaciones-tipo') {
      this.pantallaActual = 'intro-paso3';
    } else if (this.pantallaActual === 'precios-gimnasio') {
      this.pantallaActual = 'reservaciones-tipo';
    } else if (this.pantallaActual === 'descuentos-gimnasio') {
      this.pantallaActual = 'precios-gimnasio';
    } else if (this.pantallaActual === 'seguridad-gimnasio') {
      this.pantallaActual = 'descuentos-gimnasio';
    } else if (this.pantallaActual === 'datos-fiscales') {
      this.pantallaActual = 'seguridad-gimnasio';
    } else if (this.pantallaActual === 'publicacion-exitosa') {
      this.pantallaActual = 'datos-fiscales';
    } else if (this.pantallaActual === 'describe-espacio') {
      this.pantallaActual = this.esModoEdicion ? 'hub' : 'configura-direccion';
    } else if (this.pantallaActual === 'configura-direccion') {
      this.pantallaActual = 'hub';
    } else {
      this.pantallaActual = 'stand-out';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.markForCheck();
  }

  // Control de la barra de progreso (3 segmentos)
  get porcentajePaso1(): number {
    switch (this.pantallaActual) {
      case 'describe-espacio':
        return 20;
      case 'tipo-espacio':
        return 40;
      case 'tipo-acceso':
        return 60;
      case 'ubicacion-marcador':
        return 80;
      case 'ubicacion-privacidad':
        return 90;
      case 'datos-basicos':
        return 100;
      default:
        return 100;
    }
  }

  get esPaso1Activo(): boolean {
    return [
      'describe-espacio',
      'tipo-espacio',
      'tipo-acceso',
      'ubicacion-marcador',
      'ubicacion-privacidad',
      'datos-basicos',
    ].includes(this.pantallaActual);
  }

  get porcentajePaso2(): number {
    switch (this.pantallaActual) {
      case 'stand-out':
      case 'completado-paso1':
        return 20;
      case 'comodidades':
        return 40;
      case 'fotos':
        return 60;
      case 'titulo-gimnasio':
        return 75;
      case 'descripcion-aspectos':
        return 90;
      case 'descripcion-texto':
        return 100;
      case 'intro-paso3':
        return 100;
      default:
        return 0;
    }
  }

  get esPaso2Activo(): boolean {
    return [
      'stand-out',
      'comodidades',
      'fotos',
      'titulo-gimnasio',
      'descripcion-aspectos',
      'descripcion-texto',
      'completado-paso1',
    ].includes(this.pantallaActual);
  }

  get porcentajePaso3(): number {
    switch (this.pantallaActual) {
      case 'intro-paso3':
        return 20;
      case 'reservaciones-tipo':
        return 40;
      case 'precios-gimnasio':
        return 60;
      case 'descuentos-gimnasio':
        return 75;
      case 'seguridad-gimnasio':
        return 90;
      case 'datos-fiscales':
      case 'publicacion-exitosa':
        return 100;
      default:
        return 0;
    }
  }

  get esPaso3Activo(): boolean {
    return [
      'intro-paso3',
      'reservaciones-tipo',
      'precios-gimnasio',
      'descuentos-gimnasio',
      'seguridad-gimnasio',
      'datos-fiscales',
      'publicacion-exitosa',
    ].includes(this.pantallaActual);
  }

  // --- BOTONES DE SALIR / GUARDAR ---
  salir(): void {
    this.router.navigate(['/panel/dashboard']);
  }

  guardarYSalir(): void {
    if (this.esModoEdicion && this.gimnasioEditandoId !== null) {
      this.crearAnuncioYRedireccionar();
      return;
    }
    this.guardarBorrador(this.pantallaActual);
    this.pantallaActual = 'hub';
    this.cdr.markForCheck();
  }

  // --- PERSISTENCIA LOCAL ---
  private guardarBorrador(pantalla: PantallaWizard): void {
    if (this.esModoEdicion) return;
    const data: BorradorGimnasio = {
      fechaInicio: this.fechaHoy,
      nombre: this.tituloGimnasio || ('Sede deportiva en ' + this.ciudad),
      paisRegion: this.paisRegion,
      direccion: this.direccion,
      apartamentoPiso: this.apartamentoPiso,
      ciudad: this.ciudad,
      departamento: this.departamento,
      tipoEspacio: this.tipoEspacioSeleccionado,
      tipoAcceso: this.tipoAccesoSeleccionado,
      marcadorX: this.marcadorX,
      marcadorY: this.marcadorY,
      mostrarUbicacionExacta: this.mostrarUbicacionExacta,
      aforoMaximo: this.aforoMaximo,
      zonasEntrenamiento: this.zonasEntrenamiento,
      entrenadoresPlanta: this.entrenadoresPlanta,
      duchasVestidores: this.duchasVestidores,
      lockersDisponibles: this.lockersDisponibles,
      comodidades: this.comodidadesSeleccionadas,
      fotos: this.fotos,
      tituloGimnasio: this.tituloGimnasio,
      aspectosDestacados: this.aspectosDestacados,
      descripcionGimnasio: this.descripcionGimnasio,
      tipoReservacion: this.tipoReservacion,
      precioBaseCOP: this.precioBaseCOP,
      ajusteFinDeSemanaPorcentaje: this.ajusteFinDeSemanaPorcentaje,
      descuentoPromocionActivo: this.descuentoPromocionActivo,
      descuentoUltimoMinutoActivo: this.descuentoUltimoMinutoActivo,
      descuentoSemanalActivo: this.descuentoSemanalActivo,
      tieneCamaraExterior: this.tieneCamaraExterior,
      tieneMonitorRuido: this.tieneMonitorRuido,
      tieneArmasOPropiedad: this.tieneArmasOPropiedad,
      descripcionCamarasSeguridad: this.descripcionCamarasSeguridad,
      paisFiscal: this.paisFiscal,
      direccionFiscal: this.direccionFiscal,
      apartamentoFiscal: this.apartamentoFiscal,
      ciudadFiscal: this.ciudadFiscal,
      departamentoFiscal: this.departamentoFiscal,
      esEmpresa: this.esEmpresa,
      pantallaGuardada: pantalla,
    };
    this.borrador = data;
    localStorage.setItem('thehousefit_borrador_gym', JSON.stringify(data));
  }

  private cargarBorrador(): void {
    try {
      const guardado = localStorage.getItem('thehousefit_borrador_gym');
      if (guardado) {
        this.borrador = JSON.parse(guardado);
        if (this.borrador) {
          if (this.borrador.pantallaGuardada) {
            this.borrador.pantallaGuardada = this.normalizarPantalla(this.borrador.pantallaGuardada);
          }
          this.tipoEspacioSeleccionado = this.borrador.tipoEspacio || 'comercial';
          this.tipoAccesoSeleccionado = this.borrador.tipoAcceso || 'completo';
          this.mostrarUbicacionExacta = this.borrador.mostrarUbicacionExacta ?? true;
          this.aforoMaximo = this.borrador.aforoMaximo ?? 40;
          this.zonasEntrenamiento = this.borrador.zonasEntrenamiento ?? 3;
          this.entrenadoresPlanta = this.borrador.entrenadoresPlanta ?? 2;
          this.duchasVestidores = this.borrador.duchasVestidores ?? 4;
          this.lockersDisponibles = this.borrador.lockersDisponibles ?? 25;
          this.comodidadesSeleccionadas = this.borrador.comodidades || this.comodidadesSeleccionadas;
          this.fotos = this.borrador.fotos || [];
          this.tituloGimnasio = this.borrador.tituloGimnasio || '';
          this.aspectosDestacados = this.borrador.aspectosDestacados || ['equipamiento', 'central'];
          this.descripcionGimnasio = this.borrador.descripcionGimnasio || 'Rodéate de la mejor energía y equipamiento en este destacado espacio fitness.';
          this.tipoReservacion = this.borrador.tipoReservacion || 'aprobar_primeras';
          this.precioBaseCOP = this.borrador.precioBaseCOP ?? 116351;
          this.ajusteFinDeSemanaPorcentaje = this.borrador.ajusteFinDeSemanaPorcentaje ?? 7;
          this.descuentoPromocionActivo = this.borrador.descuentoPromocionActivo ?? true;
          this.descuentoUltimoMinutoActivo = this.borrador.descuentoUltimoMinutoActivo ?? true;
          this.descuentoSemanalActivo = this.borrador.descuentoSemanalActivo ?? true;
          this.tieneCamaraExterior = this.borrador.tieneCamaraExterior ?? false;
          this.tieneMonitorRuido = this.borrador.tieneMonitorRuido ?? false;
          this.tieneArmasOPropiedad = this.borrador.tieneArmasOPropiedad ?? false;
          this.descripcionCamarasSeguridad = this.borrador.descripcionCamarasSeguridad || '';
          this.paisFiscal = this.borrador.paisFiscal || 'Colombia';
          this.direccionFiscal = this.borrador.direccionFiscal || '';
          this.apartamentoFiscal = this.borrador.apartamentoFiscal || '';
          this.ciudadFiscal = this.borrador.ciudadFiscal || '';
          this.departamentoFiscal = this.borrador.departamentoFiscal || '';
          this.esEmpresa = this.borrador.esEmpresa ?? null;
        }
      }
    } catch {
      this.borrador = null;
    }
  }
}
