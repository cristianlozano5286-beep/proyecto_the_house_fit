export interface ClaseDisponible {
  id: number;
  gimnasioId: number;
  tipoClase: string;
  instructor: string;
  hora: string;
  cupos: number;
  duracion: string;
  precio: number;
}

export interface ReservaClase {
  id: number;
  usuario: string;
  claseId: number;
  fecha: string;
  personas: number;
  estado: string;
}