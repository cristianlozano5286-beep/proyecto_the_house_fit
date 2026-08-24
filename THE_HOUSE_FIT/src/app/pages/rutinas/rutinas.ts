import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContenidoService } from '../../services/contenido';
import { Rutina } from '../../models/contenido.models';

interface CategoriaResumen {
  tipo: string;
  icono: string;
  imagen: string;
  total: number;
}

const ICONOS_TIPO: Record<string, string> = {
  'Fuerza': '🏋️',
  'Cardio': '❤️‍🔥',
  'Funcional': '⚡',
  'Flexibilidad': '🧘',
  'Pérdida de peso': '🔥',
};

const IMAGENES_TIPO: Record<string, string> = {
  'Fuerza': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&h=350&fit=crop&auto=format',
  'Cardio': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=500&h=350&fit=crop&auto=format',
  'Funcional': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&h=350&fit=crop&auto=format',
  'Flexibilidad': 'https://images.unsplash.com/photo-1539794830467-1f1755804d13?w=500&h=350&fit=crop&auto=format',
  'Pérdida de peso': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=350&fit=crop&auto=format',
};

@Component({
  selector: 'app-rutinas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rutinas.html',
  styleUrl: './rutinas.css',
})
export class RutinasComponent implements OnInit {

  constructor(private contenidoService: ContenidoService) {}

  tiposEntrenamiento: string[] = ['Fuerza', 'Cardio', 'Funcional', 'Flexibilidad', 'Pérdida de peso'];
  niveles: string[] = ['Principiante', 'Intermedio', 'Avanzado'];
  duraciones: string[] = ['Hasta 4 semanas', '5 a 6 semanas', '7 semanas o más'];

  filtroTipo: string[] = [];
  filtroNivel: string[] = [];
  filtroDuracion: string[] = [];
  orden = 'recientes';

  rutinas: Rutina[] = [];
  rutinasFiltradas: Rutina[] = [];
  categorias: CategoriaResumen[] = [];

  ngOnInit(): void {
    this.rutinas = this.contenidoService.listarRutinas();
    this.construirCategorias();
    this.aplicarFiltros();
  }

  private construirCategorias(): void {
    this.categorias = this.tiposEntrenamiento
      .map((tipo) => ({
        tipo,
        icono: ICONOS_TIPO[tipo] ?? '💪',
        imagen: IMAGENES_TIPO[tipo] ?? IMAGENES_TIPO['Funcional'],
        total: this.rutinas.filter((r) => r.tipoEntrenamiento === tipo).length,
      }))
      .filter((c) => c.total > 0);
  }

  toggleFiltro(grupo: 'tipo' | 'nivel' | 'duracion', valor: string): void {
    const lista = grupo === 'tipo' ? this.filtroTipo
                : grupo === 'nivel' ? this.filtroNivel
                : this.filtroDuracion;

    const i = lista.indexOf(valor);
    if (i >= 0) {
      lista.splice(i, 1);
    } else {
      lista.push(valor);
    }
    this.aplicarFiltros();
  }

  filtrarPorCategoria(tipo: string): void {
    this.filtroTipo = [tipo];
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtroTipo = [];
    this.filtroNivel = [];
    this.filtroDuracion = [];
    this.aplicarFiltros();
  }

  private duracionCoincide(semanas: number, rango: string): boolean {
    if (rango === 'Hasta 4 semanas') return semanas <= 4;
    if (rango === '5 a 6 semanas') return semanas >= 5 && semanas <= 6;
    if (rango === '7 semanas o más') return semanas >= 7;
    return true;
  }

  aplicarFiltros(): void {
    this.rutinasFiltradas = this.rutinas.filter((r) => {
      const okTipo = this.filtroTipo.length === 0 || this.filtroTipo.includes(r.tipoEntrenamiento);
      const okNivel = this.filtroNivel.length === 0 || this.filtroNivel.includes(r.nivel);
      const okDuracion = this.filtroDuracion.length === 0 || this.filtroDuracion.some((d) => this.duracionCoincide(r.duracionSemanas, d));
      return okTipo && okNivel && okDuracion;
    });
    this.ordenar();
  }

  ordenar(): void {
    if (this.orden === 'duracion') {
      this.rutinasFiltradas = [...this.rutinasFiltradas].sort((a, b) => a.duracionSemanas - b.duracionSemanas);
    } else if (this.orden === 'ejercicios') {
      this.rutinasFiltradas = [...this.rutinasFiltradas].sort((a, b) => b.ejercicios.length - a.ejercicios.length);
    } else {
      this.rutinasFiltradas = [...this.rutinasFiltradas].sort((a, b) => b.id - a.id);
    }
  }

  imagen(tipo: string): string {
    return IMAGENES_TIPO[tipo] ?? IMAGENES_TIPO['Funcional'];
  }

  icono(tipo: string): string {
    return ICONOS_TIPO[tipo] ?? '💪';
  }
}