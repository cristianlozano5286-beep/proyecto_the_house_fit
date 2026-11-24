import { Injectable } from '@angular/core';
import { Gimnasio } from '../models/catalogo.models';
import { ApiService, mensajeDeError, reemplazarLista } from './api';
import { AuthService } from './auth';

const GIMNASIOS_INICIALES: Gimnasio[] = [
  {
    id: 1,
    nombre: 'KAIROS GYM',
    direccion: 'Cra 23 # 15-40',
    barrio: 'Centro',
    ciudad: 'Yopal',
    pais: 'Colombia',
    telefono: '3211234567',
    horario: 'Lunes a sábado 5:00am - 9:00pm',
    descripcion: 'Gimnasio con máquinas de última generación, zona de pesas libres, vestidores modernos y entrenadores de élite.',
    imagen: '💪',
    fotos: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=80'
    ],
    precio: 120000,
    moneda: 'COP',
    servicios: ['Musculación', 'Cardio', 'Entrenamiento funcional', 'Crossfit'],
    activo: true,
    lat: 5.3378,
    lng: -72.3959
  },
  {
    id: 2,
    nombre: 'GYM SENA',
    direccion: 'Calle 8 # 20-15',
    barrio: 'La Campiña',
    ciudad: 'Yopal',
    pais: 'Colombia',
    telefono: '3129876543',
    horario: 'Lunes a domingo 6:00am - 10:00pm',
    descripcion: 'Espacio integral con salas de spinning climatizadas, clases de yoga, zumba y zona de recuperación física.',
    imagen: '🏋️',
    fotos: [
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80'
    ],
    precio: 95000,
    moneda: 'COP',
    servicios: ['Spinning', 'Zumba', 'Yoga', 'Pilates'],
    activo: true,
    lat: 5.335,
    lng: -72.4
  },
  {
    id: 3,
    nombre: 'SMART FIT YOPAL',
    direccion: 'Av. Circunvalar # 5-22',
    barrio: 'La Esperanza',
    ciudad: 'Yopal',
    pais: 'Colombia',
    telefono: '3005551234',
    horario: 'Lunes a sábado 4:30am - 10:00pm',
    descripcion: 'Enfocado en levantamiento de potencia, crossfit de alta intensidad y nutrición deportiva avanzada.',
    imagen: '🏆',
    fotos: [
      'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1583500178690-f7fd8b7e6c33?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=900&q=80'
    ],
    precio: 140000,
    moneda: 'COP',
    servicios: ['Powerlifting', 'Crossfit', 'Asesoría nutricional', 'Musculación'],
    activo: true,
    lat: 5.34,
    lng: -72.39
  },
  {
    id: 4,
    nombre: 'THE HOUSE FIT BOUTIQUE',
    direccion: 'Calle Gran Vía 45',
    barrio: 'Centro',
    ciudad: 'Madrid',
    pais: 'España',
    telefono: '+34 611 234 567',
    horario: 'Lunes a domingo 6:00am - 11:00pm',
    descripcion: 'Estudio boutique premium especializado en entrenamiento funcional, coaching personalizado y calistenia.',
    imagen: '🏙️',
    fotos: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80'
    ],
    precio: 45,
    moneda: 'EUR',
    servicios: ['Entrenamiento funcional', 'Calistenia', 'Nutrición'],
    activo: true,
    lat: 40.42,
    lng: -3.7038
  },
  {
    id: 5,
    nombre: 'CYC BEACH GYM',
    direccion: '210 Ocean Drive',
    barrio: 'South Beach',
    ciudad: 'Miami',
    pais: 'Estados Unidos',
    telefono: '+1 305 555 0192',
    horario: 'Lunes a domingo 5:00am - 12:00am',
    descripcion: 'Gimnasio frente al mar con entrenamientos al aire libre, calistenia, vista panorámica a la playa y zona TRX.',
    imagen: '🌴',
    fotos: [
      'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&w=900&q=80'
    ],
    precio: 60,
    moneda: 'USD',
    servicios: ['Cardio', 'Yoga', 'Entrenamiento funcional', 'Natación'],
    activo: true,
    lat: 25.7815,
    lng: -80.13
  },
  {
    id: 6,
    nombre: 'IRON CLUB BOGOTÁ',
    direccion: 'Cra 15 # 93-40',
    barrio: 'Chicó',
    ciudad: 'Bogotá',
    pais: 'Colombia',
    telefono: '3187654321',
    horario: 'Lunes a sábado 5:00am - 10:00pm',
    descripcion: 'Gimnasio de alto rendimiento con zona de crossfit olímpico, sauna seco y húmedo, y suplementación deportiva.',
    imagen: '🏢',
    fotos: [
      'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80'
    ],
    precio: 180000,
    moneda: 'COP',
    servicios: ['Crossfit', 'Musculación', 'Spinning', 'Boxeo'],
    activo: true,
    lat: 4.6767,
    lng: -74.0483
  }
];

@Injectable({ providedIn: 'root' })
export class GimnasiosService {
  private readonly META_STORAGE_KEY = 'thehousefit_gimnasios_meta_v1';
  private gimnasios: Gimnasio[] = GIMNASIOS_INICIALES.map((g) => this.enriquecerConMetadata(g));
  private favoritos: number[] = [];

  constructor(private api: ApiService, private authService: AuthService) {}

  private leerMapaMetadata(): Record<string, Partial<Gimnasio>> {
    try {
      const raw = localStorage.getItem(this.META_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  guardarMetadataExtendida(id: number, nombre: string, datos: Partial<Gimnasio>): void {
    try {
      const mapa = this.leerMapaMetadata();
      const keyId = String(id);
      const keyNombre = `nombre:${(nombre || datos.nombre || '').trim().toLowerCase()}`;
      const previo = { ...(mapa[keyNombre] || {}), ...(mapa[keyId] || {}) };

      const fusionado: Partial<Gimnasio> = {
        ...previo,
        ...datos,
      };

      mapa[keyId] = fusionado;
      if (nombre || datos.nombre) {
        mapa[keyNombre] = fusionado;
      }
      localStorage.setItem(this.META_STORAGE_KEY, JSON.stringify(mapa));
    } catch {
      // Ignorar errores de almacenamiento local
    }
  }

  private enriquecerConMetadata(gym: Gimnasio): Gimnasio {
    const mapa = this.leerMapaMetadata();
    const porId = mapa[String(gym.id)];
    const porNombre = mapa[`nombre:${(gym.nombre || '').trim().toLowerCase()}`];
    const meta = { ...(porNombre || {}), ...(porId || {}) };

    const deptoDefault =
      gym.ciudad === 'Aguazul' || gym.ciudad === 'Yopal'
        ? 'Casanare'
        : gym.ciudad === 'Bogotá'
          ? 'Cundinamarca'
          : 'Principal';

    return {
      tipoEspacio: 'comercial',
      tipoAcceso: 'completo',
      departamento: deptoDefault,
      apartamentoPiso: '',
      codigoPostal: '',
      mostrarUbicacionExacta: true,
      marcadorX: 54,
      marcadorY: 46,
      aforoMaximo: 45,
      zonasEntrenamiento: 5,
      entrenadoresPlanta: 4,
      duchasVestidores: 4,
      lockersDisponibles: 30,
      comodidades: [
        'aire',
        'duchas',
        'lockers',
        'wifi',
        'agua',
        'peso_libre',
        'maquinas',
        'cardio',
        'entrenadores',
      ],
      aspectosDestacados: ['equipamiento', 'espacioso'],
      tipoReservacion: 'inmediata',
      ajusteFinDeSemanaPorcentaje: 10,
      descuentoPromocionActivo: true,
      descuentoUltimoMinutoActivo: false,
      descuentoSemanalActivo: true,
      tieneCamaraExterior: true,
      descripcionCamarasSeguridad:
        'Cámaras de seguridad activas en recepción, acceso principal y pasillos comunes.',
      tieneMonitorRuido: false,
      tieneArmasOPropiedad: true,
      paisFiscal: gym.pais || 'Colombia',
      direccionFiscal: gym.direccion || '',
      apartamentoFiscal: '',
      ciudadFiscal: gym.ciudad || 'Aguazul',
      departamentoFiscal: deptoDefault,
      codigoPostalFiscal: '',
      esEmpresa: false,
      ...meta,
      ...gym,
    };
  }

  private extraerPayloadBackend(datos: Partial<Gimnasio>): Record<string, unknown> {
    return {
      nombre: datos.nombre,
      direccion: datos.direccion,
      barrio: datos.barrio,
      ciudad: datos.ciudad,
      pais: datos.pais,
      telefono: datos.telefono,
      horario: datos.horario,
      descripcion: datos.descripcion,
      imagen: datos.imagen,
      fotos: datos.fotos,
      precio: datos.precio,
      moneda: datos.moneda,
      servicios: datos.servicios,
      activo: datos.activo,
      lat: datos.lat,
      lng: datos.lng,
    };
  }

  async cargar(): Promise<void> {
    try {
      const lista = await this.api.obtener<Gimnasio[]>('/gimnasios');
      if (lista) {
        const arreglados = lista.map((g) =>
          this.enriquecerConMetadata({
            ...g,
            lat: g.lat ?? undefined,
            lng: g.lng ?? undefined,
          }),
        );
        reemplazarLista(this.gimnasios, arreglados);
      }
    } catch {
      // Si el MID está apagado o falla la red, se mantienen los datos iniciales enriquecidos
    }
  }

  listar(): Gimnasio[] {
    return this.gimnasios;
  }

  obtener(id: number): Gimnasio | undefined {
    return this.gimnasios.find((g) => g.id === id);
  }

  puedeGestionar(gimnasio: Gimnasio): boolean {
    const usuario = this.authService.obtenerUsuario();
    if (!usuario || !usuario.id) {
      return false;
    }
    return (
      usuario.rol === 'Administrador' ||
      (usuario.rol === 'Creador gym' && gimnasio.propietarioId === usuario.id)
    );
  }

  async crear(gimnasio: Omit<Gimnasio, 'id'>): Promise<Gimnasio> {
    const creado = await this.api.crear<Gimnasio>('/gimnasios', this.extraerPayloadBackend(gimnasio));
    this.guardarMetadataExtendida(creado.id, creado.nombre, gimnasio);
    const nuevo = this.enriquecerConMetadata(creado);
    if (!this.obtener(nuevo.id)) {
      this.gimnasios.unshift(nuevo);
    }
    return nuevo;
  }

  async actualizar(id: number, cambios: Partial<Gimnasio>): Promise<void> {
    const actualizado = await this.api.actualizar<Gimnasio>('/gimnasios/' + id, this.extraerPayloadBackend(cambios));
    this.guardarMetadataExtendida(id, actualizado.nombre, cambios);
    const gimnasio = this.obtener(id);
    if (gimnasio) {
      Object.assign(gimnasio, this.enriquecerConMetadata(actualizado));
    }
  }

  async eliminar(id: number): Promise<void> {
    await this.api.borrar('/gimnasios/' + id);
    reemplazarLista(this.gimnasios, this.gimnasios.filter((g) => g.id !== id));
  }

  // ----- Favoritos (con sincronización opcional al MID) -----
  async cargarFavoritos(): Promise<void> {
    try {
      const lista = await this.api.obtener<Gimnasio[]>('/favoritos');
      this.favoritos = lista.map((g) => g.id);
    } catch {
      // Ignorar si no hay sesión
    }
  }

  limpiarFavoritos(): void {
    this.favoritos = [];
  }

  esFavorito(id: number): boolean {
    return this.favoritos.includes(id);
  }

  alternarFavorito(id: number): void {
    if (this.esFavorito(id)) {
      this.favoritos = this.favoritos.filter((f) => f !== id);
    } else {
      this.favoritos = [...this.favoritos, id];
    }

    if (this.authService.estaAutenticado()) {
      this.api.crear('/gimnasios/' + id + '/favorito', {}).catch(() => {});
    }
  }

  listarFavoritos(): Gimnasio[] {
    return this.gimnasios.filter((g) => this.favoritos.includes(g.id));
  }

  ciudadesDisponibles(): string[] {
    return Array.from(new Set(this.gimnasios.map((g) => g.ciudad)));
  }

}
