import { Injectable } from '@angular/core';
import { Noticia } from '../models/blog.models';

@Injectable({ providedIn: 'root' })
export class BlogService {
  listarNoticias(): Noticia[] {
    return [
      {
        id: 1,
        titulo: 'Nueva apertura',
        gimnasioId: 1,
        puntuacion: 5,
        tipo: 'noticia',
        imagen: '📰',
        cuerpo: 'Abrimos nuestras puertas con promociones especiales.',
      },
      {
        id: 2,
        titulo: 'Clase gratuita',
        gimnasioId: 2,
        puntuacion: 4,
        tipo: 'evento',
        imagen: '🎟️',
        cuerpo: 'Clase de yoga abierta al público este sábado.',
      },
      {
        id: 3,
        titulo: 'Rutinas top',
        gimnasioId: 1,
        puntuacion: 5,
        tipo: 'blog',
        imagen: '🔥',
        cuerpo: 'Las mejores rutinas para ganar fuerza.',
      },
      {
        id: 4,
        titulo: 'Evento especial',
        gimnasioId: 3,
        puntuacion: 3,
        tipo: 'evento',
        imagen: '🎉',
        cuerpo: 'Competencia local de levantamiento de pesas.',
      },
    ];
  }

  promedioPuntuacion(gimnasioId: number): number {
    const noticias = this.listarNoticias().filter(
      (n) => n.gimnasioId === gimnasioId && typeof n.puntuacion === 'number',
    );
    if (noticias.length === 0) return 0;
    const suma = noticias.reduce((s, n) => s + (n.puntuacion || 0), 0);
    return suma / noticias.length;
  }
}
