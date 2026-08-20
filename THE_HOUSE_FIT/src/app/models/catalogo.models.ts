export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  imagen?: string;
  categoria?: string;
}

export interface Instructor {
  id: number;
  nombre: string;
  especialidad: string;
  foto?: string;
}