import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GimnasiosService } from '../../services/gimnasios';
import { BlogService } from '../../services/blog';
import { Gimnasio } from '../../models/catalogo.models';
import { Noticia } from '../../models/blog.models';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css'],
})
export class InicioComponent {
  gimnasiosDestacados: Gimnasio[] = [];
  noticiasRecientes: Noticia[] = [];
  stats: { value: string; label: string }[] = [];

  constructor(
    private gimnasiosService: GimnasiosService,
    private blogService: BlogService,
  ) {
    const gimnasios = this.gimnasiosService.listar();
    this.gimnasiosDestacados = gimnasios.slice(0, 3);
    this.noticiasRecientes = this.blogService.listarNoticias().slice(0, 3);

    this.stats = [
      { value: String(gimnasios.length), label: 'Gimnasios afiliados' },
      { value: '11', label: 'Instructores certificados' },
      { value: '150+', label: 'Rutinas disponibles' },
      { value: '4.6', label: 'Calificación promedio' },
    ];
  }

  promedio(gimnasioId: number): number {
    return this.blogService.promedioPuntuacion(gimnasioId);
  }

  estrellas(gimnasioId: number): string {
    const p = Math.round(this.promedio(gimnasioId));
    return '★'.repeat(p) + '☆'.repeat(5 - p);
  }
}
