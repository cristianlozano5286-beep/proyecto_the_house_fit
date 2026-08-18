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
