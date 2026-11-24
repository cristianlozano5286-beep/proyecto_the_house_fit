import { Injectable } from '@angular/core';
import { Producto } from '../models/catalogo.models';
import { ApiService, mensajeDeError, reemplazarLista } from './api';

const PRODUCTOS_INICIALES: Producto[] = [
  {
    id: 1,
    nombre: 'Proteína Whey Isolate Gold 2Lb',
    categoria: 'Suplemento',
    precio: 165000,
    stock: 28,
    descripcion: 'Proteína aislada de suero de rápida absorción con 25g de proteína y 5.5g de BCAA por servicio.',
    guiaNutricional: 'Mezclar 1 scoop en 250ml de agua fría o leche vegetal inmediatamente después de entrenar.',
    imagen: '🥤',
  },
  {
    id: 2,
    nombre: 'Creatina Monohidratada Micronizada 300g',
    categoria: 'Suplemento',
    precio: 95000,
    stock: 42,
    descripcion: 'Creatina 100% pura grado farmacéutico para incrementar fuerza explosiva, potencia y recuperación.',
    guiaNutricional: 'Consumir 5g diarios todos los días con agua o jugo, preferiblemente cerca del entrenamiento.',
    imagen: '⚡',
  },
  {
    id: 3,
    nombre: 'Cinturón Lumbar de Levantamiento en Cuero',
    categoria: 'Implemento',
    precio: 120000,
    stock: 14,
    descripcion: 'Cinturón ergonómico de doble hebilla para sentadilla pesada, peso muerto y press militar.',
    guiaNutricional: 'Ajustar firme en la zona media durante series de alta carga superior al 80% de tu 1RM.',
    imagen: '🏋️',
  },
  {
    id: 4,
    nombre: 'Camiseta Dry-Fit Compresión The House Fit',
    categoria: 'Ropa deportiva',
    precio: 68000,
    stock: 35,
    descripcion: 'Tejido transpirable de secado ultrarrápido con costuras planas anti-fricción para alto rendimiento.',
    guiaNutricional: 'Lavar en frío y secar a la sombra para conservar la elasticidad técnica de la fibra.',
    imagen: '👕',
  },
];

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private productos: Producto[] = [...PRODUCTOS_INICIALES];

  constructor(private api: ApiService) {}

  async cargar(): Promise<void> {
    try {
      const lista = await this.api.obtener<Producto[]>('/productos');
      if (lista && lista.length > 0) {
        reemplazarLista(this.productos, lista);
      }
    } catch {
      // Mantiene los productos iniciales si no responde el backend
    }
  }

  listar(): Producto[] {
    return this.productos;
  }

  crear(producto: Omit<Producto, 'id'>): void {
    const nuevo: Producto = { ...producto, id: Date.now() };
    this.productos.push(nuevo);

    this.api
      .crear<Producto>('/productos', producto)
      .then((creado) => Object.assign(nuevo, creado))
      .catch((error) => console.warn(error));
  }

  actualizar(id: number, cambios: Partial<Producto>): void {
    const producto = this.productos.find((p) => p.id === id);
    if (producto) {
      Object.assign(producto, cambios);
      this.api.actualizar('/productos/' + id, cambios).catch((error) => console.warn(error));
    }
  }

  eliminar(id: number): void {
    reemplazarLista(
      this.productos,
      this.productos.filter((p) => p.id !== id),
    );
    this.api.borrar('/productos/' + id).catch((error) => console.warn(error));
  }
}
