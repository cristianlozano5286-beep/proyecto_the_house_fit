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
  imagen: string;
  servicios: string[];
  descripcion: string;
  activo: boolean;
}

export interface Instructor {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  especialidad: string;
  experiencia: number; // años
  biografia: string;
  imagen: string;
  gimnasioId: number | null;
  activo: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  descripcion: string;
  guiaNutricional: string;
  imagen: string;
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
  gimnasioId: number | null;
  activo: boolean;
}
