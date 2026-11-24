import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { GimnasiosService } from './gimnasios';
import { AuthService } from './auth';

export type TipoMembresiaGym = 'mensual' | 'diaria';
export type EstadoMembresiaGym = 'Activa' | 'Vencida';

export interface RegistroIngresoCedula {
  id: number;
  afiliadoId: number;
  cedula: string;
  nombre: string;
  gimnasioId: number;
  gimnasioNombre: string;
  tipoMembresia: TipoMembresiaGym;
  fechaHora: string;
  autorizado: boolean;
  observacion: string;
}

export interface AfiliadoMembresiaGym {
  id: number;
  gimnasioId: number;
  gimnasioNombre: string;
  nombre: string;
  cedula: string;
  correo: string;
  celular: string;
  direccionResidencia: string;
  tipoMembresia: TipoMembresiaGym;
  monto: number;
  moneda: string;
  metodoPago: string;
  fechaPago: string;       // YYYY-MM-DD
  fechaVencimiento: string; // YYYY-MM-DD
  totalIngresos: number;
  ultimoIngreso?: string;
  estadoPago?: string;
  pasarela?: string;
  referenciaPago?: string;
  fechaHoraPago?: string;
}

const STORAGE_KEY_AFILIADOS = 'thehousefit_contabilidad_membresias_v2';
const STORAGE_KEY_INGRESOS = 'thehousefit_ingresos_cedula_v2';

@Injectable({ providedIn: 'root' })
export class MembresiasContabilidadService {
  private afiliados: AfiliadoMembresiaGym[] = [];
  private bitacoraIngresos: RegistroIngresoCedula[] = [];

  constructor(
    private api: ApiService,
    private gimnasiosService: GimnasiosService,
    private authService: AuthService
  ) {
    this.cargarDesdeStorage();
  }

  private hoyISO(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private sumarDiasISO(fechaBaseISO: string, dias: number): string {
    const partes = fechaBaseISO.split('-').map(Number);
    const fecha =
      partes.length === 3
        ? new Date(partes[0], partes[1] - 1, partes[2])
        : new Date();
    fecha.setDate(fecha.getDate() + dias);
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private ahoraFormateado(): string {
    const ahora = new Date();
    return ahora.toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private normalizarAfiliado(raw: any): AfiliadoMembresiaGym {
    const hoy = this.hoyISO();
    const tipo: TipoMembresiaGym = raw?.tipoMembresia === 'diaria' ? 'diaria' : 'mensual';
    return {
      id: Number(raw?.id) || Date.now(),
      gimnasioId: Number(raw?.gimnasioId) || 12,
      gimnasioNombre: String(raw?.gimnasioNombre || 'KAIROS GYM'),
      nombre: String(raw?.nombre || '').trim(),
      cedula: String(raw?.cedula || '').trim(),
      correo: String(raw?.correo || '').trim(),
      celular: String(raw?.celular || '').trim(),
      direccionResidencia: String(raw?.direccionResidencia || '').trim(),
      tipoMembresia: tipo,
      monto: Number(raw?.monto) || 0,
      moneda: String(raw?.moneda || 'COP'),
      metodoPago: String(raw?.metodoPago || 'Transferencia / Nequi'),
      fechaPago: String(raw?.fechaPago || hoy),
      fechaVencimiento: String(
        raw?.fechaVencimiento || (tipo === 'mensual' ? this.sumarDiasISO(hoy, 30) : hoy)
      ),
      totalIngresos: Number(raw?.totalIngresos) || 1,
      ultimoIngreso: String(raw?.ultimoIngreso || 'Recién registrado'),
    };
  }

  private normalizarIngreso(raw: any): RegistroIngresoCedula {
    return {
      id: Number(raw?.id) || Date.now(),
      afiliadoId: Number(raw?.afiliadoId) || 0,
      cedula: String(raw?.cedula || '').trim(),
      nombre: String(raw?.nombre || '').trim(),
      gimnasioId: Number(raw?.gimnasioId) || 12,
      gimnasioNombre: String(raw?.gimnasioNombre || 'KAIROS GYM'),
      tipoMembresia: raw?.tipoMembresia === 'diaria' ? 'diaria' : 'mensual',
      fechaHora: String(raw?.fechaHora || this.ahoraFormateado()),
      autorizado: Boolean(raw?.autorizado ?? true),
      observacion: String(raw?.observacion || ''),
    };
  }

  private generarDatosSemilla(): AfiliadoMembresiaGym[] {
    const hoy = this.hoyISO();
    const gimnasios = this.gimnasiosService.listar();
    const kairosPropio =
      gimnasios.find((g) => g.id === 12) ||
      gimnasios.find((g) => g.nombre.toUpperCase().includes('KAIROS')) ||
      gimnasios[0] || {
        id: 12,
        nombre: 'KAIROS GYM',
        precio: 116351,
        moneda: 'COP',
      };
    const gymSecundario =
      gimnasios.find((g) => g.id !== kairosPropio.id) || kairosPropio;

    return [
      {
        id: 100,
        gimnasioId: kairosPropio.id,
        gimnasioNombre: kairosPropio.nombre,
        nombre: 'Alejandro',
        cedula: '1029660209',
        correo: 'pilodaniel4000@gmail.com',
        celular: '3028185491',
        direccionResidencia: 'Calle 34 A #678, Casa',
        tipoMembresia: 'mensual',
        monto: kairosPropio.precio || 116351,
        moneda: kairosPropio.moneda || 'COP',
        metodoPago: 'Transferencia / Nequi',
        fechaPago: hoy,
        fechaVencimiento: this.sumarDiasISO(hoy, 30),
        totalIngresos: 1,
        ultimoIngreso: 'Hoy · Pago verificado',
      },
      {
        id: 101,
        gimnasioId: kairosPropio.id,
        gimnasioNombre: kairosPropio.nombre,
        nombre: 'Carlos Andrés Mendoza',
        cedula: '1118542390',
        correo: 'carlos.mendoza@gmail.com',
        celular: '3104589210',
        direccionResidencia: 'Calle 24 # 18-35, Barrio El Nogal · Yopal',
        tipoMembresia: 'mensual',
        monto: kairosPropio.precio || 116351,
        moneda: kairosPropio.moneda || 'COP',
        metodoPago: 'Transferencia / Nequi',
        fechaPago: this.sumarDiasISO(hoy, -6),
        fechaVencimiento: this.sumarDiasISO(hoy, 24),
        totalIngresos: 5,
        ultimoIngreso: 'Hoy, 06:45 a. m.',
      },
      {
        id: 102,
        gimnasioId: kairosPropio.id,
        gimnasioNombre: kairosPropio.nombre,
        nombre: 'Laura Valentina Rojas',
        cedula: '1052398412',
        correo: 'laura.rojas.fit@outlook.com',
        celular: '3217845123',
        direccionResidencia: 'Transversal 7 # 35-10, Zona Deportiva · Yopal',
        tipoMembresia: 'diaria',
        monto: 15000,
        moneda: kairosPropio.moneda || 'COP',
        metodoPago: 'Efectivo en Sede',
        fechaPago: hoy,
        fechaVencimiento: hoy,
        totalIngresos: 1,
        ultimoIngreso: 'Hoy, 07:30 a. m.',
      },
      {
        id: 103,
        gimnasioId: gymSecundario.id,
        gimnasioNombre: gymSecundario.nombre,
        nombre: 'Jhon Sebastián Pérez',
        cedula: '1116890451',
        correo: 'jhon.perez@yahoo.com',
        celular: '3148923011',
        direccionResidencia: 'Carrera 19 # 14-60, Barrio Centro · Yopal',
        tipoMembresia: 'mensual',
        monto: gymSecundario.precio || 120000,
        moneda: gymSecundario.moneda || 'COP',
        metodoPago: 'Tarjeta Débito / Crédito',
        fechaPago: this.sumarDiasISO(hoy, -10),
        fechaVencimiento: this.sumarDiasISO(hoy, 20),
        totalIngresos: 8,
        ultimoIngreso: 'Hoy, 08:15 a. m.',
      },
    ];
  }

  /**
   * Sincroniza la contabilidad de membresías y bitácora de ingresos desde PostgreSQL (vía MID)
   */
  async cargar(): Promise<void> {
    try {
      const [remotosAfiliados, remotosIngresos] = await Promise.all([
        this.api.obtener<any>('/membresias'),
        this.api.obtener<any>('/membresias/ingresos').catch(() => []),
      ]);

      if (Array.isArray(remotosAfiliados) && remotosAfiliados.length > 0) {
        // Ordenar más recientes primero
        this.afiliados = remotosAfiliados
          .map((r) => this.normalizarAfiliado(r))
          .sort((a, b) => b.id - a.id);
      } else if (this.afiliados.length === 0) {
        this.afiliados = this.generarDatosSemilla();
      }

      if (Array.isArray(remotosIngresos) && remotosIngresos.length > 0) {
        this.bitacoraIngresos = remotosIngresos
          .map((r) => this.normalizarIngreso(r))
          .sort((a, b) => b.id - a.id);
      }

      this.guardarEnStorage();
    } catch {
      if (this.afiliados.length === 0) {
        this.cargarDesdeStorage();
      }
    }
  }

  private cargarDesdeStorage(): void {
    try {
      const rawAfiliados = localStorage.getItem(STORAGE_KEY_AFILIADOS);
      if (rawAfiliados) {
        const parsed = JSON.parse(rawAfiliados);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.afiliados = parsed.map((r) => this.normalizarAfiliado(r));
        }
      }
      if (this.afiliados.length === 0) {
        this.afiliados = this.generarDatosSemilla();
        this.guardarEnStorage();
      }

      const rawIngresos = localStorage.getItem(STORAGE_KEY_INGRESOS);
      if (rawIngresos) {
        const parsedIng = JSON.parse(rawIngresos);
        if (Array.isArray(parsedIng)) {
          this.bitacoraIngresos = parsedIng.map((r) => this.normalizarIngreso(r));
        }
      }
    } catch {
      this.afiliados = this.generarDatosSemilla();
    }
  }

  private guardarEnStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY_AFILIADOS, JSON.stringify(this.afiliados));
      localStorage.setItem(STORAGE_KEY_INGRESOS, JSON.stringify(this.bitacoraIngresos));
    } catch {
      // Ignorar si localStorage no está disponible
    }
  }

  listarTodos(): AfiliadoMembresiaGym[] {
    return [...this.afiliados];
  }

  /**
   * Devuelve los afiliados correspondientes a las sedes del Creador gym.
   * También incluye afiliados cuyo nombre de sede coincida (p. ej. KAIROS GYM)
   * para evitar que IDs duplicados de sedes oculten pagos reales.
   */
  listarPorGimnasios(gimnasioIds?: number[], nombresSedes?: string[]): AfiliadoMembresiaGym[] {
    if (!gimnasioIds || gimnasioIds.length === 0) {
      return [...this.afiliados];
    }
    const nombresNormalizados = (nombresSedes || [])
      .map((n) => n.trim().toUpperCase())
      .filter(Boolean);

    const filtrados = this.afiliados.filter(
      (a) =>
        gimnasioIds.includes(Number(a.gimnasioId)) ||
        (nombresNormalizados.length > 0 &&
          nombresNormalizados.includes((a.gimnasioNombre || '').trim().toUpperCase()))
    );

    return filtrados.length > 0 ? filtrados : [...this.afiliados];
  }

  listarBitacoraIngresos(gimnasioId?: number): RegistroIngresoCedula[] {
    if (!gimnasioId) {
      return [...this.bitacoraIngresos];
    }
    return this.bitacoraIngresos.filter((r) => Number(r.gimnasioId) === Number(gimnasioId));
  }

  calcularEstado(afiliado: AfiliadoMembresiaGym): EstadoMembresiaGym {
    const hoy = this.hoyISO();
    return afiliado.fechaVencimiento >= hoy ? 'Activa' : 'Vencida';
  }

  diasRestantes(afiliado: AfiliadoMembresiaGym): number {
    const hoyPartes = this.hoyISO().split('-').map(Number);
    const vencPartes = (afiliado.fechaVencimiento || this.hoyISO()).split('-').map(Number);
    const dHoy = new Date(hoyPartes[0], hoyPartes[1] - 1, hoyPartes[2]);
    const dVenc = new Date(vencPartes[0], vencPartes[1] - 1, vencPartes[2]);
    const diffMs = dVenc.getTime() - dHoy.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  buscarPorCedula(cedula: string, gimnasioId?: number): AfiliadoMembresiaGym | null {
    const limpia = (cedula || '').replace(/\D+/g, '').trim();
    if (!limpia) return null;

    const candidatos = this.afiliados.filter(
      (a) =>
        a.cedula.replace(/\D+/g, '') === limpia &&
        (!gimnasioId || Number(a.gimnasioId) === Number(gimnasioId))
    );

    if (candidatos.length === 0) {
      const globalMatch = this.afiliados.filter((a) => a.cedula.replace(/\D+/g, '') === limpia);
      if (globalMatch.length === 0) return null;
      const activoGlobal = globalMatch.find((c) => this.calcularEstado(c) === 'Activa');
      return activoGlobal || globalMatch[0] || null;
    }

    const activo = candidatos.find((c) => this.calcularEstado(c) === 'Activa');
    return activo || candidatos[0] || null;
  }

  /**
   * Consulta en tiempo real contra PostgreSQL antes de buscar la cédula,
   * garantizando que pagos recién hechos desde otra ventana/pestaña se encuentren al instante.
   */
  async buscarPorCedulaAsync(cedula: string, gimnasioId?: number): Promise<AfiliadoMembresiaGym | null> {
    await this.cargar();
    return this.buscarPorCedula(cedula, gimnasioId);
  }

  registrarPagoMembresia(datos: {
    gimnasioId: number;
    gimnasioNombre: string;
    nombre: string;
    cedula: string;
    correo: string;
    celular: string;
    direccionResidencia: string;
    tipoMembresia: TipoMembresiaGym;
    monto: number;
    moneda?: string;
    metodoPago: string;
    estadoPago?: string;
    pasarela?: string;
    referenciaPago?: string;
    fechaHoraPago?: string;
  }): AfiliadoMembresiaGym {
    const hoy = this.hoyISO();
    const fechaHora = datos.fechaHoraPago || new Date().toISOString().replace('T', ' ').slice(0, 19);
    const estadoPago = datos.estadoPago || 'Aprobada y pagada';
    const pasarela = datos.pasarela || 'Wompi Sandbox';
    const referenciaPago = datos.referenciaPago || `WMP-THF-${Date.now()}`;
    const vencimiento =
      datos.tipoMembresia === 'mensual' ? this.sumarDiasISO(hoy, 30) : hoy;

    const metodoAuditado = `${datos.metodoPago} · Aprobado`.slice(0, 80);
    const ultimoIngresoAuditado = `Pagado ${fechaHora} · ${referenciaPago}`.slice(0, 80);

    const cedulaLimpia = datos.cedula.trim();
    const existente = this.afiliados.find(
      (a) =>
        a.cedula.replace(/\D+/g, '') === cedulaLimpia.replace(/\D+/g, '') &&
        Number(a.gimnasioId) === Number(datos.gimnasioId)
    );

    if (existente) {
      existente.nombre = datos.nombre.trim();
      existente.cedula = cedulaLimpia;
      existente.correo = datos.correo.trim();
      existente.celular = datos.celular.trim();
      existente.direccionResidencia = datos.direccionResidencia.trim();
      existente.tipoMembresia = datos.tipoMembresia;
      existente.monto = Number(datos.monto) || 0;
      existente.moneda = datos.moneda || existente.moneda || 'COP';
      existente.metodoPago = metodoAuditado;
      existente.fechaPago = hoy;
      existente.fechaVencimiento = vencimiento;
      existente.ultimoIngreso = ultimoIngresoAuditado;
      existente.estadoPago = estadoPago;
      existente.pasarela = pasarela;
      existente.referenciaPago = referenciaPago;
      existente.fechaHoraPago = fechaHora;
      this.guardarEnStorage();

      const payloadUpdate = {
        gimnasioId: existente.gimnasioId,
        gimnasioNombre: existente.gimnasioNombre,
        nombre: existente.nombre,
        cedula: existente.cedula,
        correo: existente.correo,
        celular: existente.celular,
        direccionResidencia: existente.direccionResidencia,
        tipoMembresia: existente.tipoMembresia,
        monto: existente.monto,
        moneda: existente.moneda,
        metodoPago: existente.metodoPago,
        fechaPago: existente.fechaPago,
        fechaVencimiento: existente.fechaVencimiento,
        totalIngresos: existente.totalIngresos,
        ultimoIngreso: existente.ultimoIngreso,
      };

      this.api
        .actualizar<any>(`/membresias/${existente.id}`, payloadUpdate)
        .catch(() => {
          this.api.crear<any>('/membresias', payloadUpdate).catch(() => {});
        });

      return existente;
    }

    const nuevoId =
      this.afiliados.reduce((max, item) => Math.max(max, Number(item.id) || 0), 100) + 1;

    const nuevo: AfiliadoMembresiaGym = {
      id: nuevoId,
      gimnasioId: Number(datos.gimnasioId) || 12,
      gimnasioNombre: datos.gimnasioNombre,
      nombre: datos.nombre.trim(),
      cedula: cedulaLimpia,
      correo: datos.correo.trim(),
      celular: datos.celular.trim(),
      direccionResidencia: datos.direccionResidencia.trim(),
      tipoMembresia: datos.tipoMembresia,
      monto: Number(datos.monto) || 0,
      moneda: datos.moneda || 'COP',
      metodoPago: metodoAuditado,
      fechaPago: hoy,
      fechaVencimiento: vencimiento,
      totalIngresos: 1,
      ultimoIngreso: ultimoIngresoAuditado,
      estadoPago,
      pasarela,
      referenciaPago,
      fechaHoraPago: fechaHora,
    };

    this.afiliados.unshift(nuevo);
    this.guardarEnStorage();

    // Persistir en PostgreSQL vía MID usando columnas exactas de membresias_gym
    const payload = {
      gimnasioId: nuevo.gimnasioId,
      gimnasioNombre: nuevo.gimnasioNombre,
      nombre: nuevo.nombre,
      cedula: nuevo.cedula,
      correo: nuevo.correo,
      celular: nuevo.celular,
      direccionResidencia: nuevo.direccionResidencia,
      tipoMembresia: nuevo.tipoMembresia,
      monto: nuevo.monto,
      moneda: nuevo.moneda,
      metodoPago: nuevo.metodoPago,
      fechaPago: nuevo.fechaPago,
      fechaVencimiento: nuevo.fechaVencimiento,
      totalIngresos: nuevo.totalIngresos,
      ultimoIngreso: nuevo.ultimoIngreso,
    };
    this.api
      .crear<any>('/membresias', payload)
      .then((creado) => {
        if (creado && creado.id) {
          nuevo.id = Number(creado.id);
          this.guardarEnStorage();
        }
      })
      .catch(() => {});

    return nuevo;
  }

  registrarIngresoPorCedula(cedula: string, gimnasioId?: number): {
    exito: boolean;
    estado: 'autorizado' | 'vencido' | 'no_encontrado';
    mensaje: string;
    afiliado: AfiliadoMembresiaGym | null;
    registro?: RegistroIngresoCedula;
  } {
    const afiliado = this.buscarPorCedula(cedula, gimnasioId);
    const ahora = this.ahoraFormateado();

    if (!afiliado) {
      return {
        exito: false,
        estado: 'no_encontrado',
        mensaje: `No existe ningún afiliado registrado con la cédula ${cedula}.`,
        afiliado: null,
      };
    }

    const estadoMembresia = this.calcularEstado(afiliado);
    const autorizado = estadoMembresia === 'Activa';
    const etiquetaPlan =
      afiliado.tipoMembresia === 'mensual' ? 'Membresía Mensual' : 'Pase Diario';

    if (autorizado) {
      afiliado.totalIngresos = (Number(afiliado.totalIngresos) || 0) + 1;
      afiliado.ultimoIngreso = ahora;
      this.api
        .actualizar<any>(`/membresias/${afiliado.id}`, {
          totalIngresos: afiliado.totalIngresos,
          ultimoIngreso: afiliado.ultimoIngreso,
        })
        .catch(() => {});
    }

    const nuevoRegistro: RegistroIngresoCedula = {
      id: Date.now(),
      afiliadoId: afiliado.id,
      cedula: afiliado.cedula,
      nombre: afiliado.nombre,
      gimnasioId: afiliado.gimnasioId,
      gimnasioNombre: afiliado.gimnasioNombre,
      tipoMembresia: afiliado.tipoMembresia,
      fechaHora: ahora,
      autorizado,
      observacion: autorizado
        ? `Ingreso autorizado (${etiquetaPlan} vigente hasta ${afiliado.fechaVencimiento})`
        : `Ingreso rechazado (${etiquetaPlan} vencida el ${afiliado.fechaVencimiento})`,
    };

    this.bitacoraIngresos.unshift(nuevoRegistro);
    if (this.bitacoraIngresos.length > 60) {
      this.bitacoraIngresos.length = 60;
    }
    this.guardarEnStorage();

    this.api
      .crear<any>('/membresias/ingresos', { ...nuevoRegistro, id: 0 })
      .catch(() => {});

    return {
      exito: autorizado,
      estado: autorizado ? 'autorizado' : 'vencido',
      mensaje: autorizado
        ? `¡Ingreso autorizado para ${afiliado.nombre}! (${etiquetaPlan} activa)`
        : `Membresía vencida el ${afiliado.fechaVencimiento}. Requiere renovación para ingresar.`,
      afiliado,
      registro: nuevoRegistro,
    };
  }

  renovarMembresia(id: number, tipoMembresia?: TipoMembresiaGym, nuevoMonto?: number): AfiliadoMembresiaGym | null {
    const afiliado = this.afiliados.find((a) => Number(a.id) === Number(id));
    if (!afiliado) return null;

    const hoy = this.hoyISO();
    const tipo = tipoMembresia || afiliado.tipoMembresia;
    afiliado.tipoMembresia = tipo;
    if (typeof nuevoMonto === 'number' && nuevoMonto > 0) {
      afiliado.monto = nuevoMonto;
    }
    afiliado.fechaPago = hoy;
    afiliado.fechaVencimiento = tipo === 'mensual' ? this.sumarDiasISO(hoy, 30) : hoy;
    afiliado.ultimoIngreso = this.ahoraFormateado();
    this.guardarEnStorage();

    this.api
      .actualizar<any>(`/membresias/${afiliado.id}`, afiliado)
      .catch(() => {});

    return afiliado;
  }

  eliminarAfiliado(id: number): void {
    this.afiliados = this.afiliados.filter((a) => Number(a.id) !== Number(id));
    this.guardarEnStorage();
    this.api.borrar(`/membresias/${id}`).catch(() => {});
  }
}
