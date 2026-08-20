export interface Noticia {
  id: number;
  titulo: string;
  contenido?: string;
  cuerpo: string;
  gimnasioId?: number;
  puntuacion?: number;
  fecha?: string;
  tipo: string;
  imagen: string;
}

export interface Resena {
  id?: number;
  titulo?: string;
  cuerpo?: string;
  usuario: string;
  comentario?: string;
  calificacion?: number;
  puntuacion?: number;
  gimnasioId?: number;
  fecha?: string;
}