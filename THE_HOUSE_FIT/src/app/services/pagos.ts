import { Injectable } from '@angular/core';
import { MetodoPago, Transaccion } from '../models/pagos.models';
import { ApiService, mensajeDeError, reemplazarLista } from './api';

@Injectable({ providedIn: 'root' })
export class PagosService {
  private metodos: MetodoPago[] = [];
  private transacciones: Transaccion[] = [];

  constructor(private api: ApiService) {}

  async cargar(): Promise<void> {
    const lista = await this.api.obtener<MetodoPago[]>('/pagos/metodos');
    reemplazarLista(this.metodos, lista);
  }

  // las transacciones del usuario que tiene la sesión iniciada
  async cargarTransacciones(): Promise<void> {
    const lista = await this.api.obtener<Transaccion[]>('/pagos/transacciones');
    reemplazarLista(this.transacciones, lista);
  }

  limpiarTransacciones(): void {
    reemplazarLista(this.transacciones, []);
  }

  listarMetodos(): MetodoPago[] {
    return this.metodos.filter((m) => m.disponible);
  }

  // Simula la integración con una pasarela de pago externa (HU42) y
  // la redirección al método de pago seleccionado (HU43).
  // Devuelve la transacción, o el mensaje de error si el MID la rechazó.
  async procesarPago(
    concepto: string,
    monto: number,
    metodoPagoId: number,
  ): Promise<Transaccion | string> {
    try {
      const transaccion = await this.api.crear<Transaccion>('/pagos', {
        concepto,
        monto,
        metodoPagoId,
      });
      this.transacciones.push(transaccion);
      return transaccion;
    } catch (error) {
      return mensajeDeError(error);
    }
  }

  async confirmarPagoPasarela(datos: {
    concepto: string;
    monto: number;
    metodoPagoId?: number;
    metodoNombre: string;
    pasarela: string;
    referencia: string;
    usuario?: string;
    cedula?: string;
    correo?: string;
    gimnasioNombre?: string;
  }): Promise<Transaccion | string> {
    try {
      const transaccion = await this.api.crear<Transaccion>('/pagos/pasarela', datos);
      this.transacciones.push(transaccion);
      return transaccion;
    } catch (error) {
      return mensajeDeError(error);
    }
  }

  listarTransacciones(): Transaccion[] {
    return this.transacciones;
  }
}
