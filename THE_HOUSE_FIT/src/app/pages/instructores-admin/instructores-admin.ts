import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { InstructoresService } from '../../services/instructores';
import { GimnasiosService } from '../../services/gimnasios';
import { AuthService } from '../../services/auth';
import { Instructor } from '../../models/catalogo.models';

type PantallaInstructor = 'hub' | 'paso1' | 'paso2' | 'paso3';

@Component({
  selector: 'app-instructores-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './instructores-admin.html',
  styleUrl: './instructores-admin.css',
})
export class InstructoresAdminComponent implements OnInit {
  pantallaActual: PantallaInstructor = 'hub';
  nombreUsuario = 'Daniel';

  instructores: Instructor[] = [];
  gimnasios: { id: number; nombre: string; ciudad?: string }[] = [];

  // Filtros en el Hub
  busqueda = '';
  filtroEspecialidad = 'Todas';

  // Datos del formulario paso a paso
  idEditar: number | null = null;
  nombre = '';
  correo = '';
  telefono = '';
  especialidad = 'Musculación y Fuerza';
  experiencia = 3;
  biografia = '';
  imagen = '🏋️‍♂️';
  gimnasioId: number | null = null;
  activo = true;

  guardando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' | '' = '';
  private timerMensaje: any;

  especialidadesCards = [
    { nombre: 'Musculación y Fuerza', icono: '🏋️‍♂️', desc: 'Hipertrofia, biomecánica y levantamiento pesado' },
    { nombre: 'CrossFit & HIIT', icono: '⚡', desc: 'Acondicionamiento metabólico y alta intensidad' },
    { nombre: 'Yoga y Movilidad', icono: '🧘‍♀️', desc: 'Flexibilidad, postura y control respiratorio' },
    { nombre: 'Pilates & Core', icono: '🤸‍♀️', desc: 'Fortalecimiento de zona media y estabilidad' },
    { nombre: 'Boxeo y Artes Marciales', icono: '🥊', desc: 'Técnica de combate, coordinación y cardio' },
    { nombre: 'Spinning / Indoor Cycling', icono: '🚴', desc: 'Resistencia aeróbica y sesiones grupales' },
  ];

  avataresSugeridos: string[] = ['🏋️‍♂️', '🧘‍♀️', '⚡', '🥊', '🤸‍♀️', '🏃‍♂️', '🧑‍🏫', '💪'];

  biosSugeridas: string[] = [
    'Entrenador certificado internacionalmente con enfoque en hipertrofia, técnica biomecánica y prevención de lesiones.',
    'Especialista en acondicionamiento metabólico de alta intensidad, transformación corporal y preparación atlética.',
    'Coach de movilidad articular, control postural y fortalecimiento integral para atletas de todos los niveles.',
  ];

  constructor(
    private instructoresService: InstructoresService,
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
    this.gimnasios = this.gimnasiosService
      .listar()
      .map((g) => ({ id: g.id, nombre: g.nombre, ciudad: g.ciudad }));
    if (this.gimnasios.length > 0 && this.gimnasioId === null) {
      this.gimnasioId = this.gimnasios[0].id;
    }
    await this.instructoresService.cargar();
    this.cargar();
  }

  cargar(): void {
    this.instructores = this.instructoresService.listar();
  }

  get instructoresFiltrados(): Instructor[] {
    return this.instructores.filter((i) => {
      const coincideEsp =
        this.filtroEspecialidad === 'Todas' ||
        i.especialidad.toLowerCase().includes(this.filtroEspecialidad.toLowerCase());
      if (!coincideEsp) return false;
      if (!this.busqueda.trim()) return true;
      const q = this.busqueda.toLowerCase();
      return (
        i.nombre.toLowerCase().includes(q) ||
        i.especialidad.toLowerCase().includes(q) ||
        (i.correo && i.correo.toLowerCase().includes(q)) ||
        this.nombreGimnasio(i.gimnasioId).toLowerCase().includes(q)
      );
    });
  }

  get totalInstructores(): number {
    return this.instructores.length;
  }

  get totalActivos(): number {
    return this.instructores.filter((i) => i.activo).length;
  }

  get totalSedes(): number {
    const sedesConEntrenadores = new Set(
      this.instructores.filter((i) => i.gimnasioId !== null).map((i) => i.gimnasioId),
    );
    return sedesConEntrenadores.size;
  }

  nombreGimnasio(id: number | null): string {
    return this.gimnasios.find((g) => g.id === id)?.nombre ?? 'Todas las sedes (Freelance)';
  }

  // --- NAVEGACIÓN DEL ASISTENTE EN PANTALLA COMPLETA ---
  iniciarNuevo(): void {
    this.limpiarFormulario();
    this.pantallaActual = 'paso1';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  iniciarEdicion(instructor: Instructor): void {
    this.idEditar = instructor.id;
    this.nombre = instructor.nombre;
    this.correo = instructor.correo;
    this.telefono = instructor.telefono || '';
    this.especialidad = instructor.especialidad || 'Musculación y Fuerza';
    this.experiencia = instructor.experiencia ?? 3;
    this.biografia = instructor.biografia || '';
    this.imagen = instructor.imagen || '🏋️‍♂️';
    this.gimnasioId = instructor.gimnasioId;
    this.activo = instructor.activo;
    this.pantallaActual = 'paso1';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  volverAlHub(): void {
    this.pantallaActual = 'hub';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  irAPaso(paso: PantallaInstructor): void {
    this.pantallaActual = paso;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  irPasoSiguiente(): void {
    if (this.pantallaActual === 'paso1') {
      if (!this.nombre.trim() || !this.correo.trim()) {
        this.mostrarAlerta('Por favor ingresa el nombre completo y correo del instructor.', 'error');
        return;
      }
      this.pantallaActual = 'paso2';
    } else if (this.pantallaActual === 'paso2') {
      if (!this.especialidad.trim()) {
        this.mostrarAlerta('Selecciona o escribe una especialidad deportiva.', 'error');
        return;
      }
      this.pantallaActual = 'paso3';
    } else if (this.pantallaActual === 'paso3') {
      this.guardar();
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

  ajustarExperiencia(delta: number): void {
    const nuevo = (Number(this.experiencia) || 0) + delta;
    if (nuevo >= 0 && nuevo <= 50) {
      this.experiencia = nuevo;
    }
  }

  seleccionarEspecialidad(esp: string, icono?: string): void {
    this.especialidad = esp;
    if (icono) {
      this.imagen = icono;
    }
  }

  seleccionarAvatar(av: string): void {
    this.imagen = av;
  }

  aplicarBioSugerida(bio: string): void {
    this.biografia = bio;
  }

  async guardar(): Promise<void> {
    if (!this.nombre.trim() || !this.correo.trim() || !this.especialidad.trim()) {
      this.mostrarAlerta('Nombre, correo y especialidad son campos obligatorios.', 'error');
      return;
    }

    this.guardando = true;
    const datos = {
      nombre: this.nombre.trim(),
      correo: this.correo.trim().toLowerCase(),
      telefono: this.telefono.trim(),
      especialidad: this.especialidad.trim(),
      experiencia: Number(this.experiencia) || 0,
      biografia:
        this.biografia.trim() ||
        'Entrenador profesional certificado en acondicionamiento físico y rendimiento deportivo.',
      imagen: this.imagen || '🏋️‍♂️',
      gimnasioId: this.gimnasioId,
      activo: this.activo,
    };

    try {
      if (this.idEditar != null) {
        await this.instructoresService.actualizar(this.idEditar, datos);
        this.mostrarAlerta(`Instructor "${datos.nombre}" actualizado correctamente.`, 'success');
      } else {
        await this.instructoresService.crear(datos);
        this.mostrarAlerta(`Instructor "${datos.nombre}" registrado exitosamente.`, 'success');
      }
      this.cargar();
      this.limpiarFormulario();
      this.pantallaActual = 'hub';
    } finally {
      this.guardando = false;
    }
  }

  async eliminar(instructor: Instructor): Promise<void> {
    const confirmado = confirm(`¿Estás seguro de eliminar al instructor "${instructor.nombre}"?`);
    if (!confirmado) return;

    await this.instructoresService.eliminar(instructor.id);
    this.cargar();
    this.mostrarAlerta(`Instructor "${instructor.nombre}" eliminado del sistema.`, 'success');
    if (this.idEditar === instructor.id) {
      this.limpiarFormulario();
    }
  }

  limpiarFormulario(): void {
    this.idEditar = null;
    this.nombre = '';
    this.correo = '';
    this.telefono = '';
    this.especialidad = 'Musculación y Fuerza';
    this.experiencia = 3;
    this.biografia = '';
    this.imagen = '🏋️‍♂️';
    this.gimnasioId = this.gimnasios.length > 0 ? this.gimnasios[0].id : null;
    this.activo = true;
  }

  salirAlPanel(): void {
    this.router.navigate(['/panel/dashboard']);
  }

  private mostrarAlerta(msg: string, tipo: 'success' | 'error'): void {
    this.mensaje = msg;
    this.tipoMensaje = tipo;
    if (this.timerMensaje) clearTimeout(this.timerMensaje);
    this.timerMensaje = setTimeout(() => {
      this.mensaje = '';
      this.tipoMensaje = '';
    }, 4500);
  }
}
