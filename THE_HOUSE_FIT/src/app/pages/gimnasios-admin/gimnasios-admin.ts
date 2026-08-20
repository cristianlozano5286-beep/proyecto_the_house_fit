import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GimnasiosService } from '../../services/gimnasios';
import { Gimnasio } from '../../models/catalogo.models';

@Component({
  selector: 'app-gimnasios-admin',
  imports: [FormsModule],
  templateUrl: './gimnasios-admin.html',
  styleUrl: './gimnasios-admin.css',
})
export class GimnasiosAdminComponent implements OnInit {
  gimnasios: Gimnasio[] = [];

  // Campos del formulario (HU12: formulario administrativo de registro)
  idEditar: number | null = null;
  nombre = '';
  direccion = '';
  barrio = '';
  telefono = '';
  horario = '';
  descripcion = '';
  imagen = '🏋️';
  serviciosTexto = '';
  activo = true;

  mensaje = '';
  tipoMensaje: 'success' | 'error' | '' = '';

  constructor(private gimnasiosService: GimnasiosService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.gimnasios = this.gimnasiosService.listar();
  }

  guardar(): void {
    if (!this.nombre.trim() || !this.direccion.trim() || !this.telefono.trim()) {
      this.tipoMensaje = 'error';
      this.mensaje = 'Nombre, dirección y teléfono son obligatorios.';
      return;
    }

    const servicios = this.serviciosTexto
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const datos = {
      nombre: this.nombre,
      direccion: this.direccion,
      barrio: this.barrio,
      telefono: this.telefono,
      horario: this.horario,
      descripcion: this.descripcion,
      imagen: this.imagen || '🏋️',
      servicios,
      activo: this.activo,
    };

    if (this.idEditar != null) {
      // HU14, HU15: actualización de datos del gimnasio
      this.gimnasiosService.actualizar(this.idEditar, datos);
      this.mensaje = 'Gimnasio actualizado correctamente.';
    } else {
      // HU12, HU13: creación del gimnasio
      this.gimnasiosService.crear(datos);
      this.mensaje = 'Gimnasio registrado correctamente.';
    }
    this.tipoMensaje = 'success';
    this.cargar();
    this.limpiarFormulario();
  }

  editar(gimnasio: Gimnasio): void {
    this.idEditar = gimnasio.id;
    this.nombre = gimnasio.nombre;
    this.direccion = gimnasio.direccion;
    this.barrio = gimnasio.barrio;
    this.telefono = gimnasio.telefono;
    this.horario = gimnasio.horario;
    this.descripcion = gimnasio.descripcion;
    this.imagen = gimnasio.imagen;
    this.serviciosTexto = gimnasio.servicios.join(', ');
    this.activo = gimnasio.activo;
  }

  eliminar(gimnasio: Gimnasio): void {
    const confirmado = confirm(`¿Eliminar el gimnasio "${gimnasio.nombre}"?`);
    if (!confirmado) return;
    this.gimnasiosService.eliminar(gimnasio.id);
    this.cargar();
  }

  limpiarFormulario(): void {
    this.idEditar = null;
    this.nombre = '';
    this.direccion = '';
    this.barrio = '';
    this.telefono = '';
    this.horario = '';
    this.descripcion = '';
    this.imagen = '🏋️';
    this.serviciosTexto = '';
    this.activo = true;
  }
}
