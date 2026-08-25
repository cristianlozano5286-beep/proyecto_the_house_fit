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
  beneficios: string[];
  oferta?: boolean;
  nuevo?: boolean;
  imagenCargada?: boolean;
}

interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

interface DatosPago {
  nombre: string;
  email: string;
  telefono: string;
  numeroTarjeta: string;
  nombreTarjeta: string;
  vencimiento: string;
  cvv: string;
  tipoDocumento: string;
  numeroDocumento: string;
  banco: string;
}

interface OpcionOrden {
  valor: string;
  etiqueta: string;
  icono: string;
}

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tienda.html',
  styleUrls: ['./tienda.css'],
})
export class TiendaComponent implements OnInit {
  // 📦 TODA la información de cada producto vive aquí, incluidos sus beneficios.
  // El HTML solo la muestra, nunca la define.
  productos: Producto[] = [
    {
      id: 1,
      nombre: 'Proteína Whey 2LB',
      descripcion: 'Proteínas de suero de alta calidad para recuperación muscular. Ideal para después del entrenamiento.',
      precio: 120000,
      stock: 35,
      stockMaximo: 50,
      categoria: 'Suplemento',
      imagen: 'proteina.png',
      imagenAlt: 'Proteína Whey 2LB',
      guiaNutricional: 'Tomar 1 porción (30g) después del entrenamiento. Mezclar con 250ml de agua o leche.',
      beneficios: [
        'Recuperación muscular acelerada',
        '30g de proteína por porción',
        'Ideal para después del entrenamiento',
        'Mejora el rendimiento deportivo',
        'Fácil digestión'
      ],
      oferta: true,
      nuevo: false,
      imagenCargada: true
    },
    {
      id: 2,
      nombre: 'Guantes de Entrenamiento',
      descripcion: 'Guantes acolchados para levantamiento de pesas. Protegen tus manos y mejoran el agarre.',
      precio: 45000,
      stock: 60,
      stockMaximo: 80,
      categoria: 'Implemento',
      imagen: 'guantes.png',
      imagenAlt: 'Guantes de entrenamiento',
      guiaNutricional: '',
      beneficios: [
        'Protección para tus manos',
        'Mejor agarre en pesas',
        'Material resistente y duradero',
        'Ajuste cómodo y seguro',
        'Previene ampollas y callos'
      ],
      oferta: false,
      nuevo: false,
      imagenCargada: true
    },
    {
      id: 3,
      nombre: 'Creatina Monohidratada 300G',
      descripcion: 'Suplemento para fuerza y rendimiento. Aumenta la energía y recuperación muscular.',
      precio: 85000,
      stock: 40,
      stockMaximo: 60,
      categoria: 'Suplemento',
      imagen: 'creatina.png',
      imagenAlt: 'Creatina Monohidratada',
      guiaNutricional: 'Tomar 5g al día, preferiblemente antes del entrenamiento. Mantener hidratación adecuada.',
      beneficios: [
        'Aumenta fuerza y potencia',
        'Mejora el rendimiento en ejercicios de alta intensidad',
        'Acelera la recuperación muscular',
        'Aumenta la masa muscular',
        '100% monohidratada de alta calidad'
      ],
      oferta: false,
      nuevo: true,
      imagenCargada: true
    },
    {
      id: 4,
      nombre: 'Camiseta Deportiva Dry-Fit',
      descripcion: 'Camiseta transpirable ideal para entrenamiento de alta intensidad. Tecnología Dry-Fit.',
      precio: 55000,
      stock: 80,
      stockMaximo: 100,
      categoria: 'Ropa deportiva',
      imagen: 'camiseta.png',
      imagenAlt: 'Camiseta deportiva',
      guiaNutricional: '',
      beneficios: [
        'Tecnología Dry-Fit que elimina el sudor',
        'Transpirable y ligera',
        'Ideal para alta intensidad',
        'Secado rápido',
        'Tejido elástico que se adapta al cuerpo'
      ],
      oferta: false,
      nuevo: false,
      imagenCargada: true
    },
    {
      id: 5,
      nombre: 'Banda Elástica Resistencia',
      descripcion: 'Set de 3 bandas con diferentes niveles de resistencia (Ligera, Media, Fuerte).',
      precio: 38000,
      stock: 3,
      stockMaximo: 30,
      categoria: 'Implemento',
      imagen: 'banda.png',
      imagenAlt: 'Bandas elásticas',
      guiaNutricional: '',
      beneficios: [
        '3 niveles de resistencia diferentes',
        'Ideal para entrenamiento en casa',
        'Versátil para múltiples ejercicios',
        'Material duradero y resistente',
        'Portátil y fácil de guardar'
      ],
      oferta: true,
      nuevo: false,
      imagenCargada: true
    },
    {
      id: 6,
      nombre: 'Mochila Deportiva',
      descripcion: 'Mochila impermeable con compartimento para zapatos y bolsillo para laptop.',
      precio: 89000,
      stock: 25,
      stockMaximo: 40,
      categoria: 'Ropa deportiva',
      imagen: 'mochila.png',
      imagenAlt: 'Mochila deportiva',
      guiaNutricional: '',
      beneficios: [
        'Impermeable y resistente',
        'Compartimento para zapatos',
        'Bolsillo para laptop',
        'Diseño ergonómico y cómodo',
        'Ideal para deporte y viajes'
      ],
      oferta: false,
      nuevo: true,
      imagenCargada: true
    },
    {
      id: 7,
      nombre: 'Barra de Proteína',
      descripcion: 'Barra energética con 20g de proteína por porción. Perfecta para antes o después del entrenamiento.',
      precio: 12000,
      stock: 150,
      stockMaximo: 200,
      categoria: 'Suplemento',
      imagen: 'barra-proteina.png',
      imagenAlt: 'Barra de proteína',
      guiaNutricional: 'Consumir antes o después del entrenamiento. Perfecta para recuperación muscular y energía rápida.',
      beneficios: [
        '20g de proteína por porción',
        'Energía rápida y sostenida',
        'Perfecta para antes o después del entrenamiento',
        'Baja en azúcar',
        'Sabor delicioso'
      ],
      oferta: false,
      nuevo: false,
      imagenCargada: true
    },
    {
      id: 8,
      nombre: 'Tennis de Entrenamiento',
      descripcion: 'Calzado ligero con amortiguación avanzada y suela antideslizante para máximo rendimiento.',
      precio: 210000,
      stock: 0,
      stockMaximo: 30,
      categoria: 'Ropa deportiva',
      imagen: 'tennis.png',
      imagenAlt: 'Tennis de entrenamiento',
      guiaNutricional: '',
      beneficios: [
        'Amortiguación avanzada',
        'Suela antideslizante',
        'Ligero y cómodo',
        'Ideal para entrenamiento intenso',
        'Diseño duradero y resistente'
      ],
      oferta: false,
      nuevo: false,
      imagenCargada: true
    }
  ];

  productosFiltrados: Producto[] = [];
  categoriaFiltro: string = '';
  terminoBusqueda: string = '';
  ordenSeleccionado: string = 'default';
  productoSeleccionado: Producto | null = null;
  productoDetalle: Producto | null = null;
  carrito: CarritoItem[] = [];
  mostrarCarrito: boolean = false;
  metodoPago: string = 'nequi';
  procesandoPago: boolean = false;
  pagoExitoso: boolean = false;
  numeroOrden: string = '';

  // Notificación
  notificacionVisible: boolean = false;
  notificacionProducto: string = '';
  private timeoutNotificacion: any = null;

  // Dropdown "Ordenar por" — sus opciones también viven en el TS
  mostrarOrdenDropdown: boolean = false;
  opcionesOrden: OpcionOrden[] = [
    { valor: 'default', etiqueta: 'Ordenar por', icono: '📋' },
    { valor: 'precio-asc', etiqueta: 'Menor precio', icono: '⬇️' },
    { valor: 'precio-desc', etiqueta: 'Mayor precio', icono: '⬆️' },
    { valor: 'nombre', etiqueta: 'Nombre A-Z', icono: '🔤' }
  ];

  // Datos de pago
  datosPago: DatosPago = {
    nombre: '',
    email: '',
    telefono: '',
    numeroTarjeta: '',
    nombreTarjeta: '',
    vencimiento: '',
    cvv: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    banco: ''
  };

  categorias = ['Suplemento', 'Implemento', 'Ropa deportiva'];

  get totalProductos(): number {
    return this.productos.length;
  }

  get productosEnOferta(): number {
    return this.productos.filter(p => p.oferta).length;
  }

  get productosEnStock(): number {
    return this.productos.filter(p => p.stock > 0).length;
  }

  get etiquetaOrdenActual(): string {
    const opcion = this.opcionesOrden.find(o => o.valor === this.ordenSeleccionado);
    return opcion ? opcion.etiqueta : 'Ordenar por';
  }

  get iconoOrdenActual(): string {
    const opcion = this.opcionesOrden.find(o => o.valor === this.ordenSeleccionado);
    return opcion ? opcion.icono : '📋';
  }

  ngOnInit() {
    this.aplicarFiltros();
  }

  // ===== DROPDOWN ORDENAR =====
  toggleOrdenDropdown(): void {
    this.mostrarOrdenDropdown = !this.mostrarOrdenDropdown;
  }

  cerrarOrdenDropdown(): void {
    this.mostrarOrdenDropdown = false;
  }

  seleccionarOrden(valor: string): void {
    this.ordenSeleccionado = valor;
    this.mostrarOrdenDropdown = false;
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

    this.mostrarNotificacion(producto.nombre);
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
      this.pagoExitoso = false;
    }
  }

  // ===== NOTIFICACIÓN =====
  mostrarNotificacion(nombre: string): void {
    this.notificacionProducto = nombre;
    this.notificacionVisible = true;

    if (this.timeoutNotificacion) {
      clearTimeout(this.timeoutNotificacion);
    }

    this.timeoutNotificacion = setTimeout(() => {
      this.notificacionVisible = false;
    }, 3000);
  }

  cerrarNotificacion(): void {
    this.notificacionVisible = false;
    if (this.timeoutNotificacion) {
      clearTimeout(this.timeoutNotificacion);
    }
  }

  // ===== DETALLE PRODUCTO =====
  verDetalle(producto: Producto): void {
    this.productoDetalle = producto;
  }

  cerrarDetalle(): void {
    this.productoDetalle = null;
  }

  // ===== PAGO =====
  get pagoValido(): boolean {
    const d = this.datosPago;

    switch (this.metodoPago) {
      case 'nequi':
      case 'daviplata':
        return /^3\d{9}$/.test(d.telefono) && d.nombre.trim().length > 3;
      case 'paypal':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) && d.nombre.trim().length > 3;
      case 'tarjeta':
        return d.numeroTarjeta.replace(/\s/g, '').length === 16 &&
               d.nombreTarjeta.trim().length > 3 &&
               /^\d{2}\/\d{2}$/.test(d.vencimiento) &&
               d.cvv.length >= 3 &&
               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email);
      case 'pse':
        return d.banco !== '' && d.numeroDocumento.trim().length >= 6 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email);
      case 'efecty':
        return d.numeroDocumento.trim().length >= 6 && d.nombre.trim().length > 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email);
      default:
        return false;
    }
  }

  procesarPago(): void {
    if (this.carrito.length === 0 || this.procesandoPago || !this.pagoValido) return;

    this.procesandoPago = true;

    setTimeout(() => {
      this.numeroOrden = 'HF-' + Math.floor(100000 + Math.random() * 900000);
      this.procesandoPago = false;
      this.pagoExitoso = true;
      this.carrito = [];

      this.datosPago = {
        nombre: '',
        email: '',
        telefono: '',
        numeroTarjeta: '',
        nombreTarjeta: '',
        vencimiento: '',
        cvv: '',
        tipoDocumento: 'CC',
        numeroDocumento: '',
        banco: ''
      };

      setTimeout(() => {
        this.pagoExitoso = false;
        this.mostrarCarrito = false;
      }, 4000);
    }, 2000);
  }

  // ===== GUÍA =====
  verGuia(producto: Producto): void {
    this.productoSeleccionado = producto;
  }

  cerrarGuia(): void {
    this.productoSeleccionado = null;
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

  // ===== UTILIDADES =====
  formatearPrecio(valor: number): string {
    return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  }

  getPorcentajeStock(producto: Producto): number {
    return Math.min((producto.stock / producto.stockMaximo) * 100, 100);
  }

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