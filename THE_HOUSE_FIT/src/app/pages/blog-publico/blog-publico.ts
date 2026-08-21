import { Component } from '@angular/core';
import { BlogService } from '../../services/blog';
import { GimnasiosService } from '../../services/gimnasios';
import { Noticia, Resena } from '../../models/blog.models';

@Component({
  selector: 'app-blog-publico',
  imports: [],
  templateUrl: './blog-publico.html',
  styleUrl: './blog-publico.css',
})
export class BlogPublicoComponent {
  pestanaActiva: 'noticias' | 'resenas' = 'noticias';
  noticias: Noticia[] = [];
  resenas: Resena[] = [];

  constructor(
    private blogService: BlogService,
    private gimnasiosService: GimnasiosService,
  ) {
    this.noticias = [...this.blogService.listarNoticias()].reverse();
    this.resenas = [...this.blogService.listarResenas()].reverse();
  }

  cambiarPestana(p: 'noticias' | 'resenas'): void {
    this.pestanaActiva = p;
  }

  nombreGimnasio(id: number | null): string {
    if (!id) return 'General';
    return this.gimnasiosService.obtener(id)?.nombre ?? 'Gimnasio';
  }

  estrellas(puntuacion: number): string {
    return '★'.repeat(puntuacion) + '☆'.repeat(5 - puntuacion);
  }
}
