import { Injectable, signal } from '@angular/core';

export type MetodoWompiSandbox = 'NEQUI' | 'PSE' | 'CARD' | 'BANCOLOMBIA';

export interface SolicitudWompiCheckout {
  concepto: string;
  monto: number;
  moneda?: string;
  usuario?: string;
  correo?: string;
  cedula?: string;
  celular?: string;
  gimnasioNombre?: string;
  metodoInicial?: string;
}

export interface ResultadoWompiCheckout {
  aprobado: boolean;
  estadoPago: 'Aprobada y pagada' | 'Cancelada';
  pasarela: string;
  referencia: string;
  metodoNombre: string;
  fecha: string;
  fechaHora: string;
}

declare global {
  interface Window {
    WidgetCheckout?: new (config: Record<string, unknown>) => {
      open: (callback: (result: { transaction?: { id?: string; status?: string; paymentMethodType?: string } }) => void) => void;
    };
  }
}

/**
 * Servicio central de pasarela Wompi Sandbox para pruebas de pago en COP.
 * - Si configuras tu llave pública de prueba (`pub_test_...`) en `WOMPI_PUBLIC_KEY`,
 *   abre el Widget oficial de Wompi Sandbox.
 * - Si `WOMPI_PUBLIC_KEY` está vacío, abre la pasarela integrada Wompi Sandbox
 *   lista para aprobar Nequi, PSE y Tarjetas ficticias al instante y registrar
 *   el pago en PostgreSQL.
 */
@Injectable({ providedIn: 'root' })
export class WompiPasarelaService {
  readonly WOMPI_PUBLIC_KEY = '';

  readonly sesionCheckout = signal<{
    solicitud: SolicitudWompiCheckout;
    referencia: string;
  } | null>(null);

  private resolverActual: ((res: ResultadoWompiCheckout | null) => void) | null = null;

  generarReferencia(): string {
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `WMP-THF-${Date.now().toString().slice(-6)}-${rnd}`;
  }

  async pagarConSandbox(solicitud: SolicitudWompiCheckout): Promise<ResultadoWompiCheckout | null> {
    const referencia = this.generarReferencia();

    if (this.WOMPI_PUBLIC_KEY.startsWith('pub_test_') && typeof window !== 'undefined') {
      const widgetOk = await this.cargarScriptWompi();
      if (widgetOk && window.WidgetCheckout) {
        return new Promise((resolve) => {
          const checkout = new window.WidgetCheckout!({
            currency: solicitud.moneda || 'COP',
            amountInCents: Math.max(100, Math.round(solicitud.monto * 100)),
            reference: referencia,
            publicKey: this.WOMPI_PUBLIC_KEY,
            customerData: {
              email: solicitud.correo || 'pruebas@thehousefit.co',
              fullName: solicitud.usuario || 'Atleta The House Fit',
              phoneNumber: solicitud.celular || '3001234567',
              phoneNumberPrefix: '+57',
              legalId: solicitud.cedula || '1094000000',
              legalIdType: 'CC',
            },
          });

          checkout.open((result) => {
            const tx = result?.transaction;
            if (tx && tx.status === 'APPROVED') {
              const ahora = new Date();
              resolve({
                aprobado: true,
                estadoPago: 'Aprobada y pagada',
                pasarela: 'Wompi Sandbox Oficial',
                referencia: tx.id || referencia,
                metodoNombre: tx.paymentMethodType || 'Wompi Sandbox',
                fecha: ahora.toISOString().slice(0, 10),
                fechaHora: ahora.toISOString().replace('T', ' ').slice(0, 19),
              });
            } else {
              resolve(null);
            }
          });
        });
      }
    }

    return new Promise((resolve) => {
      this.resolverActual = resolve;
      this.sesionCheckout.set({ solicitud, referencia });
    });
  }

  completarDesdeModal(resultado: ResultadoWompiCheckout | null): void {
    const resolver = this.resolverActual;
    this.resolverActual = null;
    this.sesionCheckout.set(null);
    if (resolver) {
      resolver(resultado);
    }
  }

  private cargarScriptWompi(): Promise<boolean> {
    if (window.WidgetCheckout) return Promise.resolve(true);
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.wompi.co/widget.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }
}
