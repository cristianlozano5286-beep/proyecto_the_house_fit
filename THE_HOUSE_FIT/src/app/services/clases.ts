import { Injectable } from '@angular/core';
import { ClaseDisponible, ReservaClase } from '../models/clase.models';
import { ApiService, mensajeDeError, reemplazarLista } from './api';

@Injectable({ providedIn: 'root' })
export class ClasesService {
  private clases: ClaseDisponible[] = [];
  private reservas: ReservaClase[] = [];

  constructor(private api: ApiService) {}

  async cargar(): Promise<void> {
    const lista = await this.api.obtener<ClaseDisponible[]>('/clases');
    reemplazarLista(this.clases, lista);
  }

  // las reservas del usuario que tiene la sesión iniciada
  async cargarReservas(): Promise<void> {
    const lista = await this.api.obtener<ReservaClase[]>('/reservas');
    reemplazarLista(this.reservas, lista);
  }

  limpiarReservas(): void {
    reemplazarLista(this.reservas, []);
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
    const nueva: ClaseDisponible = { ...clase, id: Date.now() };
    this.clases.push(nueva);

    this.api
      .crear<ClaseDisponible>('/clases', clase)
      .then((creada) => Object.assign(nueva, creada))
      .catch(() => {});
  }

  actualizar(id: number, cambios: Partial<ClaseDisponible>): void {
    const item = this.clases.find((c) => c.id === id);
    if (item) {
      Object.assign(item, cambios);
      this.api.actualizar('/clases/' + id, cambios).catch(() => {});
    }
  }

  eliminar(id: number): void {
    reemplazarLista(
      this.clases,
      this.clases.filter((c) => c.id !== id),
    );
    this.api.borrar('/clases/' + id).catch((error) => {
      alert(mensajeDeError(error));
      this.cargar();
    });
  }

  // El MID revisa la fecha y los cupos. Devuelve null si salió bien o el mensaje de error.
  // La fecha va en formato AAAA-MM-DD.
  async reservar(claseId: number, fecha: string, personas: number): Promise<string | null> {
    try {
      const reserva = await this.api.crear<ReservaClase>('/clases/' + claseId + '/reservar', {
        fecha,
        personas,
      });
      this.reservas.push(reserva);
      return null;
    } catch (error) {
      return mensajeDeError(error);
    }
  }

  misReservas(): ReservaClase[] {
    return this.reservas;
  }

  obtenerClase(id: number): ClaseDisponible | undefined {
    return this.clases.find((c) => c.id === id);
  }
}
