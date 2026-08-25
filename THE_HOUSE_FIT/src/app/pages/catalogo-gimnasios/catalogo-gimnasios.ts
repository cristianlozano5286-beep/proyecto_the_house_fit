import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalogo-gimnasios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo-gimnasios.html',
  styleUrl: './catalogo-gimnasios.css'
})
export class CatalogoGimnasiosComponent {
  // Variables para filtros y búsqueda
  textoBusqueda: string = '';
  servicioFiltro: string = '';

  // Elemento seleccionado para el modal de detalles
  gimnasioSeleccionado: any = null;

  // Listas de ejemplo (puedes enlazarlas o reemplazarlas con tus servicios de datos)
  serviciosDisponibles: string[] = ['Pesas', 'Cardio', 'Crossfit', 'Spinning', 'Yoga'];

  gimnasios: any[] = [
    {
      id: 1,
      nombre: 'The House Fit Central',
      imagen: '🏋️‍♂️',
      direccion: 'Calle 9 # 20-35',
      barrio: 'Centro',
      horario: 'Lunes a Sábado: 5:00 AM - 10:00 PM',
      telefono: '3101234567',
      descripcion: 'Gimnasio principal equipado con tecnología de punta y zonas de alta intensidad.',
      servicios: ['Pesas', 'Cardio', 'Crossfit']
    },
    {
      id: 2,
      nombre: 'Power Gym Yopal',
      imagen: '⚡',
      direccion: 'Carrera 29 # 15-10',
      barrio: 'La Campiña',
      horario: 'Lunes a Domingo: 6:00 AM - 9:00 PM',
      telefono: '3209876543',
      descripcion: 'Espacio especializado en musculación, acondicionamiento físico y clases grupales.',
      servicios: ['Pesas', 'Spinning', 'Yoga']
    }
  ];

  gimnasiosFiltrados: any[] = [...this.gimnasios];

  // Instructores de ejemplo por gimnasio ID
  instructores: any[] = [
    { id: 1, gimnasioId: 1, nombre: 'Carlos Pérez', imagen: '👨‍🏫', especialidad: 'Musculación', experiencia: 5 },
    { id: 2, gimnasioId: 1, nombre: 'Ana Gómez', imagen: '👩‍🏫', especialidad: 'Crossfit', experiencia: 4 },
    { id: 3, gimnasioId: 2, nombre: 'Luis Torres', imagen: '👨‍🏫', especialidad: 'Spinning', experiencia: 6 }
  ];

  // Reseñas de ejemplo por gimnasio ID
  resenas: any[] = [
    { id: 1, gimnasioId: 1, titulo: '¡Excelente ambiente!', puntuacion: 5, cuerpo: 'Las máquinas están nuevas y los entrenadores muy atentos.', usuario: 'Mario R.', fecha: '2026-08-10' }
  ];

  // Método de búsqueda y filtrado dinámico
  buscar(): void {
    const texto = this.textoBusqueda.toLowerCase().trim();
    
    this.gimnasiosFiltrados = this.gimnasios.filter(g => {
      const coincideTexto = g.nombre.toLowerCase().includes(texto) || g.barrio.toLowerCase().includes(texto);
      const coincideServicio = this.servicioFiltro === '' || g.servicios.includes(this.servicioFiltro);
      return coincideTexto && coincideServicio;
    });
  }

  // Métodos para el manejo del Modal y relaciones
  verDetalle(gimnasio: any): void {
    this.gimnasioSeleccionado = gimnasio;
  }

  cerrarDetalle(): void {
    this.gimnasioSeleccionado = null;
  }

  instructoresDe(gimnasioId: number) {
    return this.instructores.filter(i => i.gimnasioId === gimnasioId);
  }

  resenasDe(gimnasioId: number) {
    return this.resenas.filter(r => r.gimnasioId === gimnasioId);
  }

  promedio(gimnasioId: number): string {
    const listado = this.resenasDe(gimnasioId);
    if (listado.length === 0) return '';
    const suma = listado.reduce((acc, r) => acc + r.puntuacion, 0);
    return (suma / listado.length).toFixed(1);
  }
}