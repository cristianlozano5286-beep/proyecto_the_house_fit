import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Gimnasio } from '../../models/catalogo.models';
import { GimnasiosService } from '../../services/gimnasios';

export interface TipoEspacioEditor {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
}

export interface TipoAccesoEditor {
  id: 'completo' | 'areas' | 'clases';
  titulo: string;
  descripcion: string;
  icono: string;
}

export interface ComodidadEditor {
  id: string;
  nombre: string;
  categoria: 'basicos' | 'instalaciones' | 'seguridad';
  icono: string;
}

export interface AspectoEditor {
  id: string;
  etiqueta: string;
  icono: string;
}

@Component({
  selector: 'app-gimnasios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './gimnasios-admin.html',
  styleUrl: './gimnasios-admin.css',
})
export class GimnasiosAdminComponent implements OnInit {
  // Navegación por las etapas del asistente de creación + Vista Previa dedicada
  seccionActivaEditor: 'todo' | 'paso1' | 'paso2' | 'paso3' | 'preview' = 'todo';
  esPestanaDedicada = false;

  modoEdicion = false;
  idEditando: number | null = null;
  guardando = false;
  cargandoLista = true;
  mensajeExito = '';
  mensajeError = '';
  filtroTexto = '';

  // Campos temporales de apoyo en el editor
  nuevaFotoUrl = '';
  nuevoServicioPersonalizado = '';

  // Ciudades rápidas con coordenadas reales
  ciudadesRapidas = [
    { nombre: 'Aguazul', departamento: 'Casanare', pais: 'Colombia', lat: 5.1728, lng: -72.5471 },
    { nombre: 'Yopal', departamento: 'Casanare', pais: 'Colombia', lat: 5.3378, lng: -72.3959 },
    { nombre: 'Bogotá', departamento: 'Cundinamarca', pais: 'Colombia', lat: 4.6767, lng: -74.0483 },
    { nombre: 'Medellín', departamento: 'Antioquia', pais: 'Colombia', lat: 6.2442, lng: -75.5812 },
    { nombre: 'Cali', departamento: 'Valle del Cauca', pais: 'Colombia', lat: 3.4516, lng: -76.532 },
    { nombre: 'Villavicencio', departamento: 'Meta', pais: 'Colombia', lat: 4.142, lng: -73.6266 },
    { nombre: 'Bucaramanga', departamento: 'Santander', pais: 'Colombia', lat: 7.1193, lng: -73.1227 },
  ];

  iconosEmojiDisponibles = ['🏋️', '💪', '🏆', '🥊', '🧘', '🚴', '🤸', '🏊', '🔥', '⚡', '🏢', '🌴'];

  // 1. Catálogo de Tipos de Espacio (Referencia exacta del Paso 1 de creación)
  tiposEspacio: TipoEspacioEditor[] = [
    { id: 'comercial', nombre: 'Gimnasio Comercial', icono: '🏋️', descripcion: 'Musculación, máquinas integrales y cardio' },
    { id: 'crossfit', nombre: 'Box de CrossFit', icono: '🔥', descripcion: 'WODs, halterofilia, racks y alta intensidad' },
    { id: 'yoga', nombre: 'Estudio Yoga & Pilates', icono: '🧘', descripcion: 'Flexibilidad, respiración, reformer y bienestar' },
    { id: 'boxeo', nombre: 'Boxeo & Artes Marciales', icono: '🥊', descripcion: 'Ring, sacos pesados, MMA y kickboxing' },
    { id: 'calistenia', nombre: 'Parque de Calistenia', icono: '🤸', descripcion: 'Barras, paralelas, street workout y peso corporal' },
    { id: 'spinning', nombre: 'Sala de Spinning / Indoor', icono: '🚴', descripcion: 'Ciclismo indoor con música y luces inmersivas' },
    { id: 'funcional', nombre: 'Entrenamiento Funcional', icono: '⚡', descripcion: 'Circuitos HIIT, kettlebells, trineos y agilidad' },
    { id: 'natacion', nombre: 'Club Deportivo & Piscina', icono: '🏊', descripcion: 'Carriles climatizados, zonas húmedas y spa' },
    { id: 'boutique', nombre: 'Gimnasio Boutique', icono: '✨', descripcion: 'Atención exclusiva y grupos reducidos VIP' },
    { id: 'escalada', nombre: 'Muro de Escalada', icono: '🧗', descripcion: 'Búlder, cuerda y fuerza de agarre' },
    { id: 'baile', nombre: 'Academia de Baile & Zumba', icono: '💃', descripcion: 'Rumba aeróbica, danza fitness y cardio dance' },
    { id: 'outdoor', nombre: 'Gimnasio al Aire Libre', icono: '🌴', descripcion: 'Entrenamiento abierto en contacto con el exterior' },
  ];

  // 2. Catálogo de Tipos de Acceso (Referencia exacta del Paso 1 de creación)
  tiposAcceso: TipoAccesoEditor[] = [
    {
      id: 'completo',
      titulo: 'Acceso completo a todas las instalaciones',
      descripcion: 'Los atletas tienen acceso libre a todas las zonas de peso libre, máquinas, cardio, vestidores y áreas comunes.',
      icono: '🏛️',
    },
    {
      id: 'areas',
      titulo: 'Acceso por áreas o salas especializadas',
      descripcion: 'Los usuarios reservan el acceso a una zona específica (ej. zona de boxeo, jaula funcional o sala de ciclo) y comparten vestidores.',
      icono: '🚪',
    },
    {
      id: 'clases',
      titulo: 'Clases dirigidas o sesiones grupales',
      descripcion: 'Los atletas entrenan en horarios programados junto a un coach certificado y otros miembros del grupo.',
      icono: '👥',
    },
  ];

  // 3. Catálogo de Comodidades por Categoría (Referencia exacta del Paso 2 de creación)
  comodidadesCatalogo: ComodidadEditor[] = [
    // Básicos e Higiene
    { id: 'aire', nombre: 'Aire acondicionado', categoria: 'basicos', icono: '❄️' },
    { id: 'duchas', nombre: 'Duchas con agua caliente', categoria: 'basicos', icono: '🚿' },
    { id: 'lockers', nombre: 'Lockers de seguridad', categoria: 'basicos', icono: '🔐' },
    { id: 'wifi', nombre: 'Wifi de alta velocidad', categoria: 'basicos', icono: '📶' },
    { id: 'agua', nombre: 'Estación de hidratación', categoria: 'basicos', icono: '💧' },
    { id: 'toallas', nombre: 'Servicio de toallas', categoria: 'basicos', icono: '🧺' },
    { id: 'parking_auto', nombre: 'Estacionamiento gratuito', categoria: 'basicos', icono: '🚗' },
    { id: 'parking_bici', nombre: 'Biciparqueadero', categoria: 'basicos', icono: '🚲' },
    // Zonas y Equipamiento
    { id: 'peso_libre', nombre: 'Zona de peso libre y mancuernas', categoria: 'instalaciones', icono: '🏋️' },
    { id: 'maquinas', nombre: 'Máquinas de musculación', categoria: 'instalaciones', icono: '⚙️' },
    { id: 'cardio', nombre: 'Zona de cardio (Cintas / Elípticas)', categoria: 'instalaciones', icono: '🏃' },
    { id: 'crossfit', nombre: 'Jaula de CrossFit y funcional', categoria: 'instalaciones', icono: '🔥' },
    { id: 'yoga', nombre: 'Sala de Yoga / Pilates', categoria: 'instalaciones', icono: '🧘' },
    { id: 'boxeo', nombre: 'Ring / Sacos de boxeo', categoria: 'instalaciones', icono: '🥊' },
    { id: 'spinning', nombre: 'Sala de Spinning / Ciclismo', categoria: 'instalaciones', icono: '🚴' },
    { id: 'piscina', nombre: 'Piscina climatizada', categoria: 'instalaciones', icono: '🏊' },
    { id: 'sauna', nombre: 'Sauna / Turco / Spa', categoria: 'instalaciones', icono: '🧖' },
    { id: 'cafeteria', nombre: 'Cafetería / Barra de proteína', categoria: 'instalaciones', icono: '🥤' },
    // Servicios Profesionales y Seguridad
    { id: 'entrenadores', nombre: 'Entrenadores personales', categoria: 'seguridad', icono: '🧑‍🏫' },
    { id: 'nutricion', nombre: 'Valoración nutricional e IMC', categoria: 'seguridad', icono: '🥗' },
    { id: 'primeros_auxilios', nombre: 'Botiquín y DEA primeros auxilios', categoria: 'seguridad', icono: '🩺' },
    { id: 'sonido', nombre: 'Sistema de sonido envolvente Pro', categoria: 'seguridad', icono: '🔊' },
  ];

  // Servicios adicionales del catálogo público
  serviciosDisponibles: string[] = [
    'Musculación',
    'Cardio',
    'Crossfit',
    'Spinning',
    'Entrenamiento funcional',
    'Yoga',
    'Pilates',
    'Zumba',
    'Boxeo',
    'Powerlifting',
    'Calistenia',
    'Natación',
    'Sauna y Turco',
    'Asesoría nutricional',
    'Entrenador personal',
    'Parqueadero gratis',
    'Duchas y Lockers',
    'Aire acondicionado',
  ];

  // 4. Aspectos Destacados (Referencia exacta del Paso 2 de creación)
  catalogoAspectos: AspectoEditor[] = [
    { id: 'tranquilo', etiqueta: 'Tranquilo', icono: '🌿' },
    { id: 'excepcional', etiqueta: 'Excepcional', icono: '🏆' },
    { id: 'familias', etiqueta: 'Ideal para familias', icono: '👨‍👩‍👧' },
    { id: 'elegante', etiqueta: 'Elegante', icono: '✨' },
    { id: 'central', etiqueta: 'Ubicación central', icono: '📍' },
    { id: 'espacioso', etiqueta: 'Espacioso', icono: '🏛️' },
    { id: 'equipamiento', etiqueta: 'Equipamiento top', icono: '💪' },
    { id: 'combate', etiqueta: 'Zona de combate', icono: '🥊' },
  ];

  titulosSugeridos: string[] = [
    'The House Fit Performance Center',
    'Iron Temple & CrossFit Box',
    'Olympus Gym & Fitness Studio',
    'Titanes Fitness Club Casanare',
  ];

  // Biblioteca de fotos profesionales sugeridas
  fotosSugeridas = [
    {
      etiqueta: 'Pesas y Mancuernas',
      url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
    },
    {
      etiqueta: 'Sala de Máquinas',
      url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=80',
    },
    {
      etiqueta: 'Zona CrossFit',
      url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
    },
    {
      etiqueta: 'Cardio & Cintas',
      url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80',
    },
    {
      etiqueta: 'Powerlifting',
      url: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=900&q=80',
    },
    {
      etiqueta: 'Yoga & Funcional',
      url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    },
  ];

  formulario: Omit<Gimnasio, 'id'> = this.crearFormularioVacio();

  constructor(
    private gimnasiosService: GimnasiosService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) {}

  async ngOnInit(): Promise<void> {
    this.esPestanaDedicada = this.router.url.startsWith('/editar-gimnasio');
    this.cargandoLista = true;
    await this.gimnasiosService.cargar();
    this.cargandoLista = false;

    this.route.queryParams.subscribe((params) => {
      const editarIdParam = Number(params['editarId']);
      const ultimoGymId = Number(sessionStorage.getItem('thehousefit_ultimo_gym_id'));
      const lista = this.gimnasios;

      if (editarIdParam && this.gimnasiosService.obtener(editarIdParam)) {
        this.editar(this.gimnasiosService.obtener(editarIdParam)!);
      } else if (ultimoGymId && this.gimnasiosService.obtener(ultimoGymId)) {
        this.editar(this.gimnasiosService.obtener(ultimoGymId)!);
      } else if (lista.length > 0 && !this.modoEdicion) {
        // Por defecto, carga el primer gimnasio en modo edición para que el creador pueda editarlo de inmediato
        this.editar(lista[0]);
      }
    });
  }

  crearFormularioVacio(): Omit<Gimnasio, 'id'> {
    return {
      nombre: '',
      direccion: '',
      barrio: '',
      ciudad: 'Aguazul',
      departamento: 'Casanare',
      pais: 'Colombia',
      apartamentoPiso: '',
      codigoPostal: '',
      telefono: '',
      horario: 'Lunes a Sábado 5:00am - 10:00pm',
      descripcion: '',
      imagen: '🏋️',
      fotos: [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
      ],
      precio: 95000,
      moneda: 'COP',
      servicios: ['Musculación', 'Cardio', 'Entrenamiento funcional'],
      activo: true,
      lat: 5.1728,
      lng: -72.5471,
      tipoEspacio: 'comercial',
      tipoAcceso: 'completo',
      mostrarUbicacionExacta: true,
      marcadorX: 54,
      marcadorY: 46,
      aforoMaximo: 45,
      zonasEntrenamiento: 5,
      entrenadoresPlanta: 4,
      duchasVestidores: 4,
      lockersDisponibles: 30,
      comodidades: ['aire', 'duchas', 'lockers', 'wifi', 'agua', 'peso_libre', 'maquinas', 'cardio', 'entrenadores'],
      aspectosDestacados: ['equipamiento', 'espacioso'],
      tipoReservacion: 'inmediata',
      ajusteFinDeSemanaPorcentaje: 10,
      descuentoPromocionActivo: true,
      descuentoUltimoMinutoActivo: false,
      descuentoSemanalActivo: true,
      tieneCamaraExterior: true,
      descripcionCamarasSeguridad: 'Cámaras de seguridad activas en recepción, acceso principal y pasillos comunes.',
      tieneMonitorRuido: false,
      tieneArmasOPropiedad: true,
      paisFiscal: 'Colombia',
      direccionFiscal: '',
      apartamentoFiscal: '',
      ciudadFiscal: 'Aguazul',
      departamentoFiscal: 'Casanare',
      codigoPostalFiscal: '',
      esEmpresa: false,
    };
  }

  get gimnasios(): Gimnasio[] {
    const todos = this.gimnasiosService.listar();
    if (!this.filtroTexto.trim()) {
      return todos;
    }
    const q = this.filtroTexto.toLowerCase().trim();
    return todos.filter(
      (g) =>
        g.nombre.toLowerCase().includes(q) ||
        g.ciudad.toLowerCase().includes(q) ||
        g.barrio.toLowerCase().includes(q) ||
        g.direccion.toLowerCase().includes(q),
    );
  }

  get todosLosGimnasios(): Gimnasio[] {
    return this.gimnasiosService.listar();
  }

  get comodidadesBasicas(): ComodidadEditor[] {
    return this.comodidadesCatalogo.filter((c) => c.categoria === 'basicos');
  }

  get comodidadesInstalaciones(): ComodidadEditor[] {
    return this.comodidadesCatalogo.filter((c) => c.categoria === 'instalaciones');
  }

  get comodidadesSeguridad(): ComodidadEditor[] {
    return this.comodidadesCatalogo.filter((c) => c.categoria === 'seguridad');
  }

  // Cálculos de precios en vivo (idénticos al Paso 3 de creación)
  get comisionPlataformaCOP(): number {
    return Math.round((Number(this.formulario.precio) || 0) * 0.14);
  }

  get precioTotalAtletaCOP(): number {
    return (Number(this.formulario.precio) || 0) + this.comisionPlataformaCOP;
  }

  get gananciaAnfitrionCOP(): number {
    return Math.round((Number(this.formulario.precio) || 0) * 0.97);
  }

  get precioFinDeSemanaCOP(): number {
    const pct = this.formulario.ajusteFinDeSemanaPorcentaje || 0;
    return Math.round((Number(this.formulario.precio) || 0) * (1 + pct / 100));
  }

  get nombreTipoEspacioActual(): string {
    const encontrado = this.tiposEspacio.find((t) => t.id === this.formulario.tipoEspacio);
    return encontrado ? encontrado.nombre : 'Gimnasio Comercial';
  }

  get nombreTipoAccesoActual(): string {
    const encontrado = this.tiposAcceso.find((t) => t.id === this.formulario.tipoAcceso);
    return encontrado ? encontrado.titulo : 'Acceso completo a todas las instalaciones';
  }

  seleccionarCiudadRapida(c: {
    nombre: string;
    departamento: string;
    pais: string;
    lat: number;
    lng: number;
  }): void {
    this.formulario.ciudad = c.nombre;
    this.formulario.departamento = c.departamento;
    this.formulario.pais = c.pais;
    this.formulario.lat = c.lat;
    this.formulario.lng = c.lng;
    if (!this.formulario.ciudadFiscal) {
      this.formulario.ciudadFiscal = c.nombre;
      this.formulario.departamentoFiscal = c.departamento;
    }
  }

  moverMarcadorMapa(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    this.formulario.marcadorX = Math.max(8, Math.min(92, Math.round(x)));
    this.formulario.marcadorY = Math.max(10, Math.min(90, Math.round(y)));
    // Ajustar ligeramente lat/lng alrededor del centro de la ciudad
    const baseLat = this.formulario.lat || 5.1728;
    const baseLng = this.formulario.lng || -72.5471;
    this.formulario.lat = Number((baseLat + (50 - this.formulario.marcadorY) * 0.0003).toFixed(5));
    this.formulario.lng = Number((baseLng + (this.formulario.marcadorX - 50) * 0.0003).toFixed(5));
  }

  obtenerUrlMapaEmbed(): SafeResourceUrl {
    const query = encodeURIComponent(
      `${this.formulario.direccion || ''}, ${this.formulario.ciudad || 'Aguazul'}, ${this.formulario.pais || 'Colombia'}`,
    );
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://maps.google.com/maps?q=${query}&t=m&z=15&output=embed&iwloc=near`,
    );
  }

  // Contadores de capacidad e instalaciones (Paso 1)
  ajustarContador(
    campo: 'aforoMaximo' | 'zonasEntrenamiento' | 'entrenadoresPlanta' | 'duchasVestidores' | 'lockersDisponibles',
    delta: number,
    minimo: number = 1,
  ): void {
    const actual = Number(this.formulario[campo] ?? minimo);
    const nuevo = actual + delta;
    if (nuevo >= minimo) {
      this.formulario[campo] = nuevo;
    }
  }

  // Comodidades (Paso 2)
  tieneComodidad(id: string): boolean {
    return (this.formulario.comodidades || []).includes(id);
  }

  alternarComodidad(item: ComodidadEditor): void {
    if (!this.formulario.comodidades) {
      this.formulario.comodidades = [];
    }
    const idx = this.formulario.comodidades.indexOf(item.id);
    if (idx >= 0) {
      this.formulario.comodidades.splice(idx, 1);
    } else {
      this.formulario.comodidades.push(item.id);
      if (!this.formulario.servicios.includes(item.nombre)) {
        this.formulario.servicios.push(item.nombre);
      }
    }
  }

  tieneServicio(servicio: string): boolean {
    return this.formulario.servicios.includes(servicio);
  }

  alternarServicio(servicio: string): void {
    if (this.tieneServicio(servicio)) {
      this.formulario.servicios = this.formulario.servicios.filter((s) => s !== servicio);
    } else {
      this.formulario.servicios = [...this.formulario.servicios, servicio];
    }
  }

  agregarServicioPersonalizado(): void {
    const limpio = this.nuevoServicioPersonalizado.trim();
    if (!limpio) return;
    if (!this.serviciosDisponibles.includes(limpio)) {
      this.serviciosDisponibles.push(limpio);
    }
    if (!this.formulario.servicios.includes(limpio)) {
      this.formulario.servicios = [...this.formulario.servicios, limpio];
    }
    this.nuevoServicioPersonalizado = '';
  }

  // Aspectos destacados (Paso 2)
  tieneAspecto(id: string): boolean {
    return (this.formulario.aspectosDestacados || []).includes(id);
  }

  alternarAspecto(id: string): void {
    if (!this.formulario.aspectosDestacados) {
      this.formulario.aspectosDestacados = [];
    }
    const idx = this.formulario.aspectosDestacados.indexOf(id);
    if (idx >= 0) {
      this.formulario.aspectosDestacados.splice(idx, 1);
    } else {
      this.formulario.aspectosDestacados.push(id);
    }
  }

  aplicarTituloSugerido(titulo: string): void {
    this.formulario.nombre = titulo;
  }

  // Galería de fotos (Paso 2)
  agregarFoto(): void {
    const url = this.nuevaFotoUrl.trim();
    if (!url) return;
    if (!this.formulario.fotos.includes(url)) {
      this.formulario.fotos = [...this.formulario.fotos, url];
    }
    this.nuevaFotoUrl = '';
  }

  usarFotoSugerida(url: string): void {
    if (!this.formulario.fotos.includes(url)) {
      this.formulario.fotos = [...this.formulario.fotos, url];
    }
  }

  establecerComoPortada(index: number): void {
    if (index <= 0 || index >= this.formulario.fotos.length) return;
    const copia = [...this.formulario.fotos];
    const [elegida] = copia.splice(index, 1);
    copia.unshift(elegida);
    this.formulario.fotos = copia;
  }

  eliminarFoto(index: number): void {
    this.formulario.fotos = this.formulario.fotos.filter((_, i) => i !== index);
  }

  // Precios y descuentos (Paso 3)
  ajustarPrecioBase(delta: number): void {
    const actual = Number(this.formulario.precio) || 0;
    const nuevo = actual + delta;
    if (nuevo >= 10000) {
      this.formulario.precio = nuevo;
    }
  }

  sincronizarDireccionFiscal(): void {
    this.formulario.paisFiscal = this.formulario.pais || 'Colombia';
    this.formulario.direccionFiscal = this.formulario.direccion || '';
    this.formulario.apartamentoFiscal = this.formulario.apartamentoPiso || this.formulario.barrio || '';
    this.formulario.ciudadFiscal = this.formulario.ciudad || 'Aguazul';
    this.formulario.departamentoFiscal = this.formulario.departamento || 'Casanare';
    this.formulario.codigoPostalFiscal = this.formulario.codigoPostal || '';
  }

  async guardar(): Promise<void> {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (
      !this.formulario.nombre.trim() ||
      !this.formulario.direccion.trim() ||
      !this.formulario.ciudad.trim()
    ) {
      this.mensajeError =
        'Por favor completa al menos el nombre del gimnasio, la dirección y la ciudad.';
      return;
    }

    if (this.formulario.fotos.length === 0) {
      this.formulario.fotos = [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
      ];
    }

    if (this.formulario.servicios.length === 0) {
      this.formulario.servicios = ['Musculación', 'Cardio'];
    }

    this.guardando = true;
    try {
      if (this.modoEdicion && this.idEditando !== null) {
        await this.gimnasiosService.actualizar(this.idEditando, {
          ...this.formulario,
          fotos: [...this.formulario.fotos],
          servicios: [...this.formulario.servicios],
          comodidades: [...(this.formulario.comodidades || [])],
          aspectosDestacados: [...(this.formulario.aspectosDestacados || [])],
        });
        this.mensajeExito = `¡Todos los cambios de "${this.formulario.nombre}" fueron guardados y actualizados en el catálogo!`;
      } else {
        const creado = await this.gimnasiosService.crear({
          ...this.formulario,
          fotos: [...this.formulario.fotos],
          servicios: [...this.formulario.servicios],
          comodidades: [...(this.formulario.comodidades || [])],
          aspectosDestacados: [...(this.formulario.aspectosDestacados || [])],
        });
        this.modoEdicion = true;
        this.idEditando = creado.id;
        sessionStorage.setItem('thehousefit_ultimo_gym_id', String(creado.id));
        this.mensajeExito = `¡Gimnasio "${this.formulario.nombre}" publicado exitosamente en The House Fit!`;
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        this.mensajeExito = '';
      }, 6500);
    } catch {
      this.mensajeError = 'Ocurrió un error al guardar los cambios. Inténtalo de nuevo.';
    } finally {
      this.guardando = false;
    }
  }

  editar(gimnasio: Gimnasio): void {
    this.modoEdicion = true;
    this.idEditando = gimnasio.id;
    sessionStorage.setItem('thehousefit_ultimo_gym_id', String(gimnasio.id));
    const base = this.crearFormularioVacio();
    this.formulario = {
      ...base,
      ...gimnasio,
      fotos: [...(gimnasio.fotos || base.fotos)],
      servicios: [...(gimnasio.servicios || base.servicios)],
      comodidades: [...(gimnasio.comodidades || base.comodidades || [])],
      aspectosDestacados: [...(gimnasio.aspectosDestacados || base.aspectosDestacados || [])],
      direccionFiscal: gimnasio.direccionFiscal || gimnasio.direccion || '',
      ciudadFiscal: gimnasio.ciudadFiscal || gimnasio.ciudad || 'Aguazul',
      paisFiscal: gimnasio.paisFiscal || gimnasio.pais || 'Colombia',
    };

    for (const s of this.formulario.servicios) {
      if (!this.serviciosDisponibles.includes(s)) {
        this.serviciosDisponibles.push(s);
      }
    }
    this.mensajeError = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  abrirEnPestanaDedicada(gymId?: number | null): void {
    const id = gymId ?? this.idEditando ?? (this.todosLosGimnasios[0]?.id || '');
    const url = id ? `/editar-gimnasio?editarId=${id}` : '/editar-gimnasio';
    window.open(url, '_blank');
  }

  iniciarNuevoGimnasioEnEditor(): void {
    this.modoEdicion = false;
    this.idEditando = null;
    this.formulario = this.crearFormularioVacio();
    this.nuevaFotoUrl = '';
    this.nuevoServicioPersonalizado = '';
    this.mensajeError = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async eliminar(id: number): Promise<void> {
    try {
      await this.gimnasiosService.eliminar(id);
      if (this.idEditando === id) {
        const restantes = this.todosLosGimnasios;
        if (restantes.length > 0) {
          this.editar(restantes[0]);
        } else {
          this.iniciarNuevoGimnasioEnEditor();
        }
      }
      this.mensajeExito = 'Gimnasio eliminado correctamente del catálogo.';
      setTimeout(() => (this.mensajeExito = ''), 4000);
    } catch {
      this.mensajeError = 'No se pudo eliminar el gimnasio.';
    }
  }
}
