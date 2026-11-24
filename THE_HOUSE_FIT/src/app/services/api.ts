import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { URL_MID } from '../config/api';

/*
  Todas las llamadas al MID pasan por aquí.
  El token se agrega solo, lo hace el interceptor (interceptors/token.ts).
*/
@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  obtener<T>(ruta: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(URL_MID + ruta));
  }

  crear<T>(ruta: string, cuerpo: unknown): Promise<T> {
    return firstValueFrom(this.http.post<T>(URL_MID + ruta, cuerpo));
  }

  actualizar<T>(ruta: string, cuerpo: unknown): Promise<T> {
    return firstValueFrom(this.http.put<T>(URL_MID + ruta, cuerpo));
  }

  borrar(ruta: string): Promise<unknown> {
    return firstValueFrom(this.http.delete(URL_MID + ruta));
  }
}

// saca el mensaje que manda el MID ({ ok: false, mensaje: "..." })
export function mensajeDeError(error: any): string {
  if (error?.status === 0) {
    return 'No se pudo conectar con el servidor. Revisa que el MID esté encendido.';
  }
  return error?.error?.mensaje ?? 'Ocurrió un error. Intenta de nuevo.';
}

// cambia el contenido de una lista sin crear otra,
// así las páginas que ya la tienen guardada ven los datos nuevos
export function reemplazarLista<T>(lista: T[], nueva: T[]): void {
  lista.splice(0, lista.length, ...nueva);
}
