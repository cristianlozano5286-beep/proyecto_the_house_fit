import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContenidoService } from '../../services/contenido';
import { Rutina } from '../../models/contenido.models';

export type ObjetivoRutina = 'todos' | 'fuerza' | 'grasa' | 'resistencia' | 'movilidad';

interface ObjetivoOpcion {
  id: ObjetivoRutina;
  etiqueta: string;
}

const IMAGENES_TIPO: Record<string, string> = {
  'Fuerza': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=550&fit=crop&auto=format',
  'Cardio': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&h=550&fit=crop&auto=format',
  'Funcional': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&h=550&fit=crop&auto=format',
  'Flexibilidad': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=550&fit=crop&auto=format',
  'Pérdida de peso': 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=550&fit=crop&auto=format',
};

const IMAGENES_RUTINA: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=550&fit=crop&auto=format',
  2: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&h=550&fit=crop&auto=format',
  3: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800&h=550&fit=crop&auto=format',
  4: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&h=550&fit=crop&auto=format',
  5: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&h=550&fit=crop&auto=format',
  6: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=550&fit=crop&auto=format',
  7: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=550&fit=crop&auto=format',
  8: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=550&fit=crop&auto=format',
};

const FOTO_RESPALDO = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=550&fit=crop&auto=format';

@Component({
  selector: 'app-rutinas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rutinas.html',
  styleUrl: './rutinas.css',
})
export class RutinasComponent implements OnInit {
  private readonly contenidoService = inject(ContenidoService);

  readonly tiposEntrenamiento: string[] = ['Fuerza', 'Cardio', 'Funcional', 'Flexibilidad', 'Pérdida de peso'];
  readonly niveles: string[] = ['Principiante', 'Intermedio', 'Avanzado'];
  readonly duraciones: string[] = ['Hasta 4 semanas', '5 a 6 semanas', '7 semanas o más'];
  readonly objetivos: ObjetivoOpcion[] = [
    { id: 'todos', etiqueta: 'Todos los objetivos' },
    { id: 'fuerza', etiqueta: 'Ganar fuerza e hipertrofia' },
    { id: 'grasa', etiqueta: 'Quemar grasa' },
    { id: 'resistencia', etiqueta: 'Resistencia y funcional' },
    { id: 'movilidad', etiqueta: 'Movilidad y flexibilidad' },
  ];

  filtroTipo: string[] = [];
  filtroNivel: string[] = [];
  filtroDuracion: string[] = [];
  textoBusqueda = '';
  orden = 'recientes';

  rutinas: Rutina[] = [];
  rutinasFiltradas: Rutina[] = [];

  readonly objetivoActivo = signal<ObjetivoRutina>('todos');
  readonly filtrosMovilAbiertos = signal(false);
  readonly vistasRapidasAbiertas = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.rutinas = this.contenidoService.listarRutinas();
    this.aplicarFiltros();
  }

  get totalFiltrosActivos(): number {
    return (
      this.filtroTipo.length +
      this.filtroNivel.length +
      this.filtroDuracion.length +
      (this.textoBusqueda.trim() ? 1 : 0) +
      (this.objetivoActivo() !== 'todos' ? 1 : 0)
    );
  }

  seleccionarObjetivo(obj: ObjetivoRutina): void {
    this.objetivoActivo.set(obj);
    if (obj === 'todos') {
      this.filtroTipo = [];
    } else if (obj === 'fuerza') {
      this.filtroTipo = ['Fuerza'];
    } else if (obj === 'grasa') {
      this.filtroTipo = ['Pérdida de peso', 'Cardio'];
    } else if (obj === 'resistencia') {
      this.filtroTipo = ['Funcional', 'Cardio'];
    } else if (obj === 'movilidad') {
      this.filtroTipo = ['Flexibilidad'];
    }
    this.aplicarFiltros();
  }

  toggleFiltro(grupo: 'tipo' | 'nivel' | 'duracion', valor: string): void {
    const lista =
      grupo === 'tipo' ? this.filtroTipo : grupo === 'nivel' ? this.filtroNivel : this.filtroDuracion;

    const idx = lista.indexOf(valor);
    if (idx >= 0) {
      lista.splice(idx, 1);
    } else {
      lista.push(valor);
    }
    if (grupo === 'tipo') {
      this.objetivoActivo.set('todos');
    }
    this.aplicarFiltros();
  }

  filtrarPorCategoria(tipo: string): void {
    this.objetivoActivo.set('todos');
    if (tipo === 'Todas' || (this.filtroTipo.length === 1 && this.filtroTipo[0] === tipo)) {
      this.filtroTipo = [];
    } else {
      this.filtroTipo = [tipo];
    }
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtroTipo = [];
    this.filtroNivel = [];
    this.filtroDuracion = [];
    this.textoBusqueda = '';
    this.objetivoActivo.set('todos');
    this.aplicarFiltros();
  }

  private duracionCoincide(semanas: number, rango: string): boolean {
    if (rango === 'Hasta 4 semanas') return semanas <= 4;
    if (rango === '5 a 6 semanas') return semanas >= 5 && semanas <= 6;
    if (rango === '7 semanas o más') return semanas >= 7;
    return true;
  }

  aplicarFiltros(): void {
    const query = this.textoBusqueda.trim().toLowerCase();

    this.rutinasFiltradas = this.rutinas.filter((r) => {
      const okTipo = this.filtroTipo.length === 0 || this.filtroTipo.includes(r.tipoEntrenamiento);
      const okNivel = this.filtroNivel.length === 0 || this.filtroNivel.includes(r.nivel);
      const okDuracion =
        this.filtroDuracion.length === 0 ||
        this.filtroDuracion.some((d) => this.duracionCoincide(r.duracionSemanas, d));
      const okTexto =
        !query ||
        r.nombre.toLowerCase().includes(query) ||
        r.descripcion.toLowerCase().includes(query) ||
        r.ejercicios.some((e) => e.toLowerCase().includes(query));

      return okTipo && okNivel && okDuracion && okTexto;
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

  toggleVistaRapida(event: Event, id: number): void {
    event.preventDefault();
    event.stopPropagation();
    const copia = new Set(this.vistasRapidasAbiertas());
    if (copia.has(id)) {
      copia.delete(id);
    } else {
      copia.add(id);
    }
    this.vistasRapidasAbiertas.set(copia);
  }

  vistaRapidaActiva(id: number): boolean {
    return this.vistasRapidasAbiertas().has(id);
  }

  esRecomendada(r: Rutina, index: number): boolean {
    return this.objetivoActivo() !== 'todos' && index === 0;
  }

  minutosEstimados(r: Rutina): number {
    return Math.max(20, r.ejercicios.length * 12);
  }

  imagenRutina(r: Rutina): string {
    return IMAGENES_RUTINA[r.id] ?? IMAGENES_TIPO[r.tipoEntrenamiento] ?? FOTO_RESPALDO;
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.dataset['fallbackApplied']) return;
    img.dataset['fallbackApplied'] = '1';
    img.src = FOTO_RESPALDO;
  }

  claveIconoTipo(tipo: string): string {
    const lower = tipo.toLowerCase();
    if (lower.includes('fuerza')) return 'weights';
    if (lower.includes('cardio')) return 'heart';
    if (lower.includes('flex')) return 'spark';
    if (lower.includes('peso')) return 'flame';
    return 'bolt';
  }

  contarPorTipo(tipo: string): number {
    return this.rutinas.filter((r) => r.tipoEntrenamiento === tipo).length;
  }

  contarPorNivel(nivel: string): number {
    return this.rutinas.filter((r) => r.nivel === nivel).length;
  }

  contarPorDuracion(rango: string): number {
    return this.rutinas.filter((r) => this.duracionCoincide(r.duracionSemanas, rango)).length;
  }
}
