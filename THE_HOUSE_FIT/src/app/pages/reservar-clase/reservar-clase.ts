import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';

import { ClasesService } from '../../services/clases';
import { GimnasiosService } from '../../services/gimnasios';
import { AuthService } from '../../services/auth';
import { ClaseDisponible } from '../../models/clase.models';
import {
  ConfirmarReservaDialogComponent,
  ConfirmarReservaData,
} from './confirmar-reserva-dialog/confirmar-reserva-dialog';

@Component({
  selector: 'app-reservar-clase',
  imports: [
    FormsModule,
    MatButtonModule,
    MatNativeDateModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatTableModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './reservar-clase.html',
  styleUrl: './reservar-clase.css',
})
export class ReservarClaseComponent implements OnInit {
  gimnasios: { id: number; nombre: string }[] = [];
  tiposClase: ClaseDisponible['tipoClase'][] = ['Spinning', 'CrossFit', 'Yoga', 'Funcional', 'Boxeo', 'Pilates'];

  gimnasioId: number | null = null;
  tipoClase: string | null = null;
  fecha: Date | null = null;
  personas: number = 1;

  cargando: boolean = false;
  progreso: number = 0;
  buscado: boolean = false;

  columnas: string[] = ['gimnasio', 'tipoClase', 'instructor', 'hora', 'duracion', 'precio', 'accion'];
  clases: ClaseDisponible[] = [];

  constructor(
    private clasesService: ClasesService,
    private gimnasiosService: GimnasiosService,
    private authService: AuthService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.gimnasios = this.gimnasiosService.listar().map((g) => ({ id: g.id, nombre: g.nombre }));
    this.clases = this.clasesService.listar();
  }

  nombreGimnasio(id: number): string {
    return this.gimnasios.find((g) => g.id === id)?.nombre ?? 'Gimnasio';
  }

  formatearPrecio(valor: number): string {
    return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  }

  // Búsqueda simulada de clases disponibles (con progreso, como en el ejemplo de reserva de vuelos)
  buscarClases(): void {
    if (!this.fecha) {
      alert('Por favor selecciona la fecha en la que deseas asistir.');
      return;
    }
    if (this.personas < 1) {
      alert('Debes seleccionar al menos una persona.');
      return;
    }

    this.cargando = true;
    this.progreso = 25;
    this.buscado = false;

    setTimeout(() => (this.progreso = 50), 300);
    setTimeout(() => (this.progreso = 75), 600);
    setTimeout(() => (this.progreso = 100), 900);

    setTimeout(() => {
      this.clases = this.clasesService.buscar(this.gimnasioId, this.tipoClase);
      this.cargando = false;
      this.buscado = true;
    }, 1200);
  }

  limpiarBusqueda(): void {
    this.gimnasioId = null;
    this.tipoClase = null;
    this.fecha = null;
    this.personas = 1;
    this.progreso = 0;
    this.cargando = false;
    this.buscado = false;
    this.clases = this.clasesService.listar();
  }

  // HU: reservar cupo en una clase, con confirmación en un mat-dialog
  reservarClase(clase: ClaseDisponible): void {
    if (!this.fecha) {
      alert('Selecciona primero la fecha en la que deseas asistir.');
      return;
    }

    const data: ConfirmarReservaData = {
      clase,
      nombreGimnasio: this.nombreGimnasio(clase.gimnasioId),
      fecha: this.fecha.toLocaleDateString('es-CO'),
      personas: this.personas,
    };

    const dialogRef = this.dialog.open(ConfirmarReservaDialogComponent, { data, width: '420px' });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.clasesService.reservar(
          this.authService.obtenerNombre() || 'Usuario anónimo',
          clase.id,
          data.fecha,
          this.personas,
        );
        alert('¡Reserva confirmada! Te esperamos en ' + data.nombreGimnasio + '.');
      }
    });
  }
}
