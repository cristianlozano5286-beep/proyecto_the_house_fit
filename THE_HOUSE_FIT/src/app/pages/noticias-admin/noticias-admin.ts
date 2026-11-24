import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BlogService } from '../../services/blog';
import { GimnasiosService } from '../../services/gimnasios';
import { AuthService } from '../../services/auth';
import { Noticia } from '../../models/blog.models';

type PantallaNoticia = 'hub' | 'paso1' | 'paso2' | 'paso3';

@Component({
  selector: 'app-noticias-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './noticias-admin.html',
  styleUrl: './noticias-admin.css',
})
export class NoticiasAdminComponent implements OnInit {
  pantallaActual: PantallaNoticia = 'hub';
  nombreUsuario = 'Daniel';

  noticias: Noticia[] = [];
  gimnasios: { id: number; nombre: string; ciudad?: string }[] = [];

  busqueda = '';
  filtroTipo = 'Todas';

  tiposCards: { id: Noticia['tipo']; icono: string; desc: string }[] = [
    { id: 'Novedad', icono: '📰', desc: 'Anuncios de equipamiento nuevo, horarios o eventos en la sede' },
    { id: 'Oferta', icono: '🔥', desc: 'Descuentos especiales por tiempo limitado en planes o tienda' },
    { id: 'Promoción', icono: '🎉', desc: 'Campañas 2x1, matrícula gratis o beneficios para nuevos miembros' },
  ];

  iconosSugeridos: string[] = ['📰', '🔥', '🎉', '🏆', '⚡', '📢', '💥', '🥗', '🏋️', '🚀'];

  titularesSugeridos: string[] = [
    '¡Gran Promoción 2x1 en Membresía Mensual!',
    'Llegaron nuevas máquinas biomecánicas a nuestra sede',
    'Jornada de valoración física y nutricional gratuita este sábado',
    'Descuento especial del 25% en suplementos seleccionados',
  ];

  idEditar: number | null = null;
  titulo = '';
  cuerpo = '';
  tipo: Noticia['tipo'] = 'Novedad';
  gimnasioId: number | null = null;
  imagen = '📰';

  mensaje = '';
  tipoMensaje: 'success' | 'error' | '' = '';

  constructor(
    private blogService: BlogService,
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
    await this.blogService.cargar();
    this.cargar();
  }

  cargar(): void {
    this.noticias = [...this.blogService.listarNoticias()].reverse();
  }

  get noticiasFiltradas(): Noticia[] {
    return this.noticias.filter((n) => {
      const coincideTipo = this.filtroTipo === 'Todas' || n.tipo === this.filtroTipo;
      if (!coincideTipo) return false;
      if (!this.busqueda.trim()) return true;
      const q = this.busqueda.toLowerCase();
      return (
        n.titulo.toLowerCase().includes(q) ||
        n.cuerpo.toLowerCase().includes(q) ||
        this.nombreGimnasio(n.gimnasioId).toLowerCase().includes(q)
      );
    });
  }

  nombreGimnasio(id: number | null): string {
    if (!id) return 'Todas las sedes (General)';
    return this.gimnasios.find((g) => g.id === id)?.nombre ?? 'Sede The House Fit';
  }

  iniciarNuevo(): void {
    this.limpiarFormulario();
    this.pantallaActual = 'paso1';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  iniciarEdicion(n: Noticia): void {
    this.idEditar = n.id;
    this.titulo = n.titulo;
    this.cuerpo = n.cuerpo;
    this.tipo = n.tipo;
    this.gimnasioId = n.gimnasioId;
    this.imagen = n.imagen || '📰';
    this.pantallaActual = 'paso1';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  volverAlHub(): void {
    this.pantallaActual = 'hub';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  irAPaso(paso: PantallaNoticia): void {
    this.pantallaActual = paso;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  irPasoSiguiente(): void {
    if (this.pantallaActual === 'paso1') {
      this.pantallaActual = 'paso2';
    } else if (this.pantallaActual === 'paso2') {
      if (!this.titulo.trim()) {
        this.tipoMensaje = 'error';
        this.mensaje = 'Por favor escribe un título llamativo para tu publicación.';
        return;
      }
      this.mensaje = '';
      this.pantallaActual = 'paso3';
    } else if (this.pantallaActual === 'paso3') {
      this.guardarNoticia();
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

  seleccionarTipo(t: Noticia['tipo'], icono: string): void {
    this.tipo = t;
    this.imagen = icono;
  }

  guardarNoticia(): void {
    if (!this.titulo.trim()) {
      this.tipoMensaje = 'error';
      this.mensaje = 'El título de la noticia u oferta es obligatorio.';
      return;
    }

    const payload = {
      titulo: this.titulo.trim(),
      cuerpo:
        this.cuerpo.trim() ||
        'Entérate de las últimas novedades, promociones y mejoras en nuestras instalaciones.',
      imagen: this.imagen || '📰',
      tipo: this.tipo,
      gimnasioId: this.gimnasioId,
    };

    if (this.idEditar !== null) {
      this.blogService.actualizarNoticia(this.idEditar, payload);
      this.mensaje = `Noticia "${payload.titulo}" actualizada correctamente.`;
    } else {
      this.blogService.agregarNoticia(payload);
      this.mensaje = `Noticia "${payload.titulo}" publicada en la comunidad.`;
    }
    this.tipoMensaje = 'success';
    this.cargar();
    this.limpiarFormulario();
    this.pantallaActual = 'hub';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminarNoticia(id: number): void {
    const confirmado = confirm('¿Eliminar esta noticia del portal?');
    if (!confirmado) return;
    this.blogService.eliminarNoticia(id);
    this.cargar();
    this.tipoMensaje = 'success';
    this.mensaje = 'Noticia eliminada correctamente.';
  }

  limpiarFormulario(): void {
    this.idEditar = null;
    this.titulo = '';
    this.cuerpo = '';
    this.tipo = 'Novedad';
    this.gimnasioId = null;
    this.imagen = '📰';
  }

  salirAlPanel(): void {
    this.router.navigate(['/panel/dashboard']);
  }
}
