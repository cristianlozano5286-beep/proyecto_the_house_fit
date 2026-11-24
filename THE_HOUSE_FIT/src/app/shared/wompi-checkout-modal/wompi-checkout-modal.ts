import {
  Component,
  ElementRef,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MetodoWompiSandbox,
  ResultadoWompiCheckout,
  WompiPasarelaService,
} from '../../services/wompi-pasarela';

@Component({
  selector: 'app-wompi-checkout-modal',
  imports: [FormsModule],
  templateUrl: './wompi-checkout-modal.html',
  styleUrl: './wompi-checkout-modal.css',
})
export class WompiCheckoutModalComponent {
  readonly wompiService = inject(WompiPasarelaService);

  @ViewChild('wompiDialog') wompiDialogRef?: ElementRef<HTMLDialogElement>;

  readonly metodo = signal<MetodoWompiSandbox>('NEQUI');
  readonly paso = signal<'seleccion' | 'procesando' | 'aprobado'>('seleccion');
  readonly resultado = signal<ResultadoWompiCheckout | null>(null);

  // Datos ficticios precargados para pruebas rápidas en Sandbox
  celularNequi = '399 111 1111';
  bancoPse = 'Bancolombia';
  tarjetaNumero = '4242 4242 4242 4242';
  tarjetaExp = '12/29';
  tarjetaCvc = '123';

  private timerProceso: ReturnType<typeof setTimeout> | null = null;
  private timerCierre: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const sesion = this.wompiService.sesionCheckout();
      if (sesion) {
        this.paso.set('seleccion');
        this.resultado.set(null);
        const init = (sesion.solicitud.metodoInicial || '').toLowerCase();
        if (init.includes('tarjeta')) {
          this.metodo.set('CARD');
        } else if (init.includes('pse')) {
          this.metodo.set('PSE');
        } else if (init.includes('bancolombia')) {
          this.metodo.set('BANCOLOMBIA');
        } else {
          this.metodo.set('NEQUI');
        }

        setTimeout(() => {
          const dialog = this.wompiDialogRef?.nativeElement;
          if (dialog && !dialog.open) {
            dialog.showModal();
          }
        }, 0);
      } else {
        const dialog = this.wompiDialogRef?.nativeElement;
        if (dialog?.open) {
          dialog.close();
        }
      }
    });
  }

  formatoCop(monto: number, moneda = 'COP'): string {
    const val = moneda === 'COP' ? monto.toLocaleString('es-CO') : monto.toLocaleString('en-US');
    return `$${val} ${moneda}`;
  }

  etiquetaMetodo(): string {
    switch (this.metodo()) {
      case 'NEQUI':
        return 'Wompi · Nequi Sandbox';
      case 'PSE':
        return `Wompi · PSE (${this.bancoPse})`;
      case 'CARD':
        return 'Wompi · Tarjeta Visa Sandbox';
      case 'BANCOLOMBIA':
        return 'Wompi · Botón Bancolombia';
    }
  }

  confirmarPagoSandbox(): void {
    const sesion = this.wompiService.sesionCheckout();
    if (!sesion || this.paso() !== 'seleccion') return;

    this.paso.set('procesando');
    if (this.timerProceso) clearTimeout(this.timerProceso);
    if (this.timerCierre) clearTimeout(this.timerCierre);

    this.timerProceso = setTimeout(() => {
      const ahora = new Date();
      const yyyy = ahora.getFullYear();
      const mm = String(ahora.getMonth() + 1).padStart(2, '0');
      const dd = String(ahora.getDate()).padStart(2, '0');
      const hh = String(ahora.getHours()).padStart(2, '0');
      const mi = String(ahora.getMinutes()).padStart(2, '0');
      const ss = String(ahora.getSeconds()).padStart(2, '0');

      const res: ResultadoWompiCheckout = {
        aprobado: true,
        estadoPago: 'Aprobada y pagada',
        pasarela: 'Wompi Sandbox',
        referencia: sesion.referencia,
        metodoNombre: this.etiquetaMetodo(),
        fecha: `${yyyy}-${mm}-${dd}`,
        fechaHora: `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`,
      };
      this.resultado.set(res);
      this.paso.set('aprobado');
    }, 650);
  }

  finalizarYAceptar(): void {
    const res = this.resultado();
    const dialog = this.wompiDialogRef?.nativeElement;
    if (dialog?.open) {
      dialog.close();
    }
    this.wompiService.completarDesdeModal(res);
  }

  cancelar(): void {
    if (this.timerProceso) clearTimeout(this.timerProceso);
    if (this.timerCierre) clearTimeout(this.timerCierre);
    const dialog = this.wompiDialogRef?.nativeElement;
    if (dialog?.open) {
      dialog.close();
    }
    this.wompiService.completarDesdeModal(null);
  }

  onDialogCancel(event: Event): void {
    event.preventDefault();
    if (this.paso() === 'aprobado') {
      this.finalizarYAceptar();
    } else {
      this.cancelar();
    }
  }

  onDialogNativeClose(): void {
    const dialog = this.wompiDialogRef?.nativeElement;
    if (dialog) {
      dialog.returnValue = '';
    }
    if (this.wompiService.sesionCheckout()) {
      this.wompiService.completarDesdeModal(this.paso() === 'aprobado' ? this.resultado() : null);
    }
  }
}
