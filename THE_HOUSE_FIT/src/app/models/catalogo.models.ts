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

export interface Categoria {
  id: number;
  nombre: string;
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
