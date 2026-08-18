import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../services/productos';
import { Producto } from '../../models/catalogo.models';

@Component({
  selector: 'app-tienda',
  imports: [FormsModule],
  templateUrl: './tienda.html',
  styleUrl: './tienda.css',
})
export class TiendaComponent {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categoriaFiltro: string = '';
  productoSeleccionado: Producto | null = null;

  categorias = ['Suplemento', 'Implemento', 'Ropa deportiva'];

  constructor(private productosService: ProductosService) {
    this.productos = this.productosService.listar();
    this.productosFiltrados = [...this.productos];
  }

  filtrar(categoria: string): void {
    this.categoriaFiltro = categoria;
    this.productosFiltrados =
      categoria === '' ? [...this.productos] : this.productos.filter((p) => p.categoria === categoria);
  }

  verGuia(producto: Producto): void {
    this.productoSeleccionado = producto;
  }

  cerrarGuia(): void {
    this.productoSeleccionado = null;
  }

  formatearPrecio(valor: number): string {
    return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  }
}
