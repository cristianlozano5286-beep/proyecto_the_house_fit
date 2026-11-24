import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../services/blog';
import { GimnasiosService } from '../../services/gimnasios';
import { AuthService } from '../../services/auth';
import { Resena } from '../../models/blog.models';

@Component({
  selector: 'app-resenas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resenas.html',
  styleUrl: './resenas.css',
})
export class ResenasComponent implements OnInit {
  resenas: Resena[] = [];
  resenasFiltradas: Resena[] = [];
  gimnasios: { id: number; nombre: string; ciudad?: string }[] = [];
  esAdministrador = false;

  // Filtro activo de la lista
  filtroGimnasioId: number | null = null;
  menuFiltroAbierto = false;

  // Formulario de nueva reseña
  gimnasioId: number | null = null;
  titulo = '';
  cuerpo = '';
  puntuacion = 5;
  hoverPuntuacion = 0;
  imagen = '⭐';
  menuGimnasioAbierto = false;

  // Notificaciones Toast
  toast: { tipo: 'exito' | 'error'; texto: string } | null = null;
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private blogService: BlogService,
    private gimnasiosService: GimnasiosService,
    private authService: AuthService,
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown-container')) {
      this.menuGimnasioAbierto = false;
      this.menuFiltroAbierto = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.menuGimnasioAbierto = false;
    this.menuFiltroAbierto = false;
  }

  ngOnInit(): void {
    this.gimnasios = this.gimnasiosService.listar().map((g) => ({
      id: g.id,
      nombre: g.nombre,
      ciudad: g.ciudad,
    }));
    this.esAdministrador = this.authService.obtenerRol() === 'Administrador';
    this.cargar();
  }

  cargar(): void {
    this.resenas = [...this.blogService.listarResenas()].reverse();
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    if (this.filtroGimnasioId === null) {
      this.resenasFiltradas = [...this.resenas];
    } else {
      this.resenasFiltradas = this.resenas.filter((r) => r.gimnasioId === this.filtroGimnasioId);
    }
  }

  filtrarPorGimnasio(id: number | null): void {
    this.filtroGimnasioId = id;
    this.menuFiltroAbierto = false;
    this.aplicarFiltro();
  }

  toggleMenuGimnasio(event?: Event): void {
    if (event) event.stopPropagation();
    this.menuGimnasioAbierto = !this.menuGimnasioAbierto;
    if (this.menuGimnasioAbierto) this.menuFiltroAbierto = false;
  }

  toggleMenuFiltro(event?: Event): void {
    if (event) event.stopPropagation();
    this.menuFiltroAbierto = !this.menuFiltroAbierto;
    if (this.menuFiltroAbierto) this.menuGimnasioAbierto = false;
  }

  seleccionarGimnasio(id: number | null): void {
    this.gimnasioId = id;
    this.menuGimnasioAbierto = false;
  }

  get gimnasioSeleccionadoTexto(): string {
    if (this.gimnasioId === null) return 'Selecciona un gimnasio';
    return this.nombreGimnasio(this.gimnasioId);
  }

  get filtroGimnasioTexto(): string {
    if (this.filtroGimnasioId === null) return 'Todas las sedes';
    return this.nombreGimnasio(this.filtroGimnasioId);
  }

  nombreGimnasio(id: number): string {
    return this.gimnasios.find((g) => g.id === id)?.nombre ?? 'Gimnasio Afiliado';
  }

  ciudadGimnasio(id: number): string {
    return this.gimnasios.find((g) => g.id === id)?.ciudad ?? 'Sede Principal';
  }

  setPuntuacion(val: number): void {
    this.puntuacion = val;
  }

  setHoverPuntuacion(val: number): void {
    this.hoverPuntuacion = val;
  }

  get ratingLabel(): string {
    const val = this.hoverPuntuacion || this.puntuacion;
    switch (val) {
      case 5:
        return '5.0 ★ Excelente experiencia';
      case 4:
        return '4.0 ★ Muy buen gimnasio';
      case 3:
        return '3.0 ★ Bueno, cumple expectativas';
      case 2:
        return '2.0 ★ Regular, aspectos a mejorar';
      case 1:
        return '1.0 ★ Malo, no recomendado';
      default:
        return '5.0 ★ Excelente experiencia';
    }
  }

  get promedioCalificacion(): string {
    if (this.resenas.length === 0) return '5.0';
    const suma = this.resenas.reduce((acc, r) => acc + (r.puntuacion || 5), 0);
    return (suma / this.resenas.length).toFixed(1);
  }

  getIniciales(nombre: string): string {
    if (!nombre) return 'US';
    const partes = nombre.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombre.slice(0, 2).toUpperCase();
  }

  formatearFecha(fechaStr?: string): string {
    if (!fechaStr) return 'Reciente';
    const partes = fechaStr.split('-');
    if (partes.length === 3) {
      const d = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      return d.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return fechaStr;
  }

  agregarResena(): void {
    if (!this.gimnasioId) {
      this.mostrarToast('error', 'Por favor selecciona el gimnasio que deseas valorar.');
      return;
    }
    if (!this.titulo.trim()) {
      this.mostrarToast('error', 'Escribe un título breve para tu reseña.');
      return;
    }
    if (!this.cuerpo.trim()) {
      this.mostrarToast('error', 'Por favor escribe tu comentario o experiencia.');
      return;
    }

    this.blogService.agregarResena({
      gimnasioId: this.gimnasioId,
      usuario: this.authService.obtenerNombre() || 'Atleta The House Fit',
      titulo: this.titulo.trim(),
      cuerpo: this.cuerpo.trim(),
      imagen: this.imagen || '⭐',
      puntuacion: Number(this.puntuacion),
    });


    this.mostrarToast('exito', '¡Tu reseña ha sido publicada con éxito en la comunidad!');
    this.titulo = '';
    this.cuerpo = '';
    this.gimnasioId = null;
    this.puntuacion = 5;
    this.hoverPuntuacion = 0;
    this.cargar();
  }

  eliminarResena(id: number): void {
    const confirmado = confirm('¿Estás seguro de que deseas eliminar esta reseña?');
    if (!confirmado) return;
    this.blogService.eliminarResena(id);
    this.mostrarToast('exito', 'Reseña eliminada correctamente.');
    this.cargar();
  }

  mostrarToast(tipo: 'exito' | 'error', texto: string): void {
    this.toast = { tipo, texto };
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toast = null;
    }, 4500);
  }

  cerrarToast(): void {
    this.toast = null;
  }

  enfocarFormulario(): void {
    const elem = document.getElementById('inputTitulo');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      elem.focus();
    }
  }
}
