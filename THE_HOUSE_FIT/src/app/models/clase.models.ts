// Modelos relacionados con la reserva de clases en los gimnasios afiliados.

export interface ClaseDisponible {
  id: number;
  gimnasioId: number;
  tipoClase: 'Spinning' | 'CrossFit' | 'Yoga' | 'Funcional' | 'Boxeo' | 'Pilates';
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
  estado: 'Confirmada' | 'Cancelada';
}
