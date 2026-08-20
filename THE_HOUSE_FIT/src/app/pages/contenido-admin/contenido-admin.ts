import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContenidoService } from '../../services/contenido';
import { ClasesService } from '../../services/clases';
import { GimnasiosService } from '../../services/gimnasios';
import { GuiaFisica, GuiaNutricional, Rutina } from '../../models/contenido.models';
import { ClaseDisponible } from '../../models/clase.models';

@Component({
  selector: 'app-contenido-admin',
  imports: [FormsModule],
  templateUrl: './contenido-admin.html',
  styleUrl: './contenido-admin.css',
})
export class ContenidoAdminComponent implements OnInit {
  pestanaActiva: 'rutinas' | 'guias' | 'nutricion' | 'clases' = 'rutinas';

  rutinas: Rutina[] = [];
  guiasFisicas: GuiaFisica[] = [];
  guiasNutricionales: GuiaNutricional[] = [];
  clases: ClaseDisponible[] = [];
  gimnasios: { id: number; nombre: string }[] = [];

  tiposEntrenamiento: Rutina['tipoEntrenamiento'][] = ['Fuerza', 'Cardio', 'Funcional', 'Flexibilidad', 'Pérdida de peso'];
  niveles: Rutina['nivel'][] = ['Principiante', 'Intermedio', 'Avanzado'];
  categoriasIMC: GuiaNutricional['categoriaIMC'][] = ['Bajo peso', 'Peso normal', 'Sobrepeso', 'Obesidad'];
  tiposClase: ClaseDisponible['tipoClase'][] = ['Spinning', 'CrossFit', 'Yoga', 'Funcional', 'Boxeo', 'Pilates'];

  // Formulario de rutina (HU27, HU28, HU33)
  rNombre = '';
  rTipo: Rutina['tipoEntrenamiento'] = 'Fuerza';
  rNivel: Rutina['nivel'] = 'Principiante';
  rDescripcion = '';
  rEjerciciosTexto = '';
  rDuracion = 4;

  // Formulario de guía física / manual (HU29, HU31)
  gTitulo = '';
  gMetodo = '';
  gContenido = '';

  // Formulario de guía nutricional (HU32, HU34)
  nCategoria: GuiaNutricional['categoriaIMC'] = 'Peso normal';
  nTitulo = '';
  nRecomendaciones = '';
  nEjemploComidas = '';

  // Formulario de clases reservables
  cGimnasioId: number | null = null;
  cTipoClase: ClaseDisponible['tipoClase'] = 'CrossFit';
  cInstructor = '';
  cHora = '';
  cCupos = 10;
  cDuracion = '45 min';
  cPrecio = 20000;

  mensaje = '';

  constructor(
    private contenidoService: ContenidoService,
    private clasesService: ClasesService,
    private gimnasiosService: GimnasiosService,
  ) {}

  ngOnInit(): void {
    this.gimnasios = this.gimnasiosService.listar().map((g) => ({ id: g.id, nombre: g.nombre }));
    this.cargar();
  }

  cargar(): void {
    this.rutinas = this.contenidoService.listarRutinas();
    this.guiasFisicas = this.contenidoService.listarGuiasFisicas();
    this.guiasNutricionales = this.contenidoService.listarGuiasNutricionales();
    this.clases = this.clasesService.listar();
  }

  cambiarPestana(p: 'rutinas' | 'guias' | 'nutricion' | 'clases'): void {
    this.pestanaActiva = p;
    this.mensaje = '';
  }

  nombreGimnasio(id: number): string {
    return this.gimnasios.find((g) => g.id === id)?.nombre ?? 'Gimnasio';
  }

  guardarRutina(): void {
    if (!this.rNombre.trim()) {
      this.mensaje = 'El nombre de la rutina es obligatorio.';
      return;
    }
    this.contenidoService.crearRutina({
      nombre: this.rNombre,
      tipoEntrenamiento: this.rTipo,
      nivel: this.rNivel,
      descripcion: this.rDescripcion,
      ejercicios: this.rEjerciciosTexto.split(',').map((e) => e.trim()).filter((e) => e),
      duracionSemanas: Number(this.rDuracion) || 4,
    });
    this.mensaje = 'Rutina agregada correctamente.';
    this.rNombre = '';
    this.rDescripcion = '';
    this.rEjerciciosTexto = '';
    this.cargar();
  }

  eliminarRutina(id: number): void {
    this.contenidoService.eliminarRutina(id);
    this.cargar();
  }

  guardarGuiaFisica(): void {
    if (!this.gTitulo.trim() || !this.gContenido.trim()) {
      this.mensaje = 'El título y el contenido de la guía son obligatorios.';
      return;
    }
    this.contenidoService.crearGuiaFisica({
      titulo: this.gTitulo,
      metodo: this.gMetodo,
      contenido: this.gContenido,
      fechaPublicacion: new Date().toISOString().slice(0, 10),
    });
    this.mensaje = 'Manual de guía física publicado.';
    this.gTitulo = '';
    this.gMetodo = '';
    this.gContenido = '';
    this.cargar();
  }

  eliminarGuiaFisica(id: number): void {
    this.contenidoService.eliminarGuiaFisica(id);
    this.cargar();
  }

  guardarGuiaNutricional(): void {
    if (!this.nTitulo.trim() || !this.nRecomendaciones.trim()) {
      this.mensaje = 'El título y las recomendaciones son obligatorios.';
      return;
    }
    this.contenidoService.crearGuiaNutricional({
      categoriaIMC: this.nCategoria,
      titulo: this.nTitulo,
      recomendaciones: this.nRecomendaciones,
      ejemploComidas: this.nEjemploComidas,
    });
    this.mensaje = 'Guía nutricional publicada.';
    this.nTitulo = '';
    this.nRecomendaciones = '';
    this.nEjemploComidas = '';
    this.cargar();
  }

  eliminarGuiaNutricional(id: number): void {
    this.contenidoService.eliminarGuiaNutricional(id);
    this.cargar();
  }

  guardarClase(): void {
    if (!this.cGimnasioId || !this.cInstructor.trim() || !this.cHora.trim()) {
      this.mensaje = 'Selecciona un gimnasio y completa instructor y hora.';
      return;
    }
    this.clasesService.crear({
      gimnasioId: this.cGimnasioId,
      tipoClase: this.cTipoClase,
      instructor: this.cInstructor,
      hora: this.cHora,
      cupos: Number(this.cCupos) || 10,
      duracion: this.cDuracion,
      precio: Number(this.cPrecio) || 0,
    });
    this.mensaje = 'Clase agregada correctamente.';
    this.cInstructor = '';
    this.cHora = '';
    this.cargar();
  }

  eliminarClase(id: number): void {
    this.clasesService.eliminar(id);
    this.cargar();
  }
}
