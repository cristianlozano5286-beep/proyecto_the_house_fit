import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  stockMaximo: number;
  categoria: 'Suplemento' | 'Implemento' | 'Ropa deportiva';
  imagen: string;
  imagenAlt: string;
  guiaNutricional?: string;
  oferta?: boolean;
  nuevo?: boolean;
  imagenCargada?: boolean;
}

interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

interface DatosPago {
  telefono: string;
  email: string;
  numeroTarjeta: string;
  nombreTarjeta: string;
  vencimiento: string;
  cvv: string;
  tipoDocumento: string;
  numeroDocumento: string;
  banco: string;
}

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tienda.html',
  styleUrls: ['./tienda.css'],
})
export class TiendaComponent implements OnInit {
  // 📦 PRODUCTOS
  productos: Producto[] = [
    {
      id: 1,
      nombre: 'Proteína Whey 2LB',
      descripcion: 'Proteínas de suero para recuperación muscular.',
      precio: 120000,
      stock: 35,
      stockMaximo: 50,
      categoria: 'Suplemento',
      imagen: 'proteina.png',
      imagenAlt: 'Proteína Whey 2LB',
      guiaNutricional: 'Tomar 1 porción (30g) después del entrenamiento.',
      oferta: true,
      nuevo: false,
      imagenCargada: true
    },
    {
      id: 2,
      nombre: 'Guantes de Entrenamiento',
      descripcion: 'Guantes acolchados para levantamiento de pesas.',
      precio: 45000,
      stock: 60,
      stockMaximo: 80,
      categoria: 'Implemento',
      imagen: 'guantes.png',
      imagenAlt: 'Guantes de entrenamiento',
      guiaNutricional: '',
      oferta: false,
      nuevo: false,
      imagenCargada: true
    },
    {
      id: 3,
      nombre: 'Creatina Monohidratada 300G',
      descripcion: 'Suplemento para fuerza y rendimiento.',
      precio: 85000,
      stock: 40,
      stockMaximo: 60,
      categoria: 'Suplemento',
      imagen: 'creatina.png',
      imagenAlt: 'Creatina Monohidratada',
      guiaNutricional: 'Tomar 5g al día antes del entrenamiento.',
      oferta: false,
      nuevo: true,
      imagenCargada: true
    },
    {
      id: 4,
      nombre: 'Camiseta Deportiva Dry-Fit',
      descripcion: 'Camiseta transpirable para alta intensidad.',
      precio: 55000,
      stock: 80,
      stockMaximo: 100,
      categoria: 'Ropa deportiva',
      imagen: 'camiseta.png',
      imagenAlt: 'Camiseta deportiva',
      guiaNutricional: '',
      oferta: false,
      nuevo: false,
      imagenCargada: true
    },
    {
      id: 5,
      nombre: 'Banda Elástica Resistencia',
      descripcion: 'Set de 3 bandas con diferentes niveles.',
      precio: 38000,
      stock: 3,
      stockMaximo: 30,
      categoria: 'Implemento',
      imagen: 'banda.png',
      imagenAlt: 'Bandas elásticas',
      guiaNutricional: '',
      oferta: true,
      nuevo: false,
      imagenCargada: true
    },
    {
      id: 6,
      nombre: 'Mochila Deportiva',
      descripcion: 'Mochila impermeable con compartimento para zapatos.',
      precio: 89000,
      stock: 25,
      stockMaximo: 40,
      categoria: 'Ropa deportiva',
      imagen: 'mochila.png',
      imagenAlt: 'Mochila deportiva',
      guiaNutricional: '',
      oferta: false,
      nuevo: true,
      imagenCargada: true
    },
    {
      id: 7,
      nombre: 'Barra de Proteína',
      descripcion: 'Barra energética con 20g de proteína.',
      precio: 12000,
      stock: 150,
      stockMaximo: 200,
      categoria: 'Suplemento',
      imagen: 'barra-proteina.png',
      imagenAlt: 'Barra de proteína',
      guiaNutricional: 'Consumir antes o después del entrenamiento.',
      oferta: false,
      nuevo: false,
      imagenCargada: true
    },
    {
      id: 8,
      nombre: 'Tennis de Entrenamiento',
      descripcion: 'Calzado ligero con amortiguación avanzada.',
      precio: 210000,
      stock: 0,
      stockMaximo: 30,
      categoria: 'Ropa deportiva',
      imagen: 'tennis.png',
      imagenAlt: 'Tennis de entrenamiento',
      guiaNutricional: '',
      oferta: false,
      nuevo: false,
      imagenCargada: true
    }
  ];

  // Estado
  productosFiltrados: Producto[] = [];
  categoriaFiltro: string = '';
  terminoBusqueda: string = '';
  ordenSeleccionado: string = 'default';
  productoSeleccionado: Producto | null = null;
  carrito: CarritoItem[] = [];
  mostrarCarrito: boolean = false;
  metodoPago: string = 'nequi';
  mostrarPago: boolean = false;
  pagoExitoso: boolean = false;
  procesandoPago: boolean = false;
  numeroOrden: string = '';
  categorias = ['Suplemento', 'Implemento', 'Ropa deportiva'];

  bancosPSE: string[] = [
    'Bancolombia', 'Banco de Bogotá', 'Davivienda', 'BBVA Colombia',
    'Banco de Occidente', 'Banco Popular', 'Scotiabank Colpatria', 'Banco AV Villas'
  ];

  datosPago: DatosPago = this.datosPagoVacios();

  private datosPagoVacios(): DatosPago {
    return {
      telefono: '',
      email: '',
      numeroTarjeta: '',
      nombreTarjeta: '',
      vencimiento: '',
      cvv: '',
      tipoDocumento: 'CC',
      numeroDocumento: '',
      banco: ''
    };
  }

  // Estadísticas
  get totalProductos(): number {
    return this.productos.length;
  }

  get productosEnOferta(): number {
    return this.productos.filter(p => p.oferta).length;
  }

  get productosEnStock(): number {
    return this.productos.filter(p => p.stock > 0).length;
  }

  get calificacionPromedio(): number {
    return 4.6; // Simulado
  }

  ngOnInit() {
    this.aplicarFiltros();
  }

  // ===== FILTROS =====
  filtrar(categoria: string): void {
    this.categoriaFiltro = categoria;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let filtrados = [...this.productos];

    if (this.categoriaFiltro) {
      filtrados = filtrados.filter(p => p.categoria === this.categoriaFiltro);
    }

    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.descripcion.toLowerCase().includes(termino)
      );
    }

    switch (this.ordenSeleccionado) {
      case 'precio-asc': filtrados.sort((a, b) => a.precio - b.precio); break;
      case 'precio-desc': filtrados.sort((a, b) => b.precio - a.precio); break;
      case 'nombre': filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
      case 'stock': filtrados.sort((a, b) => b.stock - a.stock); break;
      default: break;
    }

    this.productosFiltrados = filtrados;
  }

  // ===== CARRITO =====
  agregarAlCarrito(producto: Producto): void {
    if (producto.stock <= 0) return;

    const item = this.carrito.find(c => c.producto.id === producto.id);
    if (item) {
      if (item.cantidad < producto.stock) {
        item.cantidad++;
      }
    } else {
      this.carrito.push({ producto, cantidad: 1 });
    }
  }

  eliminarDelCarrito(productoId: number): void {
    this.carrito = this.carrito.filter(c => c.producto.id !== productoId);
  }

  actualizarCantidad(productoId: number, cambio: number): void {
    const item = this.carrito.find(c => c.producto.id === productoId);
    if (item) {
      const nueva = item.cantidad + cambio;
      if (nueva <= 0) {
        this.eliminarDelCarrito(productoId);
      } else if (nueva <= item.producto.stock) {
        item.cantidad = nueva;
      }
    }
  }

  toggleCarrito(): void {
    this.mostrarCarrito = !this.mostrarCarrito;
    if (this.mostrarCarrito) {
      this.mostrarPago = false;
      this.pagoExitoso = false;
    }
  }

  // ===== PAGO =====
  iniciarPago(): void {
    if (this.carrito.length === 0) return;
    this.mostrarPago = true;
  }

  volverAlCarrito(): void {
    this.mostrarPago = false;
  }

  seleccionarMetodo(metodo: string): void {
    this.metodoPago = metodo;
  }

  // Formateo de campos en vivo
  formatearNumeroTarjeta(event: any): void {
    let valor = event.target.value.replace(/\D/g, '').substring(0, 16);
    valor = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.datosPago.numeroTarjeta = valor;
  }

  formatearVencimiento(event: any): void {
    let valor = event.target.value.replace(/\D/g, '').substring(0, 4);
    if (valor.length >= 3) {
      valor = valor.substring(0, 2) + '/' + valor.substring(2);
    }
    this.datosPago.vencimiento = valor;
  }

  formatearCvv(event: any): void {
    this.datosPago.cvv = event.target.value.replace(/\D/g, '').substring(0, 4);
  }

  formatearTelefono(event: any): void {
    this.datosPago.telefono = event.target.value.replace(/\D/g, '').substring(0, 10);
  }

  formatearDocumento(event: any): void {
    this.datosPago.numeroDocumento = event.target.value.replace(/\D/g, '').substring(0, 15);
  }

  // Validación por método de pago
  get pagoValido(): boolean {
    switch (this.metodoPago) {
      case 'nequi':
      case 'daviplata':
        return /^3\d{9}$/.test(this.datosPago.telefono);
      case 'paypal':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.datosPago.email);
      case 'tarjeta': {
        const numeroLimpio = this.datosPago.numeroTarjeta.replace(/\s/g, '');
        return numeroLimpio.length === 16 &&
               /^\d{2}\/\d{2}$/.test(this.datosPago.vencimiento) &&
               this.datosPago.cvv.length >= 3 &&
               this.datosPago.nombreTarjeta.trim().length > 3;
      }
      case 'pse':
        return this.datosPago.banco !== '' && this.datosPago.numeroDocumento.trim().length >= 6;
      case 'efecty':
        return this.datosPago.numeroDocumento.trim().length >= 6;
      default:
        return false;
    }
  }

  procesarPago(): void {
    if (!this.pagoValido || this.procesandoPago) return;
    this.procesandoPago = true;

    // Simulación de pago (aquí iría la llamada real a la pasarela)
    setTimeout(() => {
      this.numeroOrden = 'HF-' + Math.floor(100000 + Math.random() * 900000);
      this.procesandoPago = false;
      this.pagoExitoso = true;
      this.carrito = [];
      this.mostrarPago = false;
      this.datosPago = this.datosPagoVacios();
      setTimeout(() => {
        this.pagoExitoso = false;
        this.mostrarCarrito = false;
      }, 4000);
    }, 1500);
  }

  // ===== GETTERS =====
  get totalCarrito(): number {
    return this.carrito.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
  }

  get totalItemsCarrito(): number {
    return this.carrito.reduce((sum, item) => sum + item.cantidad, 0);
  }

  get carritoVacio(): boolean {
    return this.carrito.length === 0;
  }

  // ===== GUÍA NUTRICIONAL =====
  verGuia(producto: Producto): void {
    this.productoSeleccionado = producto;
  }

  cerrarGuia(): void {
    this.productoSeleccionado = null;
  }

  // ===== UTILIDADES =====
  formatearPrecio(valor: number): string {
    return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  }

  getPorcentajeStock(producto: Producto): number {
    return Math.min((producto.stock / producto.stockMaximo) * 100, 100);
  }

  getIconoCategoria(categoria: string): string {
    const iconos: { [key: string]: string } = {
      'Suplemento': '💊',
      'Implemento': '🏋️',
      'Ropa deportiva': '👕'
    };
    return iconos[categoria] || '📦';
  }

  // 🔥 IMÁGENES (URLs externas, se mantienen tal cual)
  getImagenUrl(nombreImagen: string): string {
    const imagenes: { [key: string]: string } = {
      'proteina.png': 'https://http2.mlstatic.com/D_NQ_NP_2X_701814-MLC31212027299_062019-F.jpg',
      'guantes.png': 'https://tse1.mm.bing.net/th/id/OIP.7Q6RRJL6LYe18ZRqGA5CoQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
      'creatina.png': 'https://down-br.img.susercontent.com/file/sg-11134201-7rccx-lqyuf42z2ejtd1',
      'camiseta.png': 'https://tse4.mm.bing.net/th/id/OIP.yaAm_bw4C4UvCK7wGA2TxgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
      'banda.png': 'https://m.media-amazon.com/images/I/81E+06+X0ZL._AC_SL1486_.jpg',
      'mochila.png': 'https://m.media-amazon.com/images/I/71vyCl5iKaL.jpg',
      'barra-proteina.png': 'https://tse3.mm.bing.net/th/id/OIP.um_P2RE0yszkyMAC--aDGgHaEl?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
      'tennis.png': 'https://tse2.mm.bing.net/th/id/OIP.gcwCCbC66G5mjayWFfo-8AHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
    };
    return imagenes[nombreImagen] || 'https://via.placeholder.com/400x300/f0f0f0/ccc?text=Producto';
  }
}