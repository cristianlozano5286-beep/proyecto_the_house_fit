import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { GimnasiosService } from '../../services/gimnasios';
import { Gimnasio, Instructor } from '../../models/catalogo.models';
import { InstructoresService } from '../../services/instructores';
import { ProductosService } from '../../services/productos';
import { BlogService } from '../../services/blog';
import { ContenidoService } from '../../services/contenido';
import { MembresiasContabilidadService } from '../../services/membresias-contabilidad';

export type VistaDashboardV29 = 'general' | 'metas' | 'guardados' | 'comunidad';

export interface MetaDeportivaV29 {
  id: number;
  titulo: string;
  subtitulo: string;
  grupo: 'prioridad' | 'hoy' | 'proximas' | 'completadas';
  etiqueta: string;
  colorEtiqueta: 'coral' | 'amber' | 'emerald' | 'sky';
  responsable: string;
  completada: boolean;
  ruta: string;
}

export interface ItemGuardadoV29 {
  id: number;
  tipo: 'sede' | 'rutina' | 'audio' | 'nota';
  tipoLabel: string;
  titulo: string;
  subtitulo: string;
  valorDestacado?: string;
  duracion?: string;
  esCoralGradiente?: boolean;
  ondas?: number[];
  ruta: string;
  metaExtra: string;
}

export interface HiloComunidadV29 {
  id: number;
  nombre: string;
  cargo: string;
  sedeNombre: string;
  categoria: 'coach' | 'resena' | 'sede';
  avatarIniciales: string;
  hora: string;
  noLeidos: number;
  insigniaValor: string;
  etapaSede: string;
  rutaAccion: string;
  documentoAdjunto: string;
  mensajes: {
    autor: 'remoto' | 'propio';
    texto: string;
    hora: string;
  }[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  usuario: string = 'Usuario';
  rol: string = 'Usuario';

  // Selector interactivo estilo Ember Dashboard V29
  vistaActiva: VistaDashboardV29 = 'general';
  busquedaGlobal: string = '';
  periodoGrafica: '6m' | 'trimestre' | 'semana' = '6m';
  barraSeleccionada: string = 'Jun';
  indiceHeroGym: number = 0;
  indiceFotoHero: number = 0;

  private readonly fallbackFotosHero: string[] = [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80',
  ];

  Estadisticas = {
    Gimnasios: 0,
    Instructores: 0,
    Productos: 0,
    Usuarios: 0,
    Rutinas: 0,
    MembresiasActivas: 0,
  };

  GraficaBase = {
    '6m': [
      { mes: 'Ene', valor: 55, meta: '55%', detalle: '142 accesos' },
      { mes: 'Feb', valor: 68, meta: '68%', detalle: '178 accesos' },
      { mes: 'Mar', valor: 74, meta: '74%', detalle: '196 accesos' },
      { mes: 'Abr', valor: 82, meta: '82%', detalle: '224 accesos' },
      { mes: 'May', valor: 78, meta: '78%', detalle: '210 accesos' },
      { mes: 'Jun', valor: 94, meta: '94%', detalle: '268 accesos' },
    ],
    trimestre: [
      { mes: 'Sem 1', valor: 64, meta: '64%', detalle: '62 sesiones' },
      { mes: 'Sem 2', valor: 79, meta: '79%', detalle: '78 sesiones' },
      { mes: 'Sem 3', valor: 86, meta: '86%', detalle: '89 sesiones' },
      { mes: 'Sem 4', valor: 95, meta: '95%', detalle: '104 sesiones' },
    ],
    semana: [
      { mes: 'Lun', valor: 72, meta: '72%', detalle: 'Fuerza Superior' },
      { mes: 'Mar', valor: 84, meta: '84%', detalle: 'CrossFit & HIIT' },
      { mes: 'Mié', valor: 68, meta: '68%', detalle: 'Movilidad & Core' },
      { mes: 'Jue', valor: 91, meta: '91%', detalle: 'Pierna & Potencia' },
      { mes: 'Vie', valor: 96, meta: '96%', detalle: 'Full Body Pro' },
      { mes: 'Sáb', valor: 88, meta: '88%', detalle: 'Cardio & Box' },
    ],
  };

  // Tira semanal interactiva (Today column de V29)
  diaSeleccionado: number = 14;
  diasSemana = [
    { numero: 10, corto: 'Mar', eventos: 2 },
    { numero: 11, corto: 'Mié', eventos: 3 },
    { numero: 12, corto: 'Jue', eventos: 2 },
    { numero: 13, corto: 'Vie', eventos: 4 },
    { numero: 14, corto: 'Sáb', eventos: 3 },
    { numero: 15, corto: 'Dom', eventos: 1 },
    { numero: 16, corto: 'Lun', eventos: 3 },
  ];

  anillosSemana = [
    { label: 'Asistencia', valor: 88, meta: '12 ses.', dashOffset: 19 },
    { label: 'Rutinas Pro', valor: 76, meta: '4 planes', dashOffset: 38 },
    { label: 'Energía Red', valor: 94, meta: 'Top 5%', dashOffset: 10 },
  ];

  // Vista 2 (Tasks V29 -> Metas & Agenda)
  filtroMetas: 'todas' | 'prioridad' | 'hoy' | 'proximas' | 'completadas' = 'todas';
  mostrarInputNuevaMeta = false;
  nuevaMetaTexto = '';
  metasDeportivas: MetaDeportivaV29[] = [
    {
      id: 1,
      titulo: 'Validar reservas de clase y cupos de alta demanda',
      subtitulo: 'CrossFit WOD & Spinning Nocturno · Sede Principal',
      grupo: 'prioridad',
      etiqueta: 'Alta prioridad',
      colorEtiqueta: 'coral',
      responsable: 'Equipo Coach',
      completada: false,
      ruta: '/mi-espacio/reservar-clase',
    },
    {
      id: 2,
      titulo: 'Actualizar control de membresías e ingresos por cédula',
      subtitulo: 'Sincronización en vivo con recepción y pases diarios',
      grupo: 'prioridad',
      etiqueta: 'Recepción',
      colorEtiqueta: 'coral',
      responsable: 'Control Sede',
      completada: false,
      ruta: '/contabilidad-gestion',
    },
    {
      id: 3,
      titulo: 'Completar bloque de hipertrofia y registro de cargas',
      subtitulo: '4 series × 10 reps · Progresión biomecánica guiada',
      grupo: 'hoy',
      etiqueta: 'Hoy · 18:00',
      colorEtiqueta: 'amber',
      responsable: 'Mi Entrenamiento',
      completada: false,
      ruta: '/mi-espacio/entrenamiento',
    },
    {
      id: 4,
      titulo: 'Recálculo de IMC, TDEE y distribución de macronutrientes',
      subtitulo: 'Ajuste calórico mensual en The House Fit Lab',
      grupo: 'hoy',
      etiqueta: 'Nutrición Lab',
      colorEtiqueta: 'emerald',
      responsable: 'Fit Lab',
      completada: false,
      ruta: '/imc',
    },
    {
      id: 5,
      titulo: 'Revisión de stock de Proteína Whey Isolate y Creatina',
      subtitulo: 'Catálogo oficial de suplementación e implementos Pro',
      grupo: 'proximas',
      etiqueta: 'Tienda Pro',
      colorEtiqueta: 'sky',
      responsable: 'Tienda Fit',
      completada: false,
      ruta: '/tienda',
    },
    {
      id: 6,
      titulo: 'Explorar nuevas sedes aliadas y comparar planes mensuales',
      subtitulo: 'Recorrido por gimnasios verificados en Casanare y Colombia',
      grupo: 'proximas',
      etiqueta: 'Catálogo',
      colorEtiqueta: 'amber',
      responsable: 'Comunidad',
      completada: false,
      ruta: '/gimnasios',
    },
    {
      id: 7,
      titulo: 'Verificación de perfil deportivo e insignia de cuenta activa',
      subtitulo: 'Datos sincronizados correctamente en el portal',
      grupo: 'completadas',
      etiqueta: 'Completado',
      colorEtiqueta: 'emerald',
      responsable: 'Mi Perfil',
      completada: true,
      ruta: '/mi-perfil',
    },
    {
      id: 8,
      titulo: 'Activación de sesión segura multi-pestaña y preferencias',
      subtitulo: 'Persistencia verificada en tiempo real',
      grupo: 'completadas',
      etiqueta: 'Verificado',
      colorEtiqueta: 'emerald',
      responsable: 'Sistema',
      completada: true,
      ruta: '/panel/dashboard',
    },
  ];

  // Vista 3 (Saved V29 -> Guardados & Colecciones)
  filtroGuardados: 'todo' | 'sede' | 'rutina' | 'audio' | 'nota' = 'todo';
  reproduciendoAudioId: number | null = null;
  itemsGuardados: ItemGuardadoV29[] = [];

  coleccionesDestacadas = [
    { nombre: 'Sedes Élite & Box CrossFit', cantidad: '9 activos', progreso: 92, color: 'coral' },
    { nombre: 'Protocolos Hipertrofia & Fuerza', cantidad: '5 planes', progreso: 84, color: 'emerald' },
    { nombre: 'Suplementación & Gear Pro', cantidad: '4 líneas', progreso: 76, color: 'sky' },
    { nombre: 'Audio-Ritmos HIIT & Tabata', cantidad: '6 sesiones', progreso: 88, color: 'amber' },
  ];

  // Vista 4 (Messages V29 -> Comunidad & Coaches)
  filtroComunidad: 'todos' | 'coach' | 'resena' | 'sede' = 'todos';
  hiloSeleccionadoId: number = 1;
  nuevoMensajeComunidad: string = '';
  hilosComunidad: HiloComunidadV29[] = [];

  usuarios: { id: number; nombre: string; correo: string; rol: string; estado: string }[] = [];
  anuncioCreadoReciente = false;
  anuncioEditadoReciente = false;

  constructor(
    private authService: AuthService,
    private gimnasiosService: GimnasiosService,
    private instructoresService: InstructoresService,
    private productosService: ProductosService,
    private blogService: BlogService,
    private contenidoService: ContenidoService,
    private membresiasService: MembresiasContabilidadService,
    private cdr: ChangeDetectorRef,
  ) {}

  cerrarAvisoAnuncio(): void {
    this.anuncioCreadoReciente = false;
    sessionStorage.removeItem('thehousefit_anuncio_creado');
  }

  cambiarVista(vista: VistaDashboardV29): void {
    this.vistaActiva = vista;
  }

  cambiarPeriodoGrafica(periodo: '6m' | 'trimestre' | 'semana'): void {
    this.periodoGrafica = periodo;
    const lista = this.Grafica;
    if (lista.length > 0) {
      this.barraSeleccionada = lista[lista.length - 1].mes;
    }
  }

  seleccionarDiaSemana(dia: number): void {
    this.diaSeleccionado = dia;
  }

  get Grafica() {
    return this.GraficaBase[this.periodoGrafica];
  }

  get detalleBarraSeleccionada(): string {
    const item = this.Grafica.find((b) => b.mes === this.barraSeleccionada);
    return item ? `${item.meta} · ${item.detalle}` : 'Asistencia verificada en sedes';
  }

  get esAdmin(): boolean {
    return this.rol === 'Administrador' || this.rol === 'Creador gym';
  }

  get esCreadorGym(): boolean {
    return this.rol === 'Creador gym';
  }

  get esEntrenador(): boolean {
    return this.rol === 'Entrenador';
  }

  get esUsuario(): boolean {
    return this.rol === 'Usuario';
  }

  async ngOnInit(): Promise<void> {
    this.usuario = this.authService.obtenerNombre() || 'Usuario';
    this.rol = this.authService.obtenerRol() || 'Usuario';

    if (sessionStorage.getItem('thehousefit_anuncio_creado') === 'true') {
      this.anuncioCreadoReciente = true;
      sessionStorage.removeItem('thehousefit_anuncio_creado');
    }
    if (sessionStorage.getItem('thehousefit_anuncio_editado') === 'true') {
      this.anuncioCreadoReciente = true;
      this.anuncioEditadoReciente = true;
      sessionStorage.removeItem('thehousefit_anuncio_editado');
    }

    this.recalcularMetricas();

    await Promise.all([
      this.gimnasiosService.cargar(),
      this.membresiasService.cargar(),
    ]);
    this.recalcularMetricas();
    this.cdr.markForCheck();
  }

  private recalcularMetricas(): void {
    this.Estadisticas.Gimnasios = this.esCreadorGym
      ? this.misGimnasios.length
      : this.gimnasiosService.listar().length;
    this.Estadisticas.Instructores = this.instructoresService.listar().length;
    this.Estadisticas.Productos = this.productosService.listar().length;
    this.Estadisticas.Rutinas = this.contenidoService.listarRutinas().length;

    const idsSedes = this.misGimnasios.map((g) => g.id);
    const nombresSedes = this.misGimnasios.map((g) => g.nombre);
    const afiliadosSedes = this.membresiasService.listarPorGimnasios(idsSedes, nombresSedes);
    this.Estadisticas.MembresiasActivas = afiliadosSedes.length;

    const usuariosSistema = this.authService.listarUsuariosSistema();
    this.Estadisticas.Usuarios = usuariosSistema.length;

    this.usuarios = usuariosSistema.map((u, idx) => ({
      id: idx + 1,
      nombre: u.nombre,
      correo: u.correo,
      rol: u.rol,
      estado: u.correoVerificado ? 'Activo' : 'Pendiente',
    }));

    this.construirGuardadosYComunidad();
  }

  private construirGuardadosYComunidad(): void {
    const sedes = this.gimnasiosService.listar().slice(0, 2);
    const sede1 = sedes[0];
    const sede2 = sedes[1];

    this.itemsGuardados = [
      {
        id: 101,
        tipo: 'sede',
        tipoLabel: 'Sede Destacada',
        titulo: sede1 ? sede1.nombre : 'Kairos Center Gym',
        subtitulo: sede1 ? `${sede1.barrio} · ${sede1.ciudad}` : 'Centro · Yopal',
        valorDestacado: sede1 ? `$${sede1.precio.toLocaleString('es-CO')}` : '$120.000',
        esCoralGradiente: true,
        ruta: this.esAdmin ? '/editar-gimnasio' : '/gimnasios',
        metaExtra: 'Membresía Mensual & Pase Diario',
      },
      {
        id: 102,
        tipo: 'audio',
        tipoLabel: 'Sesión Ritmo HIIT',
        titulo: 'Protocolo Tabata & Sprint Metabólico',
        subtitulo: 'Cadencia guiada 170 BPM · Intervalos 40s / 20s',
        duracion: '28 min',
        ondas: [35, 68, 92, 48, 84, 100, 62, 78, 44, 90, 74, 52, 86, 60, 40],
        ruta: '/mi-espacio/entrenamiento',
        metaExtra: 'Audio-guía de intensidad anaeróbica',
      },
      {
        id: 103,
        tipo: 'rutina',
        tipoLabel: 'Plan Pro',
        titulo: 'Hipertrofia Empuje & Tracción V29',
        subtitulo: 'Enfoque biomecánico · 5 días por semana',
        valorDestacado: '94% Efectividad',
        ruta: '/rutinas',
        metaExtra: 'Actualizado hace 2 días',
      },
      {
        id: 104,
        tipo: 'sede',
        tipoLabel: 'Box & Funcional',
        titulo: sede2 ? sede2.nombre : 'Titanes Fitness Box',
        subtitulo: sede2 ? `${sede2.barrio} · ${sede2.ciudad}` : 'Zona Deportiva · Yopal',
        valorDestacado: sede2 ? `$${sede2.precio.toLocaleString('es-CO')}` : '$135.000',
        esCoralGradiente: true,
        ruta: '/gimnasios',
        metaExtra: 'Favorito entre atletas ★ 4.9',
      },
      {
        id: 105,
        tipo: 'audio',
        tipoLabel: 'Mindset & Movilidad',
        titulo: 'Recuperación Activa & Respiración Box',
        subtitulo: 'Enfriamiento post-entreno y control vagal',
        duracion: '16 min',
        ondas: [28, 42, 58, 76, 64, 50, 82, 70, 46, 62, 54, 38, 48, 34, 24],
        ruta: '/mi-espacio/reservar-clase',
        metaExtra: 'Sesión guiada por Coach Élite',
      },
      {
        id: 106,
        tipo: 'nota',
        tipoLabel: 'Nota Fit Lab',
        titulo: 'Distribución Proteica & Ventana Anabólica',
        subtitulo: '2.0g/kg peso corporal + 5g Creatina Monohidratada diaria',
        ruta: '/imc',
        metaExtra: 'Sincronizado con Calculadora IMC',
      },
    ];

    const coaches: Instructor[] = this.instructoresService.listar();
    const coach1 = coaches[0];
    const coach2 = coaches[1];

    if (this.hilosComunidad.length === 0) {
      this.hilosComunidad = [
        {
          id: 1,
          nombre: coach1 ? coach1.nombre : 'Coach Carlos Mendoza',
          cargo: coach1 ? `${coach1.especialidad} · ${coach1.experiencia} años exp.` : 'Especialista Fuerza & CrossFit',
          sedeNombre: sede1 ? sede1.nombre : 'Kairos Center Gym',
          categoria: 'coach',
          avatarIniciales: coach1 ? this.obtenerInicialesTexto(coach1.nombre) : 'CM',
          hora: 'Hace 12 min',
          noLeidos: 2,
          insigniaValor: 'Coach Élite ★ 4.9',
          etapaSede: 'Cupos Activos Hoy',
          rutaAccion: '/mi-espacio/reservar-clase',
          documentoAdjunto: 'Plan_Fuerza_Progresiva_V29.pdf',
          mensajes: [
            {
              autor: 'remoto',
              texto: '¡Hola! Ya dejé ajustada la progresión de cargas para esta semana. Recuerda priorizar técnica en sentadilla libre y press inclinado.',
              hora: '10:15 a. m.',
            },
            {
              autor: 'propio',
              texto: '¡Perfecto! Hoy entreno a las 6:00 p. m. y reviso el bloque de hipertrofia en Mi Entrenamiento.',
              hora: '10:18 a. m.',
            },
            {
              autor: 'remoto',
              texto: 'Excelente, te adjunto la guía rápida de calentamiento articular y series de aproximación.',
              hora: '10:21 a. m.',
            },
          ],
        },
        {
          id: 2,
          nombre: coach2 ? coach2.nombre : 'Valeria Ríos · Nutrición & Yoga',
          cargo: coach2 ? `${coach2.especialidad} · ${coach2.experiencia} años exp.` : 'Movilidad, Core & Metabolismo',
          sedeNombre: sede2 ? sede2.nombre : 'The House Fit Studio',
          categoria: 'coach',
          avatarIniciales: coach2 ? this.obtenerInicialesTexto(coach2.nombre) : 'VR',
          hora: 'Hace 45 min',
          noLeidos: 0,
          insigniaValor: 'Especialista Fit Lab',
          etapaSede: 'Sesiones Lun - Sáb',
          rutaAccion: '/imc',
          documentoAdjunto: 'Guia_Macronutrientes_TDEE.pdf',
          mensajes: [
            {
              autor: 'remoto',
              texto: 'Revisé tus métricas en la calculadora IMC. Manteniendo un superávit limpio de +250 kcal ganarás masa magra sin perder definición.',
              hora: '09:30 a. m.',
            },
            {
              autor: 'propio',
              texto: 'Genial, voy a combinarlo con la proteína Whey de la tienda oficial.',
              hora: '09:40 a. m.',
            },
          ],
        },
        {
          id: 3,
          nombre: 'Recepción & Control por Cédula',
          cargo: 'Validación instantánea de membresías y pases diarios',
          sedeNombre: sede1 ? sede1.nombre : 'Red Oficial The House Fit',
          categoria: 'sede',
          avatarIniciales: 'RC',
          hora: 'Hoy',
          noLeidos: 1,
          insigniaValor: `${this.Estadisticas.MembresiasActivas || 4} Afiliados Activos`,
          etapaSede: 'Sincronizado en vivo',
          rutaAccion: this.esAdmin ? '/contabilidad-gestion' : '/mi-espacio/pagos',
          documentoAdjunto: 'Reporte_Membresias_Activas.pdf',
          mensajes: [
            {
              autor: 'remoto',
              texto: 'Todos los pagos de membresía mensual y pase diario registrados por cédula se actualizan automáticamente en el panel.',
              hora: '08:00 a. m.',
            },
          ],
        },
      ];
    }
  }

  obtenerInicialesTexto(nombre: string): string {
    const partes = (nombre || 'TF').trim().split(/\s+/);
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombre.slice(0, 2).toUpperCase();
  }

  get topSedesDestacadas(): { nombre: string; ciudad: string; precio: string; ocupacion: number; rating: string }[] {
    const base = this.misGimnasios.length > 0 ? this.misGimnasios : this.gimnasiosService.listar();
    const filtradas = base
      .filter((g) =>
        !this.busquedaGlobal.trim() ||
        g.nombre.toLowerCase().includes(this.busquedaGlobal.toLowerCase()) ||
        g.ciudad.toLowerCase().includes(this.busquedaGlobal.toLowerCase()),
      )
      .slice(0, 3);

    const porcentajes = [92, 84, 78];
    const ratings = ['4.9', '4.8', '4.7'];
    return filtradas.map((g, i) => ({
      nombre: g.nombre,
      ciudad: g.ciudad,
      precio: `$${g.precio.toLocaleString('es-CO')}`,
      ocupacion: porcentajes[i] || 80,
      rating: ratings[i] || '4.8',
    }));
  }

  get agendaDiaActual() {
    const offset = this.diaSeleccionado % 2 === 0;
    return [
      {
        hora: offset ? '07:00' : '08:00',
        titulo: this.esAdmin ? 'Apertura & Control de Ingreso por Cédula' : 'Sesión Fuerza & Hipertrofia Guiada',
        sub: this.esAdmin ? 'Portería digital y pases activos' : '60 min · Zona de Peso Libre',
        tag: 'En agenda',
        ruta: this.esAdmin ? '/contabilidad-gestion' : '/mi-espacio/entrenamiento',
      },
      {
        hora: offset ? '17:30' : '18:00',
        titulo: 'Clase Grupal CrossFit & Conditioning',
        sub: 'Coach Élite · Cupos verificados',
        tag: 'Alta demanda',
        ruta: '/mi-espacio/reservar-clase',
      },
      {
        hora: '19:30',
        titulo: this.esAdmin ? 'Balance Diario de Membresías & Tienda' : 'Chequeo IMC & Suplementación Post-Entreno',
        sub: this.esAdmin ? 'Reporte consolidado de sedes' : 'The House Fit Lab & Tienda Pro',
        tag: 'Meta diaria',
        ruta: this.esAdmin ? '/contabilidad-gestion' : '/imc',
      },
    ];
  }

  // Métodos interactivos para Vista 2 (Metas V29)
  alternarMetaCompletada(meta: MetaDeportivaV29): void {
    meta.completada = !meta.completada;
    meta.grupo = meta.completada ? 'completadas' : 'hoy';
    meta.etiqueta = meta.completada ? 'Completado' : 'En curso';
    meta.colorEtiqueta = meta.completada ? 'emerald' : 'coral';
  }

  agregarMetaRapida(): void {
    const limpio = this.nuevaMetaTexto.trim();
    if (!limpio) return;
    this.metasDeportivas.unshift({
      id: Date.now(),
      titulo: limpio,
      subtitulo: 'Meta personalizada agregada desde tu Dashboard V29',
      grupo: 'prioridad',
      etiqueta: 'Prioridad Hoy',
      colorEtiqueta: 'coral',
      responsable: this.obtenerPrimerNombre(),
      completada: false,
      ruta: '/mi-espacio/entrenamiento',
    });
    this.nuevaMetaTexto = '';
    this.mostrarInputNuevaMeta = false;
  }

  metasPorGrupo(grupo: 'prioridad' | 'hoy' | 'proximas' | 'completadas'): MetaDeportivaV29[] {
    const q = this.busquedaGlobal.trim().toLowerCase();
    return this.metasDeportivas.filter((m) => {
      const coincideGrupo = m.grupo === grupo;
      const coincideFiltro = this.filtroMetas === 'todas' || m.grupo === this.filtroMetas;
      const coincideTexto =
        !q || m.titulo.toLowerCase().includes(q) || m.subtitulo.toLowerCase().includes(q);
      return coincideGrupo && coincideFiltro && coincideTexto;
    });
  }

  conteoMetasPorGrupo(grupo: 'prioridad' | 'hoy' | 'proximas' | 'completadas'): number {
    return this.metasDeportivas.filter((m) => m.grupo === grupo).length;
  }

  // Métodos interactivos para Vista 3 (Guardados V29)
  get itemsGuardadosFiltrados(): ItemGuardadoV29[] {
    const q = this.busquedaGlobal.trim().toLowerCase();
    return this.itemsGuardados.filter((item) => {
      const cumpleTipo = this.filtroGuardados === 'todo' || item.tipo === this.filtroGuardados;
      const cumpleBusqueda =
        !q ||
        item.titulo.toLowerCase().includes(q) ||
        item.subtitulo.toLowerCase().includes(q) ||
        item.tipoLabel.toLowerCase().includes(q);
      return cumpleTipo && cumpleBusqueda;
    });
  }

  alternarAudioPreview(event: Event, id: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.reproduciendoAudioId = this.reproduciendoAudioId === id ? null : id;
  }

  // Métodos interactivos para Vista 4 (Comunidad V29)
  get hilosComunidadFiltrados(): HiloComunidadV29[] {
    const q = this.busquedaGlobal.trim().toLowerCase();
    return this.hilosComunidad.filter((h) => {
      const cumpleCat = this.filtroComunidad === 'todos' || h.categoria === this.filtroComunidad;
      const cumpleTexto =
        !q ||
        h.nombre.toLowerCase().includes(q) ||
        h.sedeNombre.toLowerCase().includes(q) ||
        h.cargo.toLowerCase().includes(q);
      return cumpleCat && cumpleTexto;
    });
  }

  get hiloActivo(): HiloComunidadV29 {
    return (
      this.hilosComunidad.find((h) => h.id === this.hiloSeleccionadoId) ||
      this.hilosComunidad[0]
    );
  }

  seleccionarHilo(hilo: HiloComunidadV29): void {
    this.hiloSeleccionadoId = hilo.id;
    hilo.noLeidos = 0;
  }

  enviarMensajeComunidad(): void {
    const texto = this.nuevoMensajeComunidad.trim();
    if (!texto || !this.hiloActivo) return;
    this.hiloActivo.mensajes.push({
      autor: 'propio',
      texto,
      hora: 'Ahora',
    });
    this.nuevoMensajeComunidad = '';
  }

  obtenerPrimerNombre(): string {
    return this.usuario.split(' ')[0] || this.usuario;
  }

  obtenerTotalUsuarios(): number {
    return this.usuarios.length;
  }

  get misGimnasios(): Gimnasio[] {
    const lista = this.gimnasiosService.listar();
    return this.esCreadorGym
      ? lista.filter((g) => this.gimnasiosService.puedeGestionar(g))
      : lista;
  }

  get sedesHero(): Gimnasio[] {
    const base = this.misGimnasios.length ? this.misGimnasios : this.gimnasiosService.listar();
    const termino = this.busquedaGlobal.trim().toLowerCase();
    const filtradas = termino
      ? base.filter((g) =>
          `${g.nombre} ${g.ciudad} ${g.barrio} ${(g.servicios || []).join(' ')}`
            .toLowerCase()
            .includes(termino)
        )
      : base;
    return (filtradas.length ? filtradas : base).slice(0, 5);
  }

  get gymHeroActivo(): Gimnasio | null {
    const lista = this.sedesHero;
    if (!lista.length) return null;
    return lista[this.indiceHeroGym % lista.length];
  }

  get sedesOfertaDestacadas(): Gimnasio[] {
    const base = this.misGimnasios.length ? this.misGimnasios : this.gimnasiosService.listar();
    const termino = this.busquedaGlobal.trim().toLowerCase();
    const filtradas = termino
      ? base.filter((g) =>
          `${g.nombre} ${g.ciudad} ${g.barrio} ${(g.servicios || []).join(' ')}`
            .toLowerCase()
            .includes(termino)
        )
      : base;
    return (filtradas.length ? filtradas : base).slice(0, 4);
  }

  seleccionarGymHero(idx: number): void {
    this.indiceHeroGym = idx;
    this.indiceFotoHero = 0;
  }

  alternarFotoHero(fotoIdx: number): void {
    this.indiceFotoHero = this.indiceFotoHero === fotoIdx ? 0 : fotoIdx;
  }

  private esUrlImagen(val: string | undefined): boolean {
    if (!val) return false;
    return /^(https?:\/\/|data:image\/|assets\/|\/)/i.test(val.trim());
  }

  galeriaHeroDe(gym: Gimnasio | null): string[] {
    const candidatas: string[] = [];
    if (gym?.fotos?.length) {
      for (const f of gym.fotos) {
        if (this.esUrlImagen(f) && !candidatas.includes(f)) candidatas.push(f);
      }
    }
    if (this.esUrlImagen(gym?.imagen) && !candidatas.includes(gym!.imagen)) {
      candidatas.push(gym!.imagen);
    }
    for (const fb of this.fallbackFotosHero) {
      if (candidatas.length >= 3) break;
      if (!candidatas.includes(fb)) candidatas.push(fb);
    }
    return candidatas;
  }

  fotoDeGym(gym: Gimnasio | null, fotoIdx = 0): string {
    const galeria = this.galeriaHeroDe(gym);
    return galeria[fotoIdx] || galeria[0] || this.fallbackFotosHero[0];
  }

  formatearPrecioGym(gym: Gimnasio | null): string {
    if (!gym || !gym.precio) return '$120.000 COP / mes';
    const moneda = (gym.moneda || 'COP').toUpperCase();
    return `$${gym.precio.toLocaleString('es-CO')} ${moneda} / mes`;
  }

  get avataresHero(): string[] {
    const nombres = this.instructoresService.listar().map((i) => i.nombre).filter(Boolean);
    if (this.usuario) nombres.unshift(this.usuario);
    const iniciales = nombres
      .map((n) => n.trim().charAt(0).toUpperCase())
      .filter(Boolean);
    const base = Array.from(new Set([...iniciales, 'K', 'S', 'M']));
    return base.slice(0, 3);
  }

  ultimasResenas() {
    return [...this.blogService.listarResenas()].reverse().slice(0, 3);
  }
}
