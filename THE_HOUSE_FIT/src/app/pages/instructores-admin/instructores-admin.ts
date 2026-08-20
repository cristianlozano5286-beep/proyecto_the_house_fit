import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InstructoresService } from '../../services/instructores';
import { GimnasiosService } from '../../services/gimnasios';
import { Instructor } from '../../models/catalogo.models';

@Component({
  selector: 'app-instructores-admin',
  imports: [FormsModule],
  templateUrl: './instructores-admin.html',
  styleUrl: './instructores-admin.css',
})
export class InstructoresAdminComponent implements OnInit {
  instructores: Instructor[] = [];
  gimnasios: { id: number; nombre: string }[] = [];

  idEditar: number | null = null;
  nombre = '';
  correo = '';
  telefono = '';
  especialidad = '';
  experiencia = 0;
  biografia = '';
  imagen = '🧑\u200d🏫';
  gimnasioId: number | null = null;
  activo = true;

  mensaje = '';
  tipoMensaje: 'success' | 'error' | '' = '';

  constructor(
    private instructoresService: InstructoresService,
    private gimnasiosService: GimnasiosService,
  ) {}

  ngOnInit(): void {
    this.gimnasios = this.gimnasiosService.listar().map((g) => ({ id: g.id, nombre: g.nombre }));
    this.cargar();
  }

  cargar(): void {
    this.instructores = this.instructoresService.listar();
  }

  nombreGimnasio(id: number | null): string {
    return this.gimnasios.find((g) => g.id === id)?.nombre ?? 'Sin asignar';
  }

  // HU18, HU19: registro de instructores por parte del administrador
  guardar(): void {
    if (!this.nombre.trim() || !this.correo.trim() || !this.especialidad.trim()) {
      this.tipoMensaje = 'error';
      this.mensaje = 'Nombre, correo y especialidad son obligatorios.';
      return;
    }

    const datos = {
      nombre: this.nombre,
      correo: this.correo,
      telefono: this.telefono,
      especialidad: this.especialidad,
      experiencia: Number(this.experiencia) || 0,
      biografia: this.biografia,
      imagen: this.imagen || '🧑\u200d🏫',
      gimnasioId: this.gimnasioId,
      activo: this.activo,
    };

    if (this.idEditar != null) {
      // HU20, HU21: edición de instructores existentes
      this.instructoresService.actualizar(this.idEditar, datos);
      this.mensaje = 'Instructor actualizado correctamente.';
    } else {
      this.instructoresService.crear(datos);
      this.mensaje = 'Instructor registrado correctamente.';
    }
    this.tipoMensaje = 'success';
    this.cargar();
    this.limpiarFormulario();
  }

  editar(instructor: Instructor): void {
    this.idEditar = instructor.id;
    this.nombre = instructor.nombre;
    this.correo = instructor.correo;
    this.telefono = instructor.telefono;
    this.especialidad = instructor.especialidad;
    this.experiencia = instructor.experiencia;
    this.biografia = instructor.biografia;
    this.imagen = instructor.imagen;
    this.gimnasioId = instructor.gimnasioId;
    this.activo = instructor.activo;
  }

  // HU21: eliminar instructores existentes
  eliminar(instructor: Instructor): void {
    const confirmado = confirm(`¿Eliminar al instructor "${instructor.nombre}"?`);
    if (!confirmado) return;
    this.instructoresService.eliminar(instructor.id);
    this.cargar();
  }

  limpiarFormulario(): void {
    this.idEditar = null;
    this.nombre = '';
    this.correo = '';
    this.telefono = '';
    this.especialidad = '';
    this.experiencia = 0;
    this.biografia = '';
    this.imagen = '🧑\u200d🏫';
    this.gimnasioId = null;
    this.activo = true;
  }
}
