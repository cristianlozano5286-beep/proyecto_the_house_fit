// Modelos relacionados con el Módulo 2 (Gimnasios) y Módulo 3 (Servicios)

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
  experiencia: number; // años
  biografia: string;
  imagen: string;
  gimnasioId: number | null;
  activo: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  categoria: 'Suplemento' | 'Implemento' | 'Ropa deportiva';
  precio: number;
  stock: number;
  descripcion: string;
  guiaNutricional: string;
  imagen: string;
}
