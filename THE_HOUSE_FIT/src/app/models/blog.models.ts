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
  id: number;
  gimnasioId: number;
  usuario: string;
  titulo: string;
  cuerpo: string;
  puntuacion: number;
  imagen: string;
  fecha?: string;
}
