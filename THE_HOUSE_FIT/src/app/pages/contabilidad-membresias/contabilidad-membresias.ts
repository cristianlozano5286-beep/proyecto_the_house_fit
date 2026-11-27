import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  AfiliadoMembresiaGym,
  EstadoMembresiaGym,
  MembresiasContabilidadService,
  RegistroIngresoCedula,
  TipoMembresiaGym,
} from '../../services/membresias-contabilidad';
import { GimnasiosService } from '../../services/gimnasios';
import { AuthService } from '../../services/auth';
import { Gimnasio } from '../../models/catalogo.models';

@Component({
  selector: 'app-contabilidad-membresias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contabilidad-membresias.html',
  styleUrl: './contabilidad-membresias.css',
})
export class ContabilidadMembresiasComponent implements OnInit {
  nombreUsuario: string = 'Daniel';
  misGimnasios: Gimnasio[] = [];
  gimnasioFiltroId: number = 0; // 0 = Todos mis gimnasios

  // Verificador de ingreso por cédula en tiempo real
  cedulaBusquedaIngreso: string = '';
  resultadoVerificacion: {
    buscado: boolean;
    cedulaConsultada: string;
    afiliado: AfiliadoMembresiaGym | null;
    estado: EstadoMembresiaGym | 'No registrado';
    diasRestantes: number;
    mensajeIngreso?: string;
    ingresoRegistradoExito?: boolean;
  } | null = null;

  // Filtros de la tabla contable
  filtroTexto: string = '';
  filtroTipo: 'todos' | TipoMembresiaGym = 'todos';
  filtroEstado: 'todos' | EstadoMembresiaGym = 'todos';

  // Modal / Panel de registro de nuevo pago de membresía
  mostrarFormularioNuevo = false;
  editandoId: number | null = null;
  formMembresia: {
    gimnasioId: number;
    nombre: string;
    cedula: string;
    correo: string;
    celular: string;
    direccionResidencia: string;
    tipoMembresia: TipoMembresiaGym;
    monto: number;
    metodoPago: string;
  } = {
    gimnasioId: 1,
    nombre: '',
    cedula: '',
    correo: '',
    celular: '',
    direccionResidencia: '',
    tipoMembresia: 'mensual',
    monto: 95000,
    metodoPago: 'Efectivo en Recepción',
  };

  afiliados: AfiliadoMembresiaGym[] = [];
  bitacoraIngresos: RegistroIngresoCedula[] = [];

  toast: { tipo: 'exito' | 'error' | 'info'; texto: string } | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private contabilidadService: MembresiasContabilidadService,
    private gimnasiosService: GimnasiosService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.sincronizarSedesYDatos();
  }

  // --- Dropdown personalizado de sede ---
  sedeDropdownAbierto = false;

  toggleSedeDropdown(): void {
    this.sedeDropdownAbierto = !this.sedeDropdownAbierto;
  }

  seleccionarSede(id: number): void {
    this.sedeDropdownAbierto = false;
    this.cambiarGimnasioFiltro(id);
  }

  get nombreSedeActiva(): string {
    if (this.gimnasioFiltroId === 0) return `Todas mis sedes (${this.misGimnasios.length})`;
    const gym = this.misGimnasios.find((g) => g.id === this.gimnasioFiltroId);
    return gym ? `${gym.nombre} — ${gym.ciudad}` : 'Seleccionar sede';
  }

  // --- Dropdown personalizado de método de pago (modal) ---
  metodoDropdownAbierto = false;

  toggleMetodoDropdown(): void {
    this.gymModalDropdownAbierto = false;
    this.metodoDropdownAbierto = !this.metodoDropdownAbierto;
  }

  seleccionarMetodo(metodo: string): void {
    this.metodoDropdownAbierto = false;
    this.formMembresia.metodoPago = metodo;
  }

  get nombreMetodoActivo(): string {
    return this.formMembresia.metodoPago || 'Seleccionar método';
  }

  // --- Dropdown personalizado de gimnasio (modal) ---
  gymModalDropdownAbierto = false;

  toggleGymModalDropdown(): void {
    this.metodoDropdownAbierto = false;
    this.gymModalDropdownAbierto = !this.gymModalDropdownAbierto;
  }

  seleccionarGymModal(id: number): void {
    this.gymModalDropdownAbierto = false;
    this.formMembresia.gimnasioId = id;
    this.actualizarMontoSugeridoPorGimnasio();
  }

  get nombreGymModalActivo(): string {
    const gym = this.misGimnasios.find((g) => g.id === this.formMembresia.gimnasioId);
    return gym ? `${gym.nombre} (${gym.ciudad})` : 'Seleccionar gimnasio';
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.sedeDropdownAbierto = false;
    this.metodoDropdownAbierto = false;
    this.gymModalDropdownAbierto = false;
  }

  salirAlPanel(): void {
    this.router.navigate(['/panel/dashboard']);
  }

  private sincronizarSedesYDatos(): void {
    const nombreCompleto = this.authService.obtenerNombre() || 'Daniel';
    this.nombreUsuario = nombreCompleto.split(' ')[0] || nombreCompleto;
    const todosGyms = this.gimnasiosService.listar();
    const rol = this.authService.obtenerRol();
    const propios =
      rol === 'Creador gym'
        ? todosGyms.filter((g) => this.gimnasiosService.puedeGestionar(g))
        : todosGyms;

    this.misGimnasios = propios.length > 0 ? propios : todosGyms;

    if (this.misGimnasios.length > 0 && !this.misGimnasios.some((g) => g.id === this.formMembresia.gimnasioId)) {
      this.formMembresia.gimnasioId = this.misGimnasios[0].id;
      this.actualizarMontoSugeridoPorGimnasio();
    }

    this.recargarDatos();
  }

  async ngOnInit(): Promise<void> {
    this.sincronizarSedesYDatos();
    try {
      await Promise.all([
        this.gimnasiosService.cargar(),
        this.contabilidadService.cargar(),
      ]);
    } catch {
      // Usa datos en memoria
    }

    this.sincronizarSedesYDatos();
    this.cdr.markForCheck();
  }

  recargarDatos(): void {
    const idsPermitidos =
      this.gimnasioFiltroId > 0
        ? [this.gimnasioFiltroId]
        : this.misGimnasios.map((g) => g.id);

    const nombresPermitidos =
      this.gimnasioFiltroId > 0
        ? this.misGimnasios.filter((g) => g.id === this.gimnasioFiltroId).map((g) => g.nombre)
        : this.misGimnasios.map((g) => g.nombre);

    this.afiliados = this.contabilidadService.listarPorGimnasios(idsPermitidos, nombresPermitidos);
    this.bitacoraIngresos = this.contabilidadService
      .listarBitacoraIngresos(this.gimnasioFiltroId > 0 ? this.gimnasioFiltroId : undefined)
      .slice(0, 12);
    this.cdr.markForCheck();
  }

  cambiarGimnasioFiltro(id: number): void {
    this.gimnasioFiltroId = Number(id);
    this.recargarDatos();
    if (this.resultadoVerificacion?.buscado) {
      this.consultarCedulaIngreso();
    }
  }

  // --- 1. VERIFICADOR DE INGRESO POR CÉDULA ---
  async consultarCedulaIngreso(): Promise<void> {
    const cedula = (this.cedulaBusquedaIngreso || '').trim();
    if (!cedula) {
      this.mostrarNotificacion('error', 'Ingresa un número de cédula para verificar el estado de su membresía.');
      return;
    }

    const gymId = this.gimnasioFiltroId > 0 ? this.gimnasioFiltroId : undefined;

    // 1. Búsqueda inmediata en memoria para respuesta instantánea
    let encontrado = this.contabilidadService.buscarPorCedula(cedula, gymId);
    if (encontrado) {
      this.aplicarResultadoVerificacion(cedula, encontrado);
    }

    // 2. Sincronización en vivo con PostgreSQL por si el afiliado acaba de pagar en otra ventana
    encontrado = await this.contabilidadService.buscarPorCedulaAsync(cedula, gymId);
    this.recargarDatos();
    this.aplicarResultadoVerificacion(cedula, encontrado);
  }

  private aplicarResultadoVerificacion(cedula: string, encontrado: AfiliadoMembresiaGym | null): void {
    if (!encontrado) {
      this.resultadoVerificacion = {
        buscado: true,
        cedulaConsultada: cedula,
        afiliado: null,
        estado: 'No registrado',
        diasRestantes: 0,
      };
      this.cdr.markForCheck();
      return;
    }

    const estado = this.contabilidadService.calcularEstado(encontrado);
    const dias = this.contabilidadService.diasRestantes(encontrado);

    this.resultadoVerificacion = {
      buscado: true,
      cedulaConsultada: cedula,
      afiliado: encontrado,
      estado,
      diasRestantes: dias,
    };
    this.cdr.markForCheck();
  }

  confirmarIngresoEnPorteria(afiliado: AfiliadoMembresiaGym): void {
    const res = this.contabilidadService.registrarIngresoPorCedula(
      afiliado.cedula,
      afiliado.gimnasioId
    );
    this.recargarDatos();

    if (this.resultadoVerificacion && this.resultadoVerificacion.afiliado) {
      this.resultadoVerificacion.afiliado = res.afiliado;
      this.resultadoVerificacion.mensajeIngreso = res.mensaje;
      this.resultadoVerificacion.ingresoRegistradoExito = res.exito;
    }

    this.mostrarNotificacion(res.exito ? 'exito' : 'error', res.mensaje);
  }

  verificarRapidoDesdeTabla(afiliado: AfiliadoMembresiaGym): void {
    this.cedulaBusquedaIngreso = afiliado.cedula;
    this.consultarCedulaIngreso();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  limpiarVerificador(): void {
    this.cedulaBusquedaIngreso = '';
    this.resultadoVerificacion = null;
  }

  abrirRegistroConCedula(cedulaPrellena: string): void {
    this.abrirModalNuevoPago();
    this.formMembresia.cedula = cedulaPrellena;
  }

  // --- 2. MÉTRICAS CONTABLES ---
  get totalRecaudadoGeneral(): number {
    return this.afiliados.reduce((acc, a) => acc + (Number(a.monto) || 0), 0);
  }

  get totalRecaudadoMensual(): number {
    return this.afiliados
      .filter((a) => a.tipoMembresia === 'mensual')
      .reduce((acc, a) => acc + (Number(a.monto) || 0), 0);
  }

  get totalRecaudadoDiario(): number {
    return this.afiliados
      .filter((a) => a.tipoMembresia === 'diaria')
      .reduce((acc, a) => acc + (Number(a.monto) || 0), 0);
  }

  get cantidadMensuales(): number {
    return this.afiliados.filter((a) => a.tipoMembresia === 'mensual').length;
  }

  get cantidadDiarios(): number {
    return this.afiliados.filter((a) => a.tipoMembresia === 'diaria').length;
  }

  get cantidadActivos(): number {
    return this.afiliados.filter((a) => this.estadoDe(a) === 'Activa').length;
  }

  get cantidadVencidos(): number {
    return this.afiliados.filter((a) => this.estadoDe(a) === 'Vencida').length;
  }

  // --- 3. LISTADO FILTRADO ---
  get afiliadosFiltrados(): AfiliadoMembresiaGym[] {
    const q = (this.filtroTexto || '').trim().toLowerCase();

    return this.afiliados.filter((a) => {
      if (this.filtroTipo !== 'todos' && a.tipoMembresia !== this.filtroTipo) {
        return false;
      }
      const est = this.estadoDe(a);
      if (this.filtroEstado !== 'todos' && est !== this.filtroEstado) {
        return false;
      }
      if (!q) return true;

      return (
        a.cedula.toLowerCase().includes(q) ||
        a.nombre.toLowerCase().includes(q) ||
        a.correo.toLowerCase().includes(q) ||
        a.celular.toLowerCase().includes(q) ||
        a.direccionResidencia.toLowerCase().includes(q) ||
        a.gimnasioNombre.toLowerCase().includes(q)
      );
    });
  }

  estadoDe(afiliado: AfiliadoMembresiaGym): EstadoMembresiaGym {
    return this.contabilidadService.calcularEstado(afiliado);
  }

  diasRestantesDe(afiliado: AfiliadoMembresiaGym): number {
    return this.contabilidadService.diasRestantes(afiliado);
  }

  // --- 4. REGISTRO Y EDICIÓN DE PAGO DE MEMBRESÍA ---
  abrirModalNuevoPago(): void {
    this.editandoId = null;
    const gymDefault =
      this.gimnasioFiltroId > 0
        ? this.misGimnasios.find((g) => g.id === this.gimnasioFiltroId) || this.misGimnasios[0]
        : this.misGimnasios[0];

    const precioBase = gymDefault?.precio || 95000;
    this.formMembresia = {
      gimnasioId: gymDefault?.id || 1,
      nombre: '',
      cedula: '',
      correo: '',
      celular: '',
      direccionResidencia: '',
      tipoMembresia: 'mensual',
      monto: precioBase,
      metodoPago: 'Efectivo en Recepción',
    };
    this.mostrarFormularioNuevo = true;
  }

  editarAfiliado(afiliado: AfiliadoMembresiaGym): void {
    this.editandoId = afiliado.id;
    this.formMembresia = {
      gimnasioId: afiliado.gimnasioId,
      nombre: afiliado.nombre,
      cedula: afiliado.cedula,
      correo: afiliado.correo,
      celular: afiliado.celular,
      direccionResidencia: afiliado.direccionResidencia,
      tipoMembresia: afiliado.tipoMembresia,
      monto: afiliado.monto,
      metodoPago: afiliado.metodoPago,
    };
    this.mostrarFormularioNuevo = true;
  }

  cerrarModalNuevoPago(): void {
    this.mostrarFormularioNuevo = false;
    this.editandoId = null;
  }

  actualizarMontoSugeridoPorGimnasio(): void {
    const gym = this.misGimnasios.find((g) => g.id === Number(this.formMembresia.gimnasioId));
    const baseMensual = gym?.precio || 95000;
    this.formMembresia.monto =
      this.formMembresia.tipoMembresia === 'mensual'
        ? baseMensual
        : Math.max(12000, Math.round(baseMensual / 8));
  }

  seleccionarTipoMembresiaForm(tipo: TipoMembresiaGym): void {
    this.formMembresia.tipoMembresia = tipo;
    this.actualizarMontoSugeridoPorGimnasio();
  }

  guardarPagoMembresia(): void {
    if (!this.formMembresia.nombre.trim()) {
      this.mostrarNotificacion('error', 'Por favor ingresa el nombre completo de la persona.');
      return;
    }
    if (!this.formMembresia.cedula.trim()) {
      this.mostrarNotificacion('error', 'Por favor ingresa el número de cédula.');
      return;
    }
    if (!this.formMembresia.correo.trim()) {
      this.mostrarNotificacion('error', 'Por favor ingresa el correo electrónico.');
      return;
    }
    if (!this.formMembresia.celular.trim()) {
      this.mostrarNotificacion('error', 'Por favor ingresa el número de celular.');
      return;
    }
    if (!this.formMembresia.direccionResidencia.trim()) {
      this.mostrarNotificacion('error', 'Por favor ingresa la dirección de residencia.');
      return;
    }

    const gym =
      this.misGimnasios.find((g) => g.id === Number(this.formMembresia.gimnasioId)) ||
      this.misGimnasios[0];

    const guardado = this.contabilidadService.registrarPagoMembresia({
      gimnasioId: gym?.id || 1,
      gimnasioNombre: gym?.nombre || 'Sede The House Fit',
      nombre: this.formMembresia.nombre,
      cedula: this.formMembresia.cedula,
      correo: this.formMembresia.correo,
      celular: this.formMembresia.celular,
      direccionResidencia: this.formMembresia.direccionResidencia,
      tipoMembresia: this.formMembresia.tipoMembresia,
      monto: Number(this.formMembresia.monto) || 0,
      moneda: gym?.moneda || 'COP',
      metodoPago: this.formMembresia.metodoPago,
    });

    this.mostrarFormularioNuevo = false;
    this.recargarDatos();
    this.cedulaBusquedaIngreso = guardado.cedula;
    this.consultarCedulaIngreso();

    this.mostrarNotificacion(
      'exito',
      `Pago de ${guardado.tipoMembresia === 'mensual' ? 'Membresía Mensual' : 'Pase Diario'} registrado para ${guardado.nombre} (CC ${guardado.cedula}).`
    );
  }

  renovarRapido(afiliado: AfiliadoMembresiaGym, tipo: TipoMembresiaGym): void {
    const gym = this.misGimnasios.find((g) => g.id === afiliado.gimnasioId);
    const baseMensual = gym?.precio || 95000;
    const montoNuevo =
      tipo === 'mensual' ? baseMensual : Math.max(12000, Math.round(baseMensual / 8));

    this.contabilidadService.renovarMembresia(afiliado.id, tipo, montoNuevo);
    this.recargarDatos();
    if (this.resultadoVerificacion?.afiliado?.id === afiliado.id) {
      this.consultarCedulaIngreso();
    }
    this.mostrarNotificacion(
      'exito',
      `Membresía ${tipo === 'mensual' ? 'Mensual' : 'Diaria'} renovada para ${afiliado.nombre} (CC ${afiliado.cedula}).`
    );
  }

  eliminarRegistro(afiliado: AfiliadoMembresiaGym): void {
    this.contabilidadService.eliminarAfiliado(afiliado.id);
    this.recargarDatos();
    if (this.resultadoVerificacion?.afiliado?.id === afiliado.id) {
      this.limpiarVerificador();
    }
    this.mostrarNotificacion('info', `Se eliminó el registro de ${afiliado.nombre}.`);
  }

  formatearMoneda(valor: number, moneda: string = 'COP'): string {
    if (moneda === 'EUR') return `€${valor.toLocaleString('es-ES')} EUR`;
    if (moneda === 'USD') return `$${valor.toLocaleString('en-US')} USD`;
    return `$${(Number(valor) || 0).toLocaleString('es-CO')} COP`;
  }

  mostrarNotificacion(tipo: 'exito' | 'error' | 'info', texto: string): void {
    this.toast = { tipo, texto };
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast = null;
    }, 4500);
  }
}
