import { Injectable } from '@angular/core';
import { ClaseDisponible, ReservaClase } from '../models/clase.models';
import { storage } from './storage';

const KEY_CLASES = 'thehousefit_clases';
const KEY_RESERVAS = 'thehousefit_reservas_clases';

@Injectable({ providedIn: 'root' })
export class ClasesService {
  private clasesIniciales: ClaseDisponible[] = [
    { id: 1, gimnasioId: 1, tipoClase: 'CrossFit', instructor: 'Marlon Monsalve', hora: '6:00 am', cupos: 12, duracion: '50 min', precio: 25000 },
    { id: 2, gimnasioId: 1, tipoClase: 'Funcional', instructor: 'Marlon Monsalve', hora: '5:30 pm', cupos: 15, duracion: '45 min', precio: 22000 },
    { id: 3, gimnasioId: 2, tipoClase: 'Yoga', instructor: 'Laura Sánchez', hora: '7:00 am', cupos: 10, duracion: '60 min', precio: 20000 },
    { id: 4, gimnasioId: 2, tipoClase: 'Spinning', instructor: 'Laura Sánchez', hora: '6:30 pm', cupos: 18, duracion: '45 min', precio: 18000 },
    { id: 5, gimnasioId: 3, tipoClase: 'Boxeo', instructor: 'Marlon Monsalve', hora: '8:00 am', cupos: 8, duracion: '55 min', precio: 28000 },
    { id: 6, gimnasioId: 3, tipoClase: 'Pilates', instructor: 'Laura Sánchez', hora: '4:00 pm', cupos: 12, duracion: '50 min', precio: 24000 },
  ];

  private clases: ClaseDisponible[] = [];
  private reservas: ReservaClase[] = [];

  constructor() {
    this.clases = this.cargar(KEY_CLASES, this.clasesIniciales);
    const datosReservas = storage.getItem(KEY_RESERVAS);
    this.reservas = datosReservas ? JSON.parse(datosReservas) : [];
  }

  private cargar<T>(key: string, iniciales: T[]): T[] {
    const datos = storage.getItem(key);
    if (datos) return JSON.parse(datos);
    storage.setItem(key, JSON.stringify(iniciales));
    return [...iniciales];
  }

  listar(): ClaseDisponible[] {
    return this.clases;
  }

  // Búsqueda por gimnasio y/o tipo de clase (equivalente a "buscarVuelos")
  buscar(gimnasioId: number | null, tipoClase: string | null): ClaseDisponible[] {
    return this.clases.filter((c) => {
      const coincideGimnasio = gimnasioId == null || c.gimnasioId === gimnasioId;
      const coincideTipo = !tipoClase || c.tipoClase === tipoClase;
      return coincideGimnasio && coincideTipo;
    });
  }

  crear(clase: Omit<ClaseDisponible, 'id'>): void {
    const id = this.clases.length ? Math.max(...this.clases.map((c) => c.id)) + 1 : 1;
    this.clases.push({ ...clase, id });
    storage.setItem(KEY_CLASES, JSON.stringify(this.clases));
  }

  eliminar(id: number): void {
    this.clases = this.clases.filter((c) => c.id !== id);
    storage.setItem(KEY_CLASES, JSON.stringify(this.clases));
  }

  reservar(usuario: string, claseId: number, fecha: string, personas: number): ReservaClase {
    const id = this.reservas.length ? Math.max(...this.reservas.map((r) => r.id)) + 1 : 1;
    const reserva: ReservaClase = { id, usuario, claseId, fecha, personas, estado: 'Confirmada' };
    this.reservas.push(reserva);
    storage.setItem(KEY_RESERVAS, JSON.stringify(this.reservas));
    return reserva;
  }

  misReservas(usuario: string): ReservaClase[] {
    return this.reservas.filter((r) => r.usuario === usuario);
  }

  obtenerClase(id: number): ClaseDisponible | undefined {
    return this.clases.find((c) => c.id === id);
  }
}
