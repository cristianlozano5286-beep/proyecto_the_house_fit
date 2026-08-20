import { Injectable } from '@angular/core';
import { Gimnasio } from '../models/catalogo.models';
import { storage } from './storage';

const STORAGE_KEY = 'thehousefit_gimnasios';

@Injectable({ providedIn: 'root' })
export class GimnasiosService {
  private datosIniciales: Gimnasio[] = [
    {
      id: 1,
      nombre: 'PowerZone Yopal',
      direccion: 'Cra 23 # 15-40',
      barrio: 'Centro',
      telefono: '3211234567',
      horario: 'Lunes a sábado 5:00am - 9:00pm',
      descripcion: 'Gimnasio con máquinas de última generación y zona de pesas libres.',
      imagen: '💪',
      servicios: ['Musculación', 'Cardio', 'Entrenamiento funcional'],
      activo: true,
    },
    {
      id: 2,
      nombre: 'Vital Fitness Club',
      direccion: 'Calle 8 # 20-15',
      barrio: 'La Campiña',
      telefono: '3129876543',
      horario: 'Lunes a domingo 6:00am - 10:00pm',
      descripcion: 'Espacio integral con clases grupales, spinning y zona de estiramiento.',
      imagen: '🏋️',
      servicios: ['Spinning', 'Zumba', 'Yoga'],
      activo: true,
    },
    {
      id: 3,
      nombre: 'Iron Temple Gym',
      direccion: 'Av. Circunvalar # 5-22',
      barrio: 'La Esperanza',
      telefono: '3005551234',
      horario: 'Lunes a sábado 4:30am - 10:00pm',
      descripcion: 'Enfocado en levantamiento de potencia y entrenamiento avanzado.',
      imagen: '🏆',
      servicios: ['Powerlifting', 'Crossfit', 'Asesoría nutricional'],
      activo: true,
    },
  ];

  private gimnasios: Gimnasio[] = [];

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    const datos = storage.getItem(STORAGE_KEY);
    if (datos) {
      this.gimnasios = JSON.parse(datos);
    } else {
      this.gimnasios = [...this.datosIniciales];
      this.guardar();
    }
  }

  private guardar(): void {
    storage.setItem(STORAGE_KEY, JSON.stringify(this.gimnasios));
  }

  listar(): Gimnasio[] {
    return this.gimnasios;
  }

  obtener(id: number): Gimnasio | undefined {
    return this.gimnasios.find((g) => g.id === id);
  }

  crear(gimnasio: Omit<Gimnasio, 'id'>): void {
    const nuevoId = this.gimnasios.length ? Math.max(...this.gimnasios.map((g) => g.id)) + 1 : 1;
    this.gimnasios.push({ ...gimnasio, id: nuevoId });
    this.guardar();
  }

  actualizar(id: number, cambios: Partial<Gimnasio>): void {
    const gimnasio = this.gimnasios.find((g) => g.id === id);
    if (gimnasio) {
      Object.assign(gimnasio, cambios);
      this.guardar();
    }
  }

  eliminar(id: number): void {
    this.gimnasios = this.gimnasios.filter((g) => g.id !== id);
    this.guardar();
  }
}
