import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../services/productos';
import { Producto } from '../../models/catalogo.models';

@Component({
  selector: 'app-productos-admin',
  imports: [FormsModule],
  templateUrl: './productos-admin.html',
  styleUrl: './productos-admin.css',
})
export class ProductosAdminComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Producto['categoria'][] = ['Suplemento', 'Implemento', 'Ropa deportiva'];

  idEditar: number | null = null;
  nombre = '';
  categoria: Producto['categoria'] = 'Suplemento';
  precio: number | null = null;
  stock: number | null = null;
  descripcion = '';
  guiaNutricional = '';
  imagen = '🛒';

  mensaje = '';
  tipoMensaje: 'success' | 'error' | '' = '';

  constructor(private productosService: ProductosService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.productos = this.productosService.listar();
  }

  // HU22, HU23, HU24: registro de productos (implementos/suplementos) con stock y precio
  guardar(): void {
    if (!this.nombre.trim() || this.precio == null || this.stock == null) {
      this.tipoMensaje = 'error';
      this.mensaje = 'Nombre, precio y stock son obligatorios.';
      return;
    }

    const datos = {
      nombre: this.nombre,
      categoria: this.categoria,
      precio: Number(this.precio),
      stock: Number(this.stock),
      descripcion: this.descripcion,
      guiaNutricional: this.guiaNutricional,
      imagen: this.imagen || '🛒',
    };

    if (this.idEditar != null) {
      this.productosService.actualizar(this.idEditar, datos);
      this.mensaje = 'Producto actualizado correctamente.';
    } else {
      this.productosService.crear(datos);
      this.mensaje = 'Producto registrado correctamente.';
    }
    this.tipoMensaje = 'success';
    this.cargar();
    this.limpiarFormulario();
  }

  editar(producto: Producto): void {
    this.idEditar = producto.id;
    this.nombre = producto.nombre;
    this.categoria = producto.categoria;
    this.precio = producto.precio;
    this.stock = producto.stock;
    this.descripcion = producto.descripcion;
    this.guiaNutricional = producto.guiaNutricional;
    this.imagen = producto.imagen;
  }

  eliminar(producto: Producto): void {
    const confirmado = confirm(`¿Eliminar el producto "${producto.nombre}"?`);
    if (!confirmado) return;
    this.productosService.eliminar(producto.id);
    this.cargar();
  }

  limpiarFormulario(): void {
    this.idEditar = null;
    this.nombre = '';
    this.categoria = 'Suplemento';
    this.precio = null;
    this.stock = null;
    this.descripcion = '';
    this.guiaNutricional = '';
    this.imagen = '🛒';
  }

  formatearPrecio(valor: number): string {
    return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  }
}
