import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';

import { ClasesService } from '../../services/clases';
import { GimnasiosService } from '../../services/gimnasios';
import { ClaseDisponible, ReservaClase } from '../../models/clase.models';
import {
  ConfirmarReservaDialogComponent,
  ConfirmarReservaData,
} from './confirmar-reserva-dialog/confirmar-reserva-dialog';

export interface DisciplinaMeta {
  nombre: string;
  icono: string;
  tag: string;
  imagen: string;
  color: string;
  bgGradient: string;
}

export const DISCIPLINAS_META: Record<string, DisciplinaMeta> = {
  Spinning: {
    nombre: 'Spinning',
    icono: '🚴',
    tag: 'Cardio & Resistencia',
    imagen: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=700&q=80',
    color: '#06b6d4',
    bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(20, 20, 22, 0.95) 100%)',
  },
  CrossFit: {
    nombre: 'CrossFit',
    icono: '⚡',
    tag: 'Fuerza & WOD',
    imagen: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=700&q=80',
    color: '#ff4500',
    bgGradient: 'linear-gradient(135deg, rgba(255, 69, 0, 0.25) 0%, rgba(20, 20, 22, 0.95) 100%)',
  },
  Yoga: {
    nombre: 'Yoga',
    icono: '🧘',
    tag: 'Flexibilidad & Paz',
    imagen: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&q=80',
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(20, 20, 22, 0.95) 100%)',
  },
  Funcional: {
    nombre: 'Funcional',
    icono: '💪',
    tag: 'Acondicionamiento',
    imagen: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=80',
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(20, 20, 22, 0.95) 100%)',
  },
  Boxeo: {
    nombre: 'Boxeo',
    icono: '🥊',
    tag: 'Potencia & Reflejos',
    imagen: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=700&q=80',
    color: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(20, 20, 22, 0.95) 100%)',
  },
  Pilates: {
    nombre: 'Pilates',
    icono: '🤸',
    tag: 'Core & Postura',
    imagen: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=700&q=80',
    color: '#a855f7',
    bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(20, 20, 22, 0.95) 100%)',
  },
};

@Component({
  selector: 'app-reservar-clase',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './reservar-clase.html',
  styleUrl: './reservar-clase.css',
})
export class ReservarClaseComponent implements OnInit {
  gimnasios: { id: number; nombre: string; ciudad?: string }[] = [];
  tiposClase: ClaseDisponible['tipoClase'][] = ['Spinning', 'CrossFit', 'Yoga', 'Funcional', 'Boxeo', 'Pilates'];

  // Filtros activos
  gimnasioId: number | null = null;
  tipoClase: string | null = null;
  fecha: Date | null = null;
  fechaStr: string = '';
  minFechaStr: string = '';
  personas: number = 1;

  // Estado de Menús desplegables personalizados
  menuGimnasioAbierto = false;
  menuDisciplinaAbierto = false;

  // Visualización y estado
  vista: 'cards' | 'tabla' = 'cards';
  cargando: boolean = false;
  progreso: number = 0;
  buscado: boolean = false;

  // Datos
  columnas: string[] = ['gimnasio', 'tipoClase', 'instructor', 'hora', 'duracion', 'cupos', 'precio', 'accion'];
  clases: ClaseDisponible[] = [];
  misReservas: ReservaClase[] = [];

  // Feedback Toast
  toast: { tipo: 'exito' | 'error' | 'info'; texto: string } | null = null;
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private clasesService: ClasesService,
    private gimnasiosService: GimnasiosService,
    private dialog: MatDialog,
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown-container')) {
      this.cerrarMenus();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cerrarMenus();
  }

  toggleMenuGimnasio(event?: Event): void {
    if (event) event.stopPropagation();
    this.menuGimnasioAbierto = !this.menuGimnasioAbierto;
    if (this.menuGimnasioAbierto) {
      this.menuDisciplinaAbierto = false;
    }
  }

  toggleMenuDisciplina(event?: Event): void {
    if (event) event.stopPropagation();
    this.menuDisciplinaAbierto = !this.menuDisciplinaAbierto;
    if (this.menuDisciplinaAbierto) {
      this.menuGimnasioAbierto = false;
    }
  }

  cerrarMenus(): void {
    this.menuGimnasioAbierto = false;
    this.menuDisciplinaAbierto = false;
  }

  seleccionarGimnasio(id: number | null): void {
    this.gimnasioId = id;
    this.menuGimnasioAbierto = false;
  }

  seleccionarDisciplina(tipo: string | null): void {
    this.tipoClase = tipo;
    this.menuDisciplinaAbierto = false;
  }

  get gimnasioSeleccionadoTexto(): string {
    if (this.gimnasioId === null) return 'Todos los gimnasios';
    return this.nombreGimnasio(this.gimnasioId);
  }

  async ngOnInit(): Promise<void> {
    // Configurar fechas por defecto: Mañana para evitar validaciones vacías
    const hoy = new Date();
    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);

    this.minFechaStr = this.formatDateIso(hoy);
    this.fechaStr = this.formatDateIso(manana);
    this.fecha = manana;

    // Cargar catálogos
    this.gimnasios = this.gimnasiosService.listar().map((g) => ({
      id: g.id,
      nombre: g.nombre,
      ciudad: g.ciudad,
    }));
    this.clases = this.clasesService.listar();

    // Cargar reservas previas del usuario si existen
    await this.cargarMisReservas();
  }

  private formatDateIso(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  onFechaChange(): void {
    if (this.fechaStr) {
      const [y, m, d] = this.fechaStr.split('-').map(Number);
      this.fecha = new Date(y, m - 1, d);
    } else {
      this.fecha = null;
    }
  }

  cambiarPersonas(delta: number): void {
    const nuevo = this.personas + delta;
    if (nuevo >= 1 && nuevo <= 10) {
      this.personas = nuevo;
    }
  }

  cambiarVista(nuevaVista: 'cards' | 'tabla'): void {
    this.vista = nuevaVista;
  }

  filtroRapido(tipo: string | null): void {
    this.tipoClase = tipo;
    this.cerrarMenus();
    this.clases = this.clasesService.buscar(this.gimnasioId, this.tipoClase);
  }

  nombreGimnasio(id: number): string {
    return this.gimnasios.find((g) => g.id === id)?.nombre ?? 'Gimnasio Afiliado';
  }

  ciudadGimnasio(id: number): string {
    return this.gimnasios.find((g) => g.id === id)?.ciudad ?? 'Sede Principal';
  }

  getMeta(tipo: string): DisciplinaMeta {
    return (
      DISCIPLINAS_META[tipo] || {
        nombre: tipo,
        icono: '⚡',
        tag: 'Entrenamiento',
        imagen: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=700&q=80',
        color: '#ff4500',
        bgGradient: 'linear-gradient(135deg, rgba(255, 69, 0, 0.25) 0%, rgba(20, 20, 22, 0.95) 100%)',
      }
    );
  }

  getIniciales(nombre: string): string {
    if (!nombre) return 'CO';
    const partes = nombre.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombre.slice(0, 2).toUpperCase();
  }

  formatearPrecio(valor: number): string {
    return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  }

  formatearFechaLegible(fechaIso: string): string {
    if (!fechaIso) return '';
    const partes = fechaIso.split('-');
    if (partes.length === 3) {
      const d = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      return d.toLocaleDateString('es-CO', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return fechaIso;
  }

  buscarClases(): void {
    this.cerrarMenus();
    if (!this.fechaStr) {
      this.mostrarToast('error', 'Por favor selecciona la fecha en la que deseas asistir.');
      return;
    }
    if (this.personas < 1) {
      this.mostrarToast('error', 'Debes seleccionar al menos una persona.');
      return;
    }

    this.cargando = true;
    this.progreso = 25;
    this.buscado = false;

    setTimeout(() => (this.progreso = 55), 250);
    setTimeout(() => (this.progreso = 85), 500);

    setTimeout(() => {
      this.clases = this.clasesService.buscar(this.gimnasioId, this.tipoClase);
      this.cargando = false;
      this.buscado = true;
    }, 750);
  }

  limpiarBusqueda(): void {
    this.gimnasioId = null;
    this.tipoClase = null;
    this.cerrarMenus();
    const manana = new Date();
    manana.setDate(new Date().getDate() + 1);
    this.fechaStr = this.formatDateIso(manana);
    this.fecha = manana;
    this.personas = 1;
    this.progreso = 0;
    this.cargando = false;
    this.buscado = false;
    this.clases = this.clasesService.listar();
  }

  reservarClase(clase: ClaseDisponible): void {
    this.cerrarMenus();
    if (!this.fechaStr) {
      this.mostrarToast('error', 'Selecciona primero la fecha en la que deseas asistir.');
      return;
    }

    const data: ConfirmarReservaData = {
      clase,
      nombreGimnasio: this.nombreGimnasio(clase.gimnasioId),
      fecha: this.formatearFechaLegible(this.fechaStr),
      personas: this.personas,
    };

    const dialogRef = this.dialog.open(ConfirmarReservaDialogComponent, {
      data,
      width: '460px',
      panelClass: 'dark-reserva-dialog',
    });

    dialogRef.afterClosed().subscribe(async (confirmado) => {
      if (confirmado) {
        // El MID valida que la fecha no sea en el pasado y que existan cupos suficientes
        const error = await this.clasesService.reservar(clase.id, this.fechaStr, this.personas);
        if (error) {
          this.mostrarToast('error', error);
          return;
        }

        this.mostrarToast('exito', `¡Reserva confirmada con éxito en ${data.nombreGimnasio}! Te esperamos.`);
        await this.cargarMisReservas();
      }
    });
  }

  async cargarMisReservas(): Promise<void> {
    try {
      await this.clasesService.cargarReservas();
      this.misReservas = this.clasesService.misReservas();
    } catch {
      // Ignorar si no hay sesión activa
    }
  }

  mostrarToast(tipo: 'exito' | 'error' | 'info', texto: string): void {
    this.toast = { tipo, texto };
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.toast = null;
    }, 5000);
  }

  cerrarToast(): void {
    this.toast = null;
  }
}