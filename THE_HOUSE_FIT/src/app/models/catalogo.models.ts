export interface Gimnasio {
  id: number;
  nombre: string;
  ubicacion?: string;
  imagen: string;
  servicios: string[];
  descripcion: string;
}

export interface Categoria {
  id: number;
  nombre: string;
}
