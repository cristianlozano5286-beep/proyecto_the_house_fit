import { Injectable } from '@angular/core';
import { Instructor } from '../models/catalogo.models';
import { storage } from './storage';

const STORAGE_KEY = 'thehousefit_instructores';

@Injectable({ providedIn: 'root' })
export class InstructoresService {
  private datosIniciales: Instructor[] = [
    {
      id: 1,
      nombre: 'Marlon Monsalve',
      correo: 'marlon.instructor@thehousefit.com',
      telefono: '3211112233',
      especialidad: 'Musculación y fuerza',
      experiencia: 6,
      biografia: 'Entrenador certificado especializado en hipertrofia y técnica de levantamiento.',
      imagen: '🧑\u200d🏫',
      gimnasioId: 1,
      activo: true,
    },
    {
      id: 2,
      nombre: 'Laura Sánchez',
      correo: 'laura.instructor@thehousefit.com',
      telefono: '3004445566',
      especialidad: 'Yoga y flexibilidad',
      experiencia: 4,
      biografia: 'Instructora de yoga y movilidad articular, enfoque en bienestar integral.',
      imagen: '🧘',
      gimnasioId: 2,
      activo: true,
    },
  ];

  private instructores: Instructor[] = [];

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    const datos = storage.getItem(STORAGE_KEY);
    if (datos) {
      this.instructores = JSON.parse(datos);
    } else {
      this.instructores = [...this.datosIniciales];
      this.guardar();
    }
  }

  private guardar(): void {
    storage.setItem(STORAGE_KEY, JSON.stringify(this.instructores));
  }

  listar(): Instructor[] {
    return this.instructores;
  }

  crear(instructor: Omit<Instructor, 'id'>): void {
    const nuevoId = this.instructores.length
      ? Math.max(...this.instructores.map((i) => i.id)) + 1
      : 1;
    this.instructores.push({ ...instructor, id: nuevoId });
    this.guardar();
  }

  actualizar(id: number, cambios: Partial<Instructor>): void {
    const instructor = this.instructores.find((i) => i.id === id);
    if (instructor) {
      Object.assign(instructor, cambios);
      this.guardar();
    }
  }

  eliminar(id: number): void {
    this.instructores = this.instructores.filter((i) => i.id !== id);
    this.guardar();
  }
}
