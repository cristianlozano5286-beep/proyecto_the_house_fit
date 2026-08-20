import { Injectable } from '@angular/core';
import { Producto } from '../models/catalogo.models';
import { storage } from './storage';

const STORAGE_KEY = 'thehousefit_productos';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private datosIniciales: Producto[] = [
    {
      id: 1,
      nombre: 'Proteína Whey 2Lb',
      categoria: 'Suplemento',
      precio: 120000,
      stock: 35,
      descripcion: 'Proteína de suero para recuperación muscular.',
      guiaNutricional: 'Consumir 1 scoop (30g) después del entrenamiento junto con agua o leche.',
      imagen: '🥤',
    },
    {
      id: 2,
      nombre: 'Guantes de entrenamiento',
      categoria: 'Implemento',
      precio: 45000,
      stock: 60,
      descripcion: 'Guantes acolchados para levantamiento de pesas.',
      guiaNutricional: '',
      imagen: '🧤',
    },
    {
      id: 3,
      nombre: 'Creatina Monohidratada 300g',
      categoria: 'Suplemento',
      precio: 85000,
      stock: 40,
      descripcion: 'Suplemento para fuerza y rendimiento.',
      guiaNutricional: 'Dosis diaria de 5g, preferiblemente después de entrenar.',
      imagen: '💊',
    },
    {
      id: 4,
      nombre: 'Camiseta deportiva dry-fit',
      categoria: 'Ropa deportiva',
      precio: 55000,
      stock: 80,
      descripcion: 'Camiseta transpirable ideal para entrenamiento de alta intensidad.',
      guiaNutricional: '',
      imagen: '👕',
    },
  ];

  private productos: Producto[] = [];

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    const datos = storage.getItem(STORAGE_KEY);
    if (datos) {
      this.productos = JSON.parse(datos);
    } else {
      this.productos = [...this.datosIniciales];
      this.guardar();
    }
  }

  private guardar(): void {
    storage.setItem(STORAGE_KEY, JSON.stringify(this.productos));
  }

  listar(): Producto[] {
    return this.productos;
  }

  crear(producto: Omit<Producto, 'id'>): void {
    const nuevoId = this.productos.length ? Math.max(...this.productos.map((p) => p.id)) + 1 : 1;
    this.productos.push({ ...producto, id: nuevoId });
    this.guardar();
  }

  actualizar(id: number, cambios: Partial<Producto>): void {
    const producto = this.productos.find((p) => p.id === id);
    if (producto) {
      Object.assign(producto, cambios);
      this.guardar();
    }
  }

  eliminar(id: number): void {
    this.productos = this.productos.filter((p) => p.id !== id);
    this.guardar();
  }
}
