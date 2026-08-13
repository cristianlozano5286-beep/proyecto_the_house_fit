import { Injectable } from '@angular/core';
import { Gimnasio } from '../models/catalogo.models';

@Injectable({ providedIn: 'root' })
export class GimnasiosService {
  listar(): Gimnasio[] {
    return [
      {
        id: 1,
        nombre: 'Gym Alpha',
        ubicacion: 'Yopal',
        imagen: '🏋️',
        servicios: ['Cardio', 'Pesas'],
        descripcion: 'Gimnasio con equipos modernos y entrenadores certificados.',
      },
      {
        id: 2,
        nombre: 'Fit Center',
        ubicacion: 'Pitalito',
        imagen: '💪',
        servicios: ['Crossfit', 'Spinning'],
        descripcion: 'Ambiente amigable y clases grupales diarias.',
      },
      {
        id: 3,
        nombre: 'PowerHouse',
        ubicacion: 'Arauca',
        imagen: '🔥',
        servicios: ['Pesas', 'Boxeo'],
        descripcion: 'Centro de alto rendimiento para atletas.',
      },
      {
        id: 4,
        nombre: 'Strong Gym',
        ubicacion: 'Yopal',
        imagen: '🏆',
        servicios: ['Rutinas', 'Nutrición'],
        descripcion: 'Programas personalizados y seguimiento nutricional.',
      },
    ];
  }
}
