export interface MetodoPago {
  id: number;
  nombre: string;
  icono: string;
  descripcion: string;
  disponible: boolean;
}

export interface Transaccion {
  id: number;
  usuario: string;
  concepto: string;
  monto: number;
  metodoPagoId: number;
  estado: string;
  fecha: string;
}