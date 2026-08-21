// Modelos relacionados con el Módulo 5 (Blog)

export interface Resena {
  id: number;
  gimnasioId: number;
  usuario: string;
  titulo: string;
  cuerpo: string;
  imagen: string;
  puntuacion: number; // 1 a 5
  fecha?: string;
}

export interface Noticia {
  id: number;
  titulo: string;
  cuerpo: string;
  imagen: string;
  tipo: 'Novedad' | 'Oferta' | 'Promoción';
  gimnasioId: number | null;
  fecha?: string;
}