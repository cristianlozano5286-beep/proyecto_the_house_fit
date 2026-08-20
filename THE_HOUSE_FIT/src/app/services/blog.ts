import { Injectable } from '@angular/core';
import { Noticia, Resena } from '../models/blog.models';
import { storage } from './storage';

const KEY_RESENAS = 'thehousefit_resenas';
const KEY_NOTICIAS = 'thehousefit_noticias';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private resenasIniciales: Resena[] = [
    {
      id: 1,
      gimnasioId: 1,
      usuario: 'Andrés Torres',
      titulo: 'Excelente ambiente y máquinas nuevas',
      cuerpo: 'Llevo 3 meses entrenando aquí y la atención de los instructores es muy buena.',
      imagen: '⭐',
      puntuacion: 5,
      fecha: '2026-06-12',
    },
    {
      id: 2,
      gimnasioId: 2,
      usuario: 'María Gómez',
      titulo: 'Buenas clases grupales',
      cuerpo: 'Las clases de zumba son geniales, aunque en horas pico hay bastante gente.',
      imagen: '⭐',
      puntuacion: 4,
      fecha: '2026-06-20',
    },
  ];

  private noticiasIniciales: Noticia[] = [
    {
      id: 1,
      titulo: 'Nueva promoción de matrícula',
      cuerpo: 'Este mes matricúlate con 20% de descuento en tu plan mensual.',
      imagen: '🎉',
      tipo: 'Promoción',
      gimnasioId: 1,
      fecha: '2026-08-01',
    },
    {
      id: 2,
      titulo: 'Llegaron nuevas máquinas de cardio',
      cuerpo: 'Renovamos nuestra zona de cardio con equipos de última generación.',
      imagen: '📰',
      tipo: 'Novedad',
      gimnasioId: 2,
      fecha: '2026-07-28',
    },
  ];

  private resenas: Resena[] = [];
  private noticias: Noticia[] = [];

  constructor() {
    this.resenas = this.cargar(KEY_RESENAS, this.resenasIniciales);
    this.noticias = this.cargar(KEY_NOTICIAS, this.noticiasIniciales);
  }

  private cargar<T>(key: string, iniciales: T[]): T[] {
    const datos = storage.getItem(key);
    if (datos) return JSON.parse(datos);
    storage.setItem(key, JSON.stringify(iniciales));
    return [...iniciales];
  }

  // ----- Reseñas (HU35, HU36, HU37) -----
  listarResenas(): Resena[] {
    return this.resenas;
  }
  resenasPorGimnasio(gimnasioId: number): Resena[] {
    return this.resenas.filter((r) => r.gimnasioId === gimnasioId);
  }
  promedioPuntuacion(gimnasioId: number): number {
    const lista = this.resenasPorGimnasio(gimnasioId);
    if (!lista.length) return 0;
    const total = lista.reduce((acum, r) => acum + r.puntuacion, 0);
    return Number((total / lista.length).toFixed(1));
  }
  agregarResena(resena: Omit<Resena, 'id' | 'fecha'>): void {
    const id = this.resenas.length ? Math.max(...this.resenas.map((r) => r.id)) + 1 : 1;
    this.resenas.push({ ...resena, id, fecha: new Date().toISOString().slice(0, 10) });
    storage.setItem(KEY_RESENAS, JSON.stringify(this.resenas));
  }
  eliminarResena(id: number): void {
    this.resenas = this.resenas.filter((r) => r.id !== id);
    storage.setItem(KEY_RESENAS, JSON.stringify(this.resenas));
  }

  // ----- Noticias (HU38, HU39, HU40) -----
  listarNoticias(): Noticia[] {
    return this.noticias;
  }
  agregarNoticia(noticia: Omit<Noticia, 'id' | 'fecha'>): void {
    const id = this.noticias.length ? Math.max(...this.noticias.map((n) => n.id)) + 1 : 1;
    this.noticias.push({ ...noticia, id, fecha: new Date().toISOString().slice(0, 10) });
    storage.setItem(KEY_NOTICIAS, JSON.stringify(this.noticias));
  }
  eliminarNoticia(id: number): void {
    this.noticias = this.noticias.filter((n) => n.id !== id);
    storage.setItem(KEY_NOTICIAS, JSON.stringify(this.noticias));
  }
}
