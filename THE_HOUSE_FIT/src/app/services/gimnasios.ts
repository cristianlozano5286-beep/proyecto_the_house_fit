import { Injectable } from '@angular/core';
import { Gimnasio } from '../models/catalogo.models';

const STORAGE_KEY = 'thehousefit_gimnasios';
const STORAGE_KEY_FAVORITOS = 'thehousefit_favoritos';

@Injectable({ providedIn: 'root' })
export class GimnasiosService {
  private datosIniciales: Gimnasio[] = [
    {
      id: 1,
      nombre: 'PowerZone Yopal',
      direccion: 'Cra 23 # 15-40',
      barrio: 'Centro',
      ciudad: 'Yopal',
      pais: 'Colombia',
      telefono: '3211234567',
      horario: 'Lunes a sábado 5:00am - 9:00pm',
      descripcion: 'Gimnasio con máquinas de última generación y zona de pesas libres.',
      imagen: '💪',
      fotos: [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
      ],
      precio: 120000,
      moneda: 'COP',
      servicios: ['Musculación', 'Cardio', 'Entrenamiento funcional'],
      activo: true,
      lat: 5.3378,
      lng: -72.3959,
    },
    {
      id: 2,
      nombre: 'Vital Fitness Club',
      direccion: 'Calle 8 # 20-15',
      barrio: 'La Campiña',
      ciudad: 'Yopal',
      pais: 'Colombia',
      telefono: '3129876543',
      horario: 'Lunes a domingo 6:00am - 10:00pm',
      descripcion: 'Espacio integral con clases grupales, spinning y zona de estiramiento.',
      imagen: '🏋️',
      fotos: [
        'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80',
      ],
      precio: 95000,
      moneda: 'COP',
      servicios: ['Spinning', 'Zumba', 'Yoga'],
      activo: true,
      lat: 5.335,
      lng: -72.4,
    },
    {
      id: 3,
      nombre: 'Iron Temple Gym',
      direccion: 'Av. Circunvalar # 5-22',
      barrio: 'La Esperanza',
      ciudad: 'Yopal',
      pais: 'Colombia',
      telefono: '3005551234',
      horario: 'Lunes a sábado 4:30am - 10:00pm',
      descripcion: 'Enfocado en levantamiento de potencia y entrenamiento avanzado.',
      imagen: '🏆',
      fotos: [
        'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1583500178690-f7fd8b7e6c33?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=900&q=80',
      ],
      precio: 140000,
      moneda: 'COP',
      servicios: ['Powerlifting', 'Crossfit', 'Asesoría nutricional'],
      activo: true,
      lat: 5.34,
      lng: -72.39,
    },
    {
      id: 4,
      nombre: 'Madrid Strength Studio',
      direccion: 'Calle Gran Vía 45',
      barrio: 'Centro',
      ciudad: 'Madrid',
      pais: 'España',
      telefono: '+34 611 234 567',
      horario: 'Lunes a domingo 6:00am - 11:00pm',
      descripcion: 'Estudio boutique especializado en fuerza funcional y coaching personalizado.',
      imagen: '🏙️',
      fotos: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80',
      ],
      precio: 45,
      moneda: 'EUR',
      servicios: ['Entrenamiento funcional', 'Crossfit', 'Nutrición'],
      activo: true,
      lat: 40.4200,
      lng: -3.7038,
    },
    {
      id: 5,
      nombre: 'Miami Beach Fitness',
      direccion: '210 Ocean Drive',
      barrio: 'South Beach',
      ciudad: 'Miami',
      pais: 'Estados Unidos',
      telefono: '+1 305 555 0192',
      horario: 'Lunes a domingo 5:00am - 12:00am',
      descripcion: 'Gimnasio frente al mar con clases al aire libre y vista a la playa.',
      imagen: '🌴',
      fotos: [
        'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&w=900&q=80',
      ],
      precio: 60,
      moneda: 'USD',
      servicios: ['Cardio', 'Yoga', 'Entrenamiento funcional'],
      activo: true,
      lat: 25.7815,
      lng: -80.1300,
    },
    {
      id: 6,
      nombre: 'Bogotá Iron Club',
      direccion: 'Cra 15 # 93-40',
      barrio: 'Chicó',
      ciudad: 'Bogotá',
      pais: 'Colombia',
      telefono: '3187654321',
      horario: 'Lunes a sábado 5:00am - 10:00pm',
      descripcion: 'Gimnasio premium en el norte de Bogotá con zona de crossfit y sauna.',
      imagen: '🏢',
      fotos: [
        'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80',
      ],
      precio: 180000,
      moneda: 'COP',
      servicios: ['Crossfit', 'Musculación', 'Spinning'],
      activo: true,
      lat: 4.6767,
      lng: -74.0483,
    },
  ];

  private gimnasios: Gimnasio[] = [];
  private favoritos: number[] = [];

  constructor() {
    this.cargar();
    this.cargarFavoritos();
  }

  private cargar(): void {
    const datos = localStorage.getItem(STORAGE_KEY);
    if (datos) {
      const parseados: Gimnasio[] = JSON.parse(datos);
      // Migración: si los datos guardados son de una versión anterior (sin ciudad/fotos/precio),
      // se reemplazan por el nuevo set inicial para evitar errores en el catálogo estilo Airbnb.
      const desactualizado = parseados.some((g) => !g.ciudad || !g.fotos || g.precio === undefined);
      this.gimnasios = desactualizado ? [...this.datosIniciales] : parseados;
      if (desactualizado) this.guardar();
    } else {
      this.gimnasios = [...this.datosIniciales];
      this.guardar();
    }
  }

  private guardar(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.gimnasios));
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

  // ----- Favoritos (estilo "guardados" de Airbnb) -----
  private cargarFavoritos(): void {
    const datos = localStorage.getItem(STORAGE_KEY_FAVORITOS);
    this.favoritos = datos ? JSON.parse(datos) : [];
  }

  private guardarFavoritos(): void {
    localStorage.setItem(STORAGE_KEY_FAVORITOS, JSON.stringify(this.favoritos));
  }

  esFavorito(id: number): boolean {
    return this.favoritos.includes(id);
  }

  alternarFavorito(id: number): void {
    if (this.esFavorito(id)) {
      this.favoritos = this.favoritos.filter((f) => f !== id);
    } else {
      this.favoritos = [...this.favoritos, id];
    }
    this.guardarFavoritos();
  }

  listarFavoritos(): Gimnasio[] {
    return this.gimnasios.filter((g) => this.favoritos.includes(g.id));
  }

  // Listas únicas para poblar el buscador tipo "Dónde" de Airbnb
  ciudadesDisponibles(): string[] {
    return Array.from(new Set(this.gimnasios.map((g) => g.ciudad)));
  }
}
