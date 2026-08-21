import { Component, OnInit, inject, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../services/blog';
import { GimnasiosService } from '../../services/gimnasios';
import { Noticia, Resena } from '../../models/blog.models';

// Pipe para tiempo relativo
@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    const date = new Date(value);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Hace ' + diff + 's';
    if (diff < 3600) return 'Hace ' + Math.floor(diff / 60) + 'm';
    if (diff < 86400) return 'Hace ' + Math.floor(diff / 3600) + 'h';
    if (diff < 604800) return 'Hace ' + Math.floor(diff / 86400) + 'd';
    return value;
  }
}

@Component({
  selector: 'app-blog-publico',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeAgoPipe],
  templateUrl: './blog-publico.html',
  styleUrls: ['./blog-publico.css'],
})
export class BlogPublicoComponent implements OnInit {
  private blogService = inject(BlogService);
  private gimnasiosService = inject(GimnasiosService);

  // Estados
  pestanaActiva: 'noticias' | 'resenas' = 'noticias';
  categoriaSeleccionada: string = 'todas';
  vista: 'grid' | 'lista' = 'grid';
  
  // Datos
  noticias: Noticia[] = [];
  resenas: Resena[] = [];
  contenidoFiltrado: (Noticia | Resena)[] = [];
  
  // Búsqueda y ordenación
  terminoBusqueda: string = '';
  ordenSeleccionado: string = 'reciente';
  
  // Paginación
  itemsPorPagina: number = 6;
  paginaActual: number = 1;
  totalItems: number = 0;
  cargando: boolean = true;
  cargandoMas: boolean = false;

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    // Simular carga de API
    setTimeout(() => {
      this.noticias = [...this.blogService.listarNoticias()].reverse().map(n => ({
        ...n,
        destacado: Math.random() > 0.7,
        visitas: Math.floor(Math.random() * 1000),
        comentarios: Math.floor(Math.random() * 50),
        expandido: false,
        cuerpoCompleto: n.cuerpo + ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      }));
      
      this.resenas = [...this.blogService.listarResenas()].reverse().map(r => ({
        ...r,
        likes: Math.floor(Math.random() * 200)
      }));
      
      this.totalItems = this.pestanaActiva === 'noticias' ? this.noticias.length : this.resenas.length;
      this.filtrarContenido();
      this.cargando = false;
    }, 800);
  }

  cambiarPestana(p: 'noticias' | 'resenas') {
    this.pestanaActiva = p;
    this.terminoBusqueda = '';
    this.categoriaSeleccionada = 'todas';
    this.paginaActual = 1;
    this.totalItems = p === 'noticias' ? this.noticias.length : this.resenas.length;
    this.filtrarContenido();
  }

  cambiarVista(v: 'grid' | 'lista') {
    this.vista = v;
  }

  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.paginaActual = 1;
    this.filtrarContenido();
  }

  filtrarContenido() {
    const datos = this.pestanaActiva === 'noticias' ? this.noticias : this.resenas;
    
    // Filtrar por búsqueda
    let filtrados = datos.filter(item => {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      if (!termino) return true;
      
      const titulo = item.titulo?.toLowerCase() || '';
      const cuerpo = item.cuerpo?.toLowerCase() || '';
      const gym = this.nombreGimnasio(item.gimnasioId)?.toLowerCase() || '';
      
      return titulo.includes(termino) || cuerpo.includes(termino) || gym.includes(termino);
    });
    
    // Filtrar por categoría (solo noticias)
    if (this.pestanaActiva === 'noticias' && this.categoriaSeleccionada !== 'todas') {
      filtrados = filtrados.filter((item: any) => item.tipo === this.categoriaSeleccionada);
    }
    
    // Ordenar
    filtrados = this.ordenarContenidoData(filtrados);
    
    // Paginación
    this.totalItems = filtrados.length;
    const inicio = 0;
    const fin = this.paginaActual * this.itemsPorPagina;
    this.contenidoFiltrado = filtrados.slice(inicio, fin);
  }

  ordenarContenido() {
    this.filtrarContenido();
  }

  private ordenarContenidoData(data: any[]): any[] {
    const sorted = [...data];
    
    switch(this.ordenSeleccionado) {
      case 'reciente':
        return sorted.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      case 'antiguo':
        return sorted.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      case 'puntuacion':
        if (this.pestanaActiva === 'resenas') {
          return sorted.sort((a, b) => (b.puntuacion || 0) - (a.puntuacion || 0));
        }
        return sorted;
      case 'populares':
        return sorted.sort((a, b) => (b.visitas || 0) - (a.visitas || 0));
      default:
        return sorted;
    }
  }

  cargarMas() {
    this.cargandoMas = true;
    setTimeout(() => {
      this.paginaActual++;
      this.filtrarContenido();
      this.cargandoMas = false;
    }, 500);
  }

  toggleExpandir(item: any) {
    item.expandido = !item.expandido;
  }

  nombreGimnasio(id: number | null): string {
    if (!id) return 'General';
    return this.gimnasiosService.obtener(id)?.nombre ?? 'Gimnasio';
  }

  estrellas(puntuacion: number): string {
    const llenas = '★'.repeat(puntuacion);
    const vacias = '☆'.repeat(5 - puntuacion);
    return `<span class="stars">${llenas}<span class="empty">${vacias}</span></span>`;
  }

  compartir(red: string, titulo: string, id: number) {
    const url = window.location.origin + '/blog/' + id;
    const texto = encodeURIComponent(titulo + ' - ' + url);
    
    let shareUrl = '';
    switch(red) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${texto}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${texto}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }

  copiarEnlace(id: number) {
    const url = window.location.origin + '/blog/' + id;
    navigator.clipboard?.writeText(url).then(() => {
      // Puedes mostrar un toast o notificación
      alert('¡Enlace copiado al portapapeles!');
    });
  }
}