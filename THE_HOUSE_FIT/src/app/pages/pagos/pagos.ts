import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { PagosService } from '../../services/pagos';
import { WompiPasarelaService } from '../../services/wompi-pasarela';
import { MetodoPago, Transaccion } from '../../models/pagos.models';

export interface PlanRapido {
  nombre: string;
  monto: number;
  badge?: string;
}

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class PagosComponent implements OnInit {
  metodos: MetodoPago[] = [];
  transacciones: Transaccion[] = [];
  metodoSeleccionado: MetodoPago | null = null;

  concepto = 'Membresía mensual - Plan estándar';
  monto = 90000;

  planesRapidos: PlanRapido[] = [
    { nombre: 'Membresía mensual - Plan estándar', monto: 90000, badge: 'Popular' },
    { nombre: 'Plan Trimestral - All-Access', monto: 240000, badge: 'Ahorro 15%' },
    { nombre: 'Pase Diario - Acceso Libre', monto: 15000, badge: '1 Día' },
    { nombre: 'Entrenamiento Personalizado (5 Sesiones)', monto: 120000, badge: 'Coaching' },
  ];

  procesando = false;
  transaccionExitosa: Transaccion | null = null;

  toast: { tipo: 'exito' | 'error' | 'info'; texto: string } | null = null;
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private pagosService: PagosService) {}

  private readonly wompiService = inject(WompiPasarelaService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    try {
      await this.pagosService.cargar();
      await this.pagosService.cargarTransacciones();
    } catch {
      // En caso de que el backend no responda, usa los datos en memoria
    }

    this.metodos = this.pagosService.listarMetodos();
    if (this.metodos.length > 0 && !this.metodoSeleccionado) {
      this.metodoSeleccionado = this.metodos[0];
    }
    this.cargarTransacciones();
    this.cdr.markForCheck();
  }

  cargarTransacciones(): void {
    this.transacciones = [...this.pagosService.listarTransacciones()].reverse();
  }

  seleccionarPlan(plan: PlanRapido): void {
    this.concepto = plan.nombre;
    this.monto = plan.monto;
    this.transaccionExitosa = null;
  }

  seleccionarMetodo(metodo: MetodoPago): void {
    this.metodoSeleccionado = metodo;
    this.transaccionExitosa = null;
  }

  async pagar(): Promise<void> {
    if (!this.metodoSeleccionado) {
      this.mostrarToast('error', 'Por favor selecciona un método de pago.');
      return;
    }
    if (!this.concepto.trim()) {
      this.mostrarToast('error', 'Por favor ingresa el concepto del pago.');
      return;
    }
    if (!this.monto || this.monto <= 0) {
      this.mostrarToast('error', 'El monto a pagar debe ser mayor a $ 0 COP.');
      return;
    }

    this.procesando = true;
    this.transaccionExitosa = null;
    this.cdr.markForCheck();

    const usr = this.authService.obtenerUsuario();
    const resPasarela = await this.wompiService.pagarConSandbox({
      concepto: this.concepto.trim(),
      monto: this.monto,
      moneda: 'COP',
      usuario: usr?.nombre,
      correo: usr?.correo,
      metodoInicial: this.metodoSeleccionado.nombre,
    });

    if (!resPasarela?.aprobado) {
      this.procesando = false;
      this.cdr.markForCheck();
      return;
    }

    const respuesta = await this.pagosService.confirmarPagoPasarela({
      concepto: this.concepto.trim(),
      monto: this.monto,
      metodoPagoId: this.metodoSeleccionado.id,
      metodoNombre: resPasarela.metodoNombre,
      pasarela: resPasarela.pasarela,
      referencia: resPasarela.referencia,
      usuario: usr?.nombre,
      correo: usr?.correo,
    });

    this.procesando = false;

    if (typeof respuesta === 'string') {
      this.mostrarToast('error', respuesta);
      this.cdr.markForCheck();
      return;
    }

    this.transaccionExitosa = respuesta;
    this.mostrarToast(
      'exito',
      `Transferencia aprobada (${respuesta.referencia || '#' + respuesta.id}) y guardada en PostgreSQL.`
    );
    this.cargarTransacciones();
    this.cdr.markForCheck();
  }

  formatearPrecio(valor: number): string {
    return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  }

  formatearFecha(fechaStr?: string): string {
    if (!fechaStr) return 'Hoy';
    const partes = fechaStr.split('-');
    if (partes.length === 3) {
      const d = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return fechaStr;
  }

  nombreMetodo(id: number): string {
    return this.metodos.find((m) => m.id === id)?.nombre ?? 'Método de pago';
  }

  iconoMetodo(id: number): string {
    return this.metodos.find((m) => m.id === id)?.icono ?? '💳';
  }

  mostrarToast(tipo: 'exito' | 'error' | 'info', texto: string): void {
    this.toast = { tipo, texto };
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toast = null;
    }, 5000);
  }

  cerrarToast(): void {
    this.toast = null;
  }
}
