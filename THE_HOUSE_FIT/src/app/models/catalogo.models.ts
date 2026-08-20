export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  descripcion?: string;
  guiaNutricional?: string;
  imagen?: string;
  categoria?: 'Suplemento' | 'Implemento' | 'Ropa deportiva' | string;
}

export interface Gimnasio {
  id: number;
  nombre: string;
  direccion: string;
  barrio: string;
  telefono: string;
  horario: string;
  descripcion: string;
  imagen: string;
  servicios: string[];
  activo: boolean;
}

export interface Instructor {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  especialidad: string;
  experiencia: number;
  biografia: string;
  imagen: string;
  gimnasioId: number;
  activo: boolean;
}