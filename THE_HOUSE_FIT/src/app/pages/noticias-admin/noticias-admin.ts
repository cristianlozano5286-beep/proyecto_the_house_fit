import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../services/blog';
import { GimnasiosService } from '../../services/gimnasios';
import { Noticia } from '../../models/blog.models';

@Component({
  selector: 'app-noticias-admin',
  imports: [FormsModule],
  templateUrl: './noticias-admin.html',
  styleUrl: './noticias-admin.css',
})
export class NoticiasAdminComponent implements OnInit {
  noticias: Noticia[] = [];
  gimnasios: { id: number; nombre: string }[] = [];
  tipos: Noticia['tipo'][] = ['Novedad', 'Oferta', 'Promoción'];

  titulo = '';
  cuerpo = '';
  tipo: Noticia['tipo'] = 'Novedad';
  gimnasioId: number | null = null;
  imagen = '📰';

  mensaje = '';

  constructor(private blogService: BlogService, private gimnasiosService: GimnasiosService) {}

  ngOnInit(): void {
    this.gimnasios = this.gimnasiosService.listar().map((g) => ({ id: g.id, nombre: g.nombre }));
    this.cargar();
  }

  cargar(): void {
    this.noticias = [...this.blogService.listarNoticias()].reverse();
  }

  nombreGimnasio(id: number | null): string {
    if (!id) return 'General';
    return this.gimnasios.find((g) => g.id === id)?.nombre ?? 'Gimnasio';
  }

  // HU39, HU40: el administrador publica noticias/ofertas con título, cuerpo e imagen
  agregarNoticia(): void {
    if (!this.titulo.trim() || !this.cuerpo.trim()) {
      this.mensaje = 'El título y el contenido son obligatorios.';
      return;
    }
    this.blogService.agregarNoticia({
      titulo: this.titulo,
      cuerpo: this.cuerpo,
      imagen: this.imagen || '📰',
      tipo: this.tipo,
      gimnasioId: this.gimnasioId,
    });
    this.mensaje = 'Noticia publicada correctamente.';
    this.titulo = '';
    this.cuerpo = '';
    this.cargar();
  }

  eliminarNoticia(id: number): void {
    const confirmado = confirm('¿Eliminar esta noticia?');
    if (!confirmado) return;
    this.blogService.eliminarNoticia(id);
    this.cargar();
  }
}
