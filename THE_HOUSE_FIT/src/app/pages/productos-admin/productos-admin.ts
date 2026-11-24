import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductosService } from '../../services/productos';
import { AuthService } from '../../services/auth';
import { Producto } from '../../models/catalogo.models';

type PantallaProducto = 'hub' | 'paso1' | 'paso2' | 'paso3';

@Component({
  selector: 'app-productos-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './productos-admin.html',
  styleUrl: './productos-admin.css',
})
export class ProductosAdminComponent implements OnInit {
  pantallaActual: PantallaProducto = 'hub';
  nombreUsuario = 'Daniel';

  productos: Producto[] = [];
  busqueda = '';
  filtroCategoria = 'Todas';

  categoriasCards: { id: Producto['categoria']; icono: string; desc: string }[] = [
    { id: 'Suplemento', icono: '🥤', desc: 'Proteínas, creatinas, aminoácidos, pre-entrenos y vitaminas' },
    { id: 'Implemento', icono: '🏋️', desc: 'Cinturones lumbares, straps, bandas, mancuernas y accesorios' },
    { id: 'Ropa deportiva', icono: '👕', desc: 'Camisetas de compresión, shorts, guantes y calzado' },
  ];

  iconosSugeridos: string[] = ['🥤', '⚡', '💊', '🏋️', '🧤', '👕', '👟', '🧴', '🛒', '🔥'];

  nombresSugeridos: Record<Producto['categoria'], string[]> = {
    Suplemento: ['Proteína Whey Isolate 2Lb', 'Creatina Monohidratada 300g', 'Pre-Workout Explosive Energy', 'BCAA + Glutamina Recovery'],
    Implemento: ['Cinturón Lumbar de Levantamiento', 'Straps de Agarre Olímpico', 'Kit de Bandas de Resistencia', 'Shaker Antiderrame 700ml'],
    'Ropa deportiva': ['Camiseta Compresión Dry-Fit', 'Short Deportivo Pro-Flex', 'Guantes con Muñequera Reforzada', 'Sudadera Térmica Entrenamiento'],
  };

  idEditar: number | null = null;
  nombre = '';
  categoria: Producto['categoria'] = 'Suplemento';
  precio = 95000;
  stock = 25;
  descripcion = '';
  guiaNutricional = '';
  imagen = '🥤';

  mensaje = '';
  tipoMensaje: 'success' | 'error' | '' = '';

  constructor(
    private productosService: ProductosService,
    private authService: AuthService,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    const sesion = this.authService.obtenerUsuario();
    if (sesion?.nombre) {
      this.nombreUsuario = sesion.nombre.split(' ')[0];
    }
    await this.productosService.cargar();
    this.cargar();
  }

  cargar(): void {
    this.productos = this.productosService.listar();
  }

  get productosFiltrados(): Producto[] {
    return this.productos.filter((p) => {
      const coincideCat = this.filtroCategoria === 'Todas' || p.categoria === this.filtroCategoria;
      if (!coincideCat) return false;
      if (!this.busqueda.trim()) return true;
      const q = this.busqueda.toLowerCase();
      return (
        p.nombre.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q))
      );
    });
  }

  get stockTotal(): number {
    return this.productos.reduce((acc, p) => acc + (p.stock || 0), 0);
  }

  iniciarNuevo(): void {
    this.limpiarFormulario();
    this.pantallaActual = 'paso1';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  iniciarEdicion(producto: Producto): void {
    this.idEditar = producto.id;
    this.nombre = producto.nombre;
    this.categoria = producto.categoria;
    this.precio = producto.precio;
    this.stock = producto.stock;
    this.descripcion = producto.descripcion || '';
    this.guiaNutricional = producto.guiaNutricional || '';
    this.imagen = producto.imagen || '🛒';
    this.pantallaActual = 'paso1';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  volverAlHub(): void {
    this.pantallaActual = 'hub';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  irAPaso(paso: PantallaProducto): void {
    this.pantallaActual = paso;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  irPasoSiguiente(): void {
    if (this.pantallaActual === 'paso1') {
      if (!this.nombre.trim()) {
        this.tipoMensaje = 'error';
        this.mensaje = 'Por favor ingresa el nombre del producto antes de continuar.';
        return;
      }
      this.mensaje = '';
      this.pantallaActual = 'paso2';
    } else if (this.pantallaActual === 'paso2') {
      this.mensaje = '';
      this.pantallaActual = 'paso3';
    } else if (this.pantallaActual === 'paso3') {
      this.guardar();
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

  seleccionarCategoria(cat: Producto['categoria'], icono: string): void {
    this.categoria = cat;
    this.imagen = icono;
  }

  ajustarPrecio(delta: number): void {
    const nuevo = (Number(this.precio) || 0) + delta;
    if (nuevo >= 5000) {
      this.precio = nuevo;
    }
  }

  ajustarStock(delta: number): void {
    const nuevo = (Number(this.stock) || 0) + delta;
    if (nuevo >= 0) {
      this.stock = nuevo;
    }
  }

  guardar(): void {
    if (!this.nombre.trim()) {
      this.tipoMensaje = 'error';
      this.mensaje = 'El nombre del producto es obligatorio.';
      return;
    }

    const datos = {
      nombre: this.nombre.trim(),
      categoria: this.categoria,
      precio: Number(this.precio) || 0,
      stock: Number(this.stock) || 0,
      descripcion:
        this.descripcion.trim() ||
        'Producto oficial disponible en la tienda deportiva de The House Fit.',
      guiaNutricional: this.guiaNutricional.trim(),
      imagen: this.imagen || '🛒',
    };

    if (this.idEditar != null) {
      this.productosService.actualizar(this.idEditar, datos);
      this.mensaje = `Producto "${datos.nombre}" actualizado correctamente.`;
    } else {
      this.productosService.crear(datos);
      this.mensaje = `Producto "${datos.nombre}" publicado en la tienda.`;
    }
    this.tipoMensaje = 'success';
    this.cargar();
    this.limpiarFormulario();
    this.pantallaActual = 'hub';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(producto: Producto): void {
    const confirmado = confirm(`¿Eliminar el producto "${producto.nombre}"?`);
    if (!confirmado) return;
    this.productosService.eliminar(producto.id);
    this.cargar();
    this.tipoMensaje = 'success';
    this.mensaje = `Producto "${producto.nombre}" eliminado del catálogo.`;
  }

  limpiarFormulario(): void {
    this.idEditar = null;
    this.nombre = '';
    this.categoria = 'Suplemento';
    this.precio = 95000;
    this.stock = 25;
    this.descripcion = '';
    this.guiaNutricional = '';
    this.imagen = '🥤';
  }

  salirAlPanel(): void {
    this.router.navigate(['/panel/dashboard']);
  }

  formatearPrecio(valor: number): string {
    return (valor || 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  }
}
