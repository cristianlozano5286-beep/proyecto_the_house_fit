import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ContenidoService } from '../../services/contenido';
import { ClasesService } from '../../services/clases';
import { GimnasiosService } from '../../services/gimnasios';
import { AuthService } from '../../services/auth';
import { GuiaFisica, GuiaNutricional, Rutina } from '../../models/contenido.models';
import { ClaseDisponible } from '../../models/clase.models';

type PantallaContenido = 'hub' | 'paso1' | 'paso2' | 'paso3';
type ModuloContenido = 'rutinas' | 'guias' | 'nutricion' | 'clases';

@Component({
  selector: 'app-contenido-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './contenido-admin.html',
  styleUrl: './contenido-admin.css',
})
export class ContenidoAdminComponent implements OnInit {
  pantallaActual: PantallaContenido = 'hub';
  pestanaActiva: ModuloContenido = 'rutinas';
  nombreUsuario = 'Daniel';
  busqueda = '';

  rutinas: Rutina[] = [];
  guiasFisicas: GuiaFisica[] = [];
  guiasNutricionales: GuiaNutricional[] = [];
  clases: ClaseDisponible[] = [];
  gimnasios: { id: number; nombre: string }[] = [];

  idEditar: number | null = null;

  tiposEntrenamientoCards: { id: Rutina['tipoEntrenamiento']; icono: string; desc: string }[] = [
    { id: 'Fuerza', icono: '🏋️', desc: 'Hipertrofia muscular, barra olímpica y mancuernas' },
    { id: 'Cardio', icono: '🏃', desc: 'Resistencia aeróbica, HIIT y capacidad pulmonar' },
    { id: 'Funcional', icono: '⚡', desc: 'Agilidad, potencia, kettlebells y peso corporal' },
    { id: 'Flexibilidad', icono: '🧘', desc: 'Movilidad articular, yoga postural y estiramiento' },
    { id: 'Pérdida de peso', icono: '🔥', desc: 'Circuitos metabólicos de alto gasto calórico' },
  ];

  nivelesCards: { id: Rutina['nivel']; icono: string; desc: string }[] = [
    { id: 'Principiante', icono: '🌱', desc: 'Adaptación anatómica y técnica base' },
    { id: 'Intermedio', icono: '💪', desc: 'Sobrecarga progresiva y volumen medio' },
    { id: 'Avanzado', icono: '🏆', desc: 'Alta intensidad, periodización y fuerza máxima' },
  ];

  categoriasIMCCards: { id: GuiaNutricional['categoriaIMC']; icono: string; desc: string }[] = [
    { id: 'Bajo peso', icono: '📈', desc: 'Superávit calórico limpio para ganar masa muscular' },
    { id: 'Peso normal', icono: '⚖️', desc: 'Mantenimiento, recomposición corporal y energía' },
    { id: 'Sobrepeso', icono: '🥗', desc: 'Déficit calórico moderado con preservación muscular' },
    { id: 'Obesidad', icono: '💚', desc: 'Salud metabólica, saciedad y control glucémico' },
  ];

  tiposClaseCards: { id: ClaseDisponible['tipoClase']; icono: string }[] = [
    { id: 'CrossFit', icono: '🔥' },
    { id: 'Spinning', icono: '🚴' },
    { id: 'Yoga', icono: '🧘‍♀️' },
    { id: 'Funcional', icono: '⚡' },
    { id: 'Boxeo', icono: '🥊' },
    { id: 'Pilates', icono: '🤸‍♀️' },
  ];

  ejerciciosSugeridos: string[] = [
    'Sentadilla profunda 4x10',
    'Press de banca 4x8',
    'Peso muerto rumano 4x10',
    'Dominadas pronas 4x8',
    'Press militar 3x10',
    'Burpees explosivos 4x15',
    'Plancha abdominal 4x45s',
  ];

  // Formulario de rutina
  rNombre = '';
  rTipo: Rutina['tipoEntrenamiento'] = 'Fuerza';
  rNivel: Rutina['nivel'] = 'Intermedio';
  rDescripcion = '';
  rEjerciciosTexto = '';
  rDuracion = 4;

  // Formulario de guía física / manual
  gTitulo = '';
  gMetodo = 'Fuerza y Biomecánica';
  gContenido = '';

  // Formulario de guía nutricional
  nCategoria: GuiaNutricional['categoriaIMC'] = 'Peso normal';
  nTitulo = '';
  nRecomendaciones = '';
  nEjemploComidas = '';

  // Formulario de clases reservables
  cGimnasioId: number | null = null;
  cTipoClase: ClaseDisponible['tipoClase'] = 'CrossFit';
  cInstructor = '';
  cHora = 'Lun, Mié y Vie 6:00 am';
  cCupos = 15;
  cDuracion = '50 min';
  cPrecio = 25000;

  mensaje = '';
  tipoMensaje: 'success' | 'error' | '' = '';

  constructor(
    private contenidoService: ContenidoService,
    private clasesService: ClasesService,
    private gimnasiosService: GimnasiosService,
    private authService: AuthService,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    const sesion = this.authService.obtenerUsuario();
    if (sesion?.nombre) {
      this.nombreUsuario = sesion.nombre.split(' ')[0];
    }
    await this.gimnasiosService.cargar();
    this.gimnasios = this.gimnasiosService.listar().map((g) => ({ id: g.id, nombre: g.nombre }));
    if (this.gimnasios.length > 0 && this.cGimnasioId === null) {
      this.cGimnasioId = this.gimnasios[0].id;
    }
    await this.contenidoService.cargar();
    await this.clasesService.cargar();
    this.cargar();
  }

  cargar(): void {
    this.rutinas = this.contenidoService.listarRutinas();
    this.guiasFisicas = this.contenidoService.listarGuiasFisicas();
    this.guiasNutricionales = this.contenidoService.listarGuiasNutricionales();
    this.clases = this.clasesService.listar();
  }

  cambiarPestana(p: ModuloContenido): void {
    this.pestanaActiva = p;
    this.mensaje = '';
  }

  nombreGimnasio(id: number): string {
    return this.gimnasios.find((g) => g.id === id)?.nombre ?? 'Sede The House Fit';
  }

  // --- NAVEGACIÓN DEL ASISTENTE EN PANTALLA COMPLETA ---
  iniciarNuevo(modulo?: ModuloContenido): void {
    if (modulo) {
      this.pestanaActiva = modulo;
    }
    this.limpiarFormularios();
    this.pantallaActual = 'paso1';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editarRutina(r: Rutina): void {
    this.pestanaActiva = 'rutinas';
    this.idEditar = r.id;
    this.rNombre = r.nombre;
    this.rTipo = r.tipoEntrenamiento;
    this.rNivel = r.nivel;
    this.rDuracion = r.duracionSemanas || 4;
    this.rDescripcion = r.descripcion || '';
    this.rEjerciciosTexto = (r.ejercicios || []).join(', ');
    this.pantallaActual = 'paso1';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editarGuiaFisica(g: GuiaFisica): void {
    this.pestanaActiva = 'guias';
    this.idEditar = g.id;
    this.gTitulo = g.titulo;
    this.gMetodo = g.metodo || 'Fuerza y Biomecánica';
    this.gContenido = g.contenido;
    this.pantallaActual = 'paso1';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editarGuiaNutricional(g: GuiaNutricional): void {
    this.pestanaActiva = 'nutricion';
    this.idEditar = g.id;
    this.nCategoria = g.categoriaIMC;
    this.nTitulo = g.titulo;
    this.nRecomendaciones = g.recomendaciones;
    this.nEjemploComidas = g.ejemploComidas || '';
    this.pantallaActual = 'paso1';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editarClase(c: ClaseDisponible): void {
    this.pestanaActiva = 'clases';
    this.idEditar = c.id;
    this.cGimnasioId = c.gimnasioId;
    this.cTipoClase = c.tipoClase;
    this.cInstructor = c.instructor;
    this.cHora = c.hora;
    this.cCupos = c.cupos;
    this.cDuracion = c.duracion;
    this.cPrecio = c.precio;
    this.pantallaActual = 'paso1';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  volverAlHub(): void {
    this.pantallaActual = 'hub';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  irAPaso(paso: PantallaContenido): void {
    this.pantallaActual = paso;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  irPasoSiguiente(): void {
    if (this.pantallaActual === 'paso1') {
      this.pantallaActual = 'paso2';
    } else if (this.pantallaActual === 'paso2') {
      this.pantallaActual = 'paso3';
    } else if (this.pantallaActual === 'paso3') {
      this.guardarActual();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  irPasoAnterior(): void {
    if (this.pantallaActual === 'paso3') {
      this.pantallaActual = 'paso2';
    } else if (this.pantallaActual === 'paso2') {
      this.pantallaActual = 'paso1';
    } else {
      this.pantallaActual = 'hub';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  agregarChipEjercicio(ej: string): void {
    if (!this.rEjerciciosTexto.trim()) {
      this.rEjerciciosTexto = ej;
    } else if (!this.rEjerciciosTexto.includes(ej)) {
      this.rEjerciciosTexto += ', ' + ej;
    }
  }

  ajustarDuracionRutina(delta: number): void {
    const nuevo = (Number(this.rDuracion) || 1) + delta;
    if (nuevo >= 1 && nuevo <= 52) {
      this.rDuracion = nuevo;
    }
  }

  ajustarCuposClase(delta: number): void {
    const nuevo = (Number(this.cCupos) || 1) + delta;
    if (nuevo >= 1 && nuevo <= 100) {
      this.cCupos = nuevo;
    }
  }

  guardarActual(): void {
    if (this.pestanaActiva === 'rutinas') {
      this.guardarRutina();
    } else if (this.pestanaActiva === 'guias') {
      this.guardarGuiaFisica();
    } else if (this.pestanaActiva === 'nutricion') {
      this.guardarGuiaNutricional();
    } else {
      this.guardarClase();
    }
  }

  guardarRutina(): void {
    if (!this.rNombre.trim()) {
      this.tipoMensaje = 'error';
      this.mensaje = 'El nombre de la rutina es obligatorio.';
      return;
    }
    const payload = {
      nombre: this.rNombre.trim(),
      tipoEntrenamiento: this.rTipo,
      nivel: this.rNivel,
      descripcion:
        this.rDescripcion.trim() ||
        'Plan de entrenamiento estructurado para optimizar fuerza, técnica y resistencia.',
      ejercicios: this.rEjerciciosTexto
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e),
      duracionSemanas: Number(this.rDuracion) || 4,
    };

    if (this.idEditar !== null) {
      this.contenidoService.actualizarRutina(this.idEditar, payload);
      this.mensaje = `Rutina "${payload.nombre}" actualizada correctamente.`;
    } else {
      this.contenidoService.crearRutina(payload);
      this.mensaje = `Rutina "${payload.nombre}" publicada exitosamente.`;
    }
    this.tipoMensaje = 'success';
    this.cargar();
    this.limpiarFormularios();
    this.pantallaActual = 'hub';
  }

  eliminarRutina(id: number): void {
    if (!confirm('¿Eliminar esta rutina de entrenamiento?')) return;
    this.contenidoService.eliminarRutina(id);
    this.cargar();
  }

  guardarGuiaFisica(): void {
    if (!this.gTitulo.trim()) {
      this.tipoMensaje = 'error';
      this.mensaje = 'El título del manual físico es obligatorio.';
      return;
    }
    const payload = {
      titulo: this.gTitulo.trim(),
      metodo: this.gMetodo.trim() || 'Biomecánica y Técnica',
      contenido:
        this.gContenido.trim() ||
        'Guía técnica oficial con pautas de alineación articular y prevención de lesiones.',
      fechaPublicacion: new Date().toISOString().slice(0, 10),
    };

    if (this.idEditar !== null) {
      this.contenidoService.actualizarGuiaFisica(this.idEditar, payload);
      this.mensaje = `Manual "${payload.titulo}" actualizado correctamente.`;
    } else {
      this.contenidoService.crearGuiaFisica(payload);
      this.mensaje = `Manual "${payload.titulo}" publicado correctamente.`;
    }
    this.tipoMensaje = 'success';
    this.cargar();
    this.limpiarFormularios();
    this.pantallaActual = 'hub';
  }

  eliminarGuiaFisica(id: number): void {
    if (!confirm('¿Eliminar este manual físico?')) return;
    this.contenidoService.eliminarGuiaFisica(id);
    this.cargar();
  }

  guardarGuiaNutricional(): void {
    if (!this.nTitulo.trim()) {
      this.tipoMensaje = 'error';
      this.mensaje = 'El título de la guía nutricional es obligatorio.';
      return;
    }
    const payload = {
      categoriaIMC: this.nCategoria,
      titulo: this.nTitulo.trim(),
      recomendaciones:
        this.nRecomendaciones.trim() ||
        'Distribución equilibrada de macronutrientes e hidratación constante.',
      ejemploComidas: this.nEjemploComidas.trim(),
    };

    if (this.idEditar !== null) {
      this.contenidoService.actualizarGuiaNutricional(this.idEditar, payload);
      this.mensaje = `Guía nutricional "${payload.titulo}" actualizada.`;
    } else {
      this.contenidoService.crearGuiaNutricional(payload);
      this.mensaje = `Guía nutricional "${payload.titulo}" publicada.`;
    }
    this.tipoMensaje = 'success';
    this.cargar();
    this.limpiarFormularios();
    this.pantallaActual = 'hub';
  }

  eliminarGuiaNutricional(id: number): void {
    if (!confirm('¿Eliminar esta guía nutricional?')) return;
    this.contenidoService.eliminarGuiaNutricional(id);
    this.cargar();
  }

  guardarClase(): void {
    const gymId = this.cGimnasioId ?? (this.gimnasios[0]?.id || 1);
    const payload = {
      gimnasioId: gymId,
      tipoClase: this.cTipoClase,
      instructor: this.cInstructor.trim() || 'Coach Oficial The House Fit',
      hora: this.cHora.trim() || 'Lun a Vie 6:00 am',
      cupos: Number(this.cCupos) || 15,
      duracion: this.cDuracion.trim() || '50 min',
      precio: Number(this.cPrecio) || 20000,
    };

    if (this.idEditar !== null) {
      this.clasesService.actualizar(this.idEditar, payload);
      this.mensaje = `Clase de ${payload.tipoClase} actualizada correctamente.`;
    } else {
      this.clasesService.crear(payload);
      this.mensaje = `Clase de ${payload.tipoClase} programada exitosamente.`;
    }
    this.tipoMensaje = 'success';
    this.cargar();
    this.limpiarFormularios();
    this.pantallaActual = 'hub';
  }

  eliminarClase(id: number): void {
    if (!confirm('¿Eliminar esta clase programada?')) return;
    this.clasesService.eliminar(id);
    this.cargar();
  }

  limpiarFormularios(): void {
    this.idEditar = null;
    this.rNombre = '';
    this.rTipo = 'Fuerza';
    this.rNivel = 'Intermedio';
    this.rDuracion = 4;
    this.rDescripcion = '';
    this.rEjerciciosTexto = '';

    this.gTitulo = '';
    this.gMetodo = 'Fuerza y Biomecánica';
    this.gContenido = '';

    this.nCategoria = 'Peso normal';
    this.nTitulo = '';
    this.nRecomendaciones = '';
    this.nEjemploComidas = '';

    this.cGimnasioId = this.gimnasios.length > 0 ? this.gimnasios[0].id : 1;
    this.cTipoClase = 'CrossFit';
    this.cInstructor = '';
    this.cHora = 'Lun, Mié y Vie 6:00 am';
    this.cCupos = 15;
    this.cDuracion = '50 min';
    this.cPrecio = 25000;
  }

  salirAlPanel(): void {
    this.router.navigate(['/panel/dashboard']);
  }
}
