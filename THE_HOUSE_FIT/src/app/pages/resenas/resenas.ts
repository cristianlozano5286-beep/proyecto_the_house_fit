import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../services/blog';
import { GimnasiosService } from '../../services/gimnasios';
import { AuthService } from '../../services/auth';
import { Resena } from '../../models/blog.models';

@Component({
  selector: 'app-resenas',
  imports: [FormsModule],
  templateUrl: './resenas.html',
  styleUrl: './resenas.css',
})
export class ResenasComponent implements OnInit {
  resenas: Resena[] = [];
  gimnasios: { id: number; nombre: string }[] = [];
  esAdministrador = false;

  gimnasioId: number | null = null;
  titulo = '';
  cuerpo = '';
  puntuacion = 5;
  imagen = '⭐';

  mensaje = '';

  constructor(
    private blogService: BlogService,
    private gimnasiosService: GimnasiosService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.gimnasios = this.gimnasiosService.listar().map((g) => ({ id: g.id, nombre: g.nombre }));
    this.esAdministrador = this.authService.obtenerRol() === 'Administrador';
    this.cargar();
  }

  cargar(): void {
    this.resenas = [...this.blogService.listarResenas()].reverse();
  }

  nombreGimnasio(id: number): string {
    return this.gimnasios.find((g) => g.id === id)?.nombre ?? 'Gimnasio';
  }

  // HU36, HU37: agregar una reseña con título, cuerpo y puntuación
  agregarResena(): void {
    if (!this.gimnasioId || !this.titulo.trim() || !this.cuerpo.trim()) {
      this.mensaje = 'Selecciona un gimnasio y completa el título y el comentario.';
      return;
    }
    this.blogService.agregarResena({
      gimnasioId: this.gimnasioId,
      usuario: this.authService.obtenerNombre() || 'Usuario anónimo',
      titulo: this.titulo,
      cuerpo: this.cuerpo,
      imagen: this.imagen || '⭐',
      puntuacion: Number(this.puntuacion),
    });
    this.mensaje = '¡Gracias por tu reseña!';
    this.titulo = '';
    this.cuerpo = '';
    this.puntuacion = 5;
    this.cargar();
  }

  eliminarResena(id: number): void {
    const confirmado = confirm('¿Eliminar esta reseña?');
    if (!confirmado) return;
    this.blogService.eliminarResena(id);
    this.cargar();
  }

  estrellas(puntuacion: number): string {
    return '★'.repeat(puntuacion) + '☆'.repeat(5 - puntuacion);
  }
}
