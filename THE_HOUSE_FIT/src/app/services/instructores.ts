import { Injectable } from '@angular/core';
import { Instructor } from '../models/catalogo.models';
import { ApiService, reemplazarLista } from './api';

const INSTRUCTORES_INICIALES: Instructor[] = [
  {
    id: 1,
    nombre: 'Marlon Monsalve',
    correo: 'marlon.instructor@thehousefit.com',
    telefono: '3211112233',
    especialidad: 'Musculación y Fuerza',
    experiencia: 6,
    biografia: 'Entrenador certificado internacionalmente, especializado en biomecánica, hipertrofia y acondicionamiento.',
    imagen: '🏋️‍♂️',
    gimnasioId: 1,
    activo: true,
  },
  {
    id: 2,
    nombre: 'Laura Sánchez',
    correo: 'laura.instructor@thehousefit.com',
    telefono: '3004445566',
    especialidad: 'Yoga y Movilidad',
    experiencia: 5,
    biografia: 'Instructora de Vinyasa Yoga, movilidad articular y respiración para deportistas de alto rendimiento.',
    imagen: '🧘‍♀️',
    gimnasioId: 2,
    activo: true,
  },
  {
    id: 3,
    nombre: 'David Morales',
    correo: 'david.instructor@thehousefit.com',
    telefono: '3157778899',
    especialidad: 'CrossFit y HIIT',
    experiencia: 7,
    biografia: 'Coach Level 2 CrossFit. Especialista en resistencia cardiovascular y fuerza olímpica.',
    imagen: '⚡',
    gimnasioId: 3,
    activo: true,
  },
  {
    id: 4,
    nombre: 'Camila Ospina',
    correo: 'camila.instructor@thehousefit.com',
    telefono: '3109990011',
    especialidad: 'Pilates Reformer & Core',
    experiencia: 4,
    biografia: 'Enfoque en postura, fortalecimiento de la zona media y prevención de lesiones.',
    imagen: '🤸‍♀️',
    gimnasioId: 4,
    activo: true,
  }
];

@Injectable({ providedIn: 'root' })
export class InstructoresService {
  private instructores: Instructor[] = [...INSTRUCTORES_INICIALES];

  constructor(private api: ApiService) {}

  async cargar(): Promise<void> {
    try {
      const lista = await this.api.obtener<Instructor[]>('/instructores');
      if (lista && lista.length > 0) {
        reemplazarLista(this.instructores, lista);
      }
    } catch {
      // Mantiene datos iniciales
    }
  }

  listar(): Instructor[] {
    return this.instructores;
  }

  async crear(instructor: Omit<Instructor, 'id'>): Promise<Instructor> {
    const nuevo: Instructor = { ...instructor, id: Date.now() };
    this.instructores.push(nuevo);

    try {
      const creado = await this.api.crear<Instructor>('/instructores', instructor);
      if (creado && creado.id) {
        Object.assign(nuevo, creado);
      }
      return nuevo;
    } catch (error) {
      console.warn(error);
      return nuevo;
    }
  }

  async actualizar(id: number, cambios: Partial<Instructor>): Promise<void> {
    const instructor = this.instructores.find((i) => i.id === id);
    if (instructor) {
      Object.assign(instructor, cambios);
      try {
        await this.api.actualizar('/instructores/' + id, cambios);
      } catch (error) {
        console.warn(error);
      }
    }
  }

  async eliminar(id: number): Promise<void> {
    reemplazarLista(
      this.instructores,
      this.instructores.filter((i) => i.id !== id),
    );
    try {
      await this.api.borrar('/instructores/' + id);
    } catch (error) {
      console.warn(error);
    }
  }
}
