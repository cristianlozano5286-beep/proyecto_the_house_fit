import { Injectable } from '@angular/core';
import { Noticia, Resena } from '../models/blog.models';
import { ApiService, reemplazarLista } from './api';

const RESENAS_INICIALES: Resena[] = [
  {
    id: 1,
    gimnasioId: 1,
    usuario: 'Andrés Torres',
    titulo: 'Excelente ambiente y máquinas nuevas',
    cuerpo: 'Llevo 3 meses entrenando aquí y la atención de los instructores es muy buena. Zona de pesas impecable.',
    imagen: '⭐',
    puntuacion: 5,
    fecha: '2026-06-12'
  },
  {
    id: 2,
    gimnasioId: 1,
    usuario: 'Valentina Peña',
    titulo: 'Los mejores entrenadores de Yopal',
    cuerpo: 'Clases dinámicas y asesoría personalizada constante. Muy recomendado para quienes inician.',
    imagen: '⭐',
    puntuacion: 5,
    fecha: '2026-07-04'
  },
  {
    id: 3,
    gimnasioId: 2,
    usuario: 'María Gómez',
    titulo: 'Buenas clases grupales y spinning',
    cuerpo: 'Las clases de zumba y spinning son geniales, instructores con mucha energía. Instalaciones limpias.',
    imagen: '⭐',
    puntuacion: 4,
    fecha: '2026-06-20'
  },
  {
    id: 4,
    gimnasioId: 3,
    usuario: 'Carlos Mendoza',
    titulo: 'Ideal para levantamiento pesado',
    cuerpo: 'Barras olímpicas reglamentarias, discos calibrados y buena música para motivar el entrenamiento.',
    imagen: '⭐',
    puntuacion: 5,
    fecha: '2026-08-15'
  },
  {
    id: 5,
    gimnasioId: 4,
    usuario: 'Elena Ruiz',
    titulo: 'Concepto boutique increíble',
    cuerpo: 'Atención de primer nivel en pleno centro de Madrid. Entrenamientos personalizados de alta calidad.',
    imagen: '⭐',
    puntuacion: 5,
    fecha: '2026-09-01'
  },
  {
    id: 6,
    gimnasioId: 5,
    usuario: 'Lucas Martin',
    titulo: 'Entrenar con vista al mar',
    cuerpo: 'La brisa marina mientras haces calistenia no tiene precio. Equipamiento completo.',
    imagen: '⭐',
    puntuacion: 5,
    fecha: '2026-09-10'
  },
  {
    id: 7,
    gimnasioId: 6,
    usuario: 'Daniela Silva',
    titulo: 'El sauna y la zona crossfit 10/10',
    cuerpo: 'Instalaciones de primer nivel en Bogotá. Excelente comunidad para entrenar fuerte.',
    imagen: '⭐',
    puntuacion: 5,
    fecha: '2026-09-22'
  }
];

const NOTICIAS_INICIALES: Noticia[] = [
  {
    id: 1,
    titulo: 'Nueva promoción de matrícula The House Fit',
    cuerpo: 'Este mes inscríbete en cualquier gimnasio de la red con 20% de descuento en tu pase mensual.',
    imagen: '🎉',
    tipo: 'Promoción',
    gimnasioId: 1,
    fecha: '2026-08-01'
  },
  {
    id: 2,
    titulo: 'Llegaron nuevas máquinas de cardio y fuerza',
    cuerpo: 'Los centros afiliados renovaron sus zonas funcionales con equipamiento biomecánico de última generación.',
    imagen: '📰',
    tipo: 'Novedad',
    gimnasioId: 2,
    fecha: '2026-07-28'
  },
  {
    id: 3,
    titulo: 'Nuevo programa de nutrición deportiva guiada',
    cuerpo: 'Accede a las guías nutricionales personalizadas según tu IMC directamente desde la plataforma.',
    imagen: '🥗',
    tipo: 'Oferta',
    gimnasioId: null,
    fecha: '2026-08-10'
  }
];

@Injectable({ providedIn: 'root' })
export class BlogService {
  private resenas: Resena[] = [...RESENAS_INICIALES];
  private noticias: Noticia[] = [...NOTICIAS_INICIALES];

  constructor(private api: ApiService) {}

  async cargar(): Promise<void> {
    try {
      const resenas = await this.api.obtener<Resena[]>('/resenas');
      const noticias = await this.api.obtener<Noticia[]>('/noticias');
      if (resenas && resenas.length > 0) reemplazarLista(this.resenas, resenas);
      if (noticias && noticias.length > 0) reemplazarLista(this.noticias, noticias);
    } catch {
      // Mantiene datos iniciales si no hay conexión
    }
  }

  // ----- Reseñas -----
  listarResenas(): Resena[] {
    return this.resenas;
  }

  resenasPorGimnasio(gimnasioId: number): Resena[] {
    return this.resenas.filter((r) => r.gimnasioId === gimnasioId);
  }

  promedioPuntuacion(gimnasioId: number): number {
    const lista = this.resenasPorGimnasio(gimnasioId);
    if (!lista.length) return 4.8; // Calificación por defecto de alta calidad si es nuevo
    const total = lista.reduce((acum, r) => acum + r.puntuacion, 0);
    return Number((total / lista.length).toFixed(1));
  }

  agregarResena(resena: Omit<Resena, 'id' | 'fecha'>): void {
    const nueva: Resena = { ...resena, id: Date.now(), fecha: new Date().toISOString().slice(0, 10) };
    this.resenas.push(nueva);

    this.api
      .crear<Resena>('/resenas', resena)
      .then((creada) => Object.assign(nueva, creada))
      .catch((error) => console.warn(error));
  }

  eliminarResena(id: number): void {
    reemplazarLista(
      this.resenas,
      this.resenas.filter((r) => r.id !== id),
    );
    this.api.borrar('/resenas/' + id).catch((error) => console.warn(error));
  }

  // ----- Noticias -----
  listarNoticias(): Noticia[] {
    return this.noticias;
  }

  agregarNoticia(noticia: Omit<Noticia, 'id' | 'fecha'>): void {
    const nueva: Noticia = { ...noticia, id: Date.now(), fecha: new Date().toISOString().slice(0, 10) };
    this.noticias.push(nueva);

    this.api
      .crear<Noticia>('/noticias', noticia)
      .then((creada) => Object.assign(nueva, creada))
      .catch((error) => console.warn(error));
  }

  actualizarNoticia(id: number, cambios: Partial<Noticia>): void {
    const item = this.noticias.find((n) => n.id === id);
    if (item) {
      Object.assign(item, cambios);
      this.api.actualizar('/noticias/' + id, cambios).catch((error) => console.warn(error));
    }
  }

  eliminarNoticia(id: number): void {
    reemplazarLista(
      this.noticias,
      this.noticias.filter((n) => n.id !== id),
    );
    this.api.borrar('/noticias/' + id).catch((error) => console.warn(error));
  }
}
