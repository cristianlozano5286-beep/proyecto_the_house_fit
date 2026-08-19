import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PagosService } from '../../services/pagos';
import { AuthService } from '../../services/auth';
import { MetodoPago, Transaccion } from '../../models/pagos.models';

@Component({
  selector: 'app-pagos',
  imports: [FormsModule],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class PagosComponent implements OnInit {
  metodos: MetodoPago[] = [];
  transacciones: Transaccion[] = [];
  metodoSeleccionado: MetodoPago | null = null;

  concepto = 'Membresía mensual - Plan estándar';
  monto = 90000;

  procesando = false;
  transaccionExitosa: Transaccion | null = null;

  constructor(private pagosService: PagosService, private authService: AuthService) {}

  ngOnInit(): void {
    // HU41: listar métodos de pago disponibles
    this.metodos = this.pagosService.listarMetodos();
    this.cargarTransacciones();
  }

  cargarTransacciones(): void {
    this.transacciones = this.pagosService.listarTransacciones(this.authService.obtenerNombre());
  }

  seleccionarMetodo(metodo: MetodoPago): void {
    this.metodoSeleccionado = metodo;
    this.transaccionExitosa = null;
  }

  // HU42, HU43: integración simulada con la pasarela y redirección al método elegido
  pagar(): void {
    if (!this.metodoSeleccionado) return;
    this.procesando = true;
    setTimeout(() => {
      const transaccion = this.pagosService.procesarPago(
        this.authService.obtenerNombre(),
        this.concepto,
        this.monto,
        this.metodoSeleccionado!.id,
      );
      this.transaccionExitosa = transaccion;
      this.procesando = false;
      this.cargarTransacciones();
    }, 1200);
  }

  formatearPrecio(valor: number): string {
    return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  }

  nombreMetodo(id: number): string {
    return this.metodos.find((m) => m.id === id)?.nombre ?? 'Método';
  }
}
