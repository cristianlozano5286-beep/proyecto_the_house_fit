export interface Gimnasio {
  id: number;
  nombre: string;
  ubicacion?: string;
  imagen: string;
  servicios: string[];
  descripcion: string;
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
