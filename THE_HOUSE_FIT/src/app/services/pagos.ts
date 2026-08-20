import { Injectable } from '@angular/core';
import { MetodoPago, Transaccion } from '../models/pagos.models';
import { storage } from './storage';

const KEY_TRANSACCIONES = 'thehousefit_transacciones';

@Injectable({ providedIn: 'root' })
export class PagosService {
  private metodos: MetodoPago[] = [
    { id: 1, nombre: 'Tarjeta de crédito/débito', icono: '💳', descripcion: 'Pago seguro con Visa, Mastercard u otras.', disponible: true },
    { id: 2, nombre: 'PSE', icono: '🏦', descripcion: 'Pago directo desde tu cuenta bancaria.', disponible: true },
    { id: 3, nombre: 'Efectivo en gimnasio', icono: '💵', descripcion: 'Paga directamente en recepción.', disponible: true },
    { id: 4, nombre: 'Nequi / Daviplata', icono: '📱', descripcion: 'Pago rápido desde tu billetera digital.', disponible: true },
  ];

  private transacciones: Transaccion[] = [];

  constructor() {
    const datos = storage.getItem(KEY_TRANSACCIONES);
    this.transacciones = datos ? JSON.parse(datos) : [];
  }

  listarMetodos(): MetodoPago[] {
    return this.metodos.filter((m) => m.disponible);
  }

  // Simula la integración con una pasarela de pago externa (HU42) y
  // la redirección al método de pago seleccionado (HU43).
  procesarPago(usuario: string, concepto: string, monto: number, metodoPagoId: number): Transaccion {
    const id = this.transacciones.length ? Math.max(...this.transacciones.map((t) => t.id)) + 1 : 1;
    const transaccion: Transaccion = {
      id,
      usuario,
      concepto,
      monto,
      metodoPagoId,
      estado: 'Aprobado',
      fecha: new Date().toISOString().slice(0, 10),
    };
    this.transacciones.push(transaccion);
    storage.setItem(KEY_TRANSACCIONES, JSON.stringify(this.transacciones));
    return transaccion;
  }

  listarTransacciones(usuario: string): Transaccion[] {
    return this.transacciones.filter((t) => t.usuario === usuario);
  }
}
