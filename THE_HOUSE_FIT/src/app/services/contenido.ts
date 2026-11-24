import { Injectable } from '@angular/core';
import { GuiaFisica, GuiaNutricional, Rutina } from '../models/contenido.models';
import { ApiService, mensajeDeError, reemplazarLista } from './api';

@Injectable({ providedIn: 'root' })
export class ContenidoService {
  private rutinas: Rutina[] = [
    {
      id: 1,
      nombre: 'Fuerza e Hipertrofia Clásica',
      tipoEntrenamiento: 'Fuerza',
      nivel: 'Intermedio',
      duracionSemanas: 6,
      descripcion: 'Enfoque en levantamientos compuestos para maximizar la masa muscular y fuerza base.',
      ejercicios: ['Press de banca', 'Sentadilla profunda', 'Peso muerto convencional', 'Press militar'],
    },
    {
      id: 2,
      nombre: 'Iniciación a la Calistenia y Fuerza',
      tipoEntrenamiento: 'Fuerza',
      nivel: 'Principiante',
      duracionSemanas: 4,
      descripcion: 'Acondicionamiento muscular con peso corporal y cargas ligeras para construir base.',
      ejercicios: ['Dominadas asistidas', 'Fondos en paralelas', 'Flexiones de pecho', 'Sentadillas aéreas'],
    },
    {
      id: 3,
      nombre: 'HIIT Quema Grasa y Resistencia',
      tipoEntrenamiento: 'Cardio',
      nivel: 'Intermedio',
      duracionSemanas: 4,
      descripcion: 'Entrenamiento interválico de alta intensidad para acelerar el metabolismo y quemar calorías.',
      ejercicios: ['Burpees con salto', 'Mountain climbers', 'Salto con cuerda', 'Sprints en cinta'],
    },
    {
      id: 4,
      nombre: 'Endurance & Cardio Aeróbico',
      tipoEntrenamiento: 'Cardio',
      nivel: 'Avanzado',
      duracionSemanas: 8,
      descripcion: 'Mejora de la capacidad pulmonar, resistencia cardiovascular y ritmo sostenido.',
      ejercicios: ['Remo estático', 'Intervalos en elíptica', 'Ciclismo indoor', 'Carrera continua'],
    },
    {
      id: 5,
      nombre: 'Cross Training Total',
      tipoEntrenamiento: 'Funcional',
      nivel: 'Avanzado',
      duracionSemanas: 6,
      descripcion: 'Circuito dinámico para mejorar agilidad, potencia muscular y coordinación corporal.',
      ejercicios: ['Kettlebell swings', 'Box jumps', 'Balón medicinal a la pared', 'Paseo del granjero'],
    },
    {
      id: 6,
      nombre: 'Movilidad Funcional y Core',
      tipoEntrenamiento: 'Funcional',
      nivel: 'Principiante',
      duracionSemanas: 4,
      descripcion: 'Fortalece la zona media y mejora los patrones de movimiento diario sin sobrecarga.',
      ejercicios: ['Planchas dinámicas', 'Bird-dog', 'Puente de glúteos', 'Giros rusos'],
    },
    {
      id: 7,
      nombre: 'Yoga Postural y Estiramiento Profundo',
      tipoEntrenamiento: 'Flexibilidad',
      nivel: 'Principiante',
      duracionSemanas: 4,
      descripcion: 'Alivia tensiones acumuladas en espalda y articulaciones mientras expandes tu rango articular.',
      ejercicios: ['Perro boca abajo', 'Cobra suave', 'Guerrero II', 'Apertura de caderas'],
    },
    {
      id: 8,
      nombre: 'Acondicionamiento Metabólico y Definición',
      tipoEntrenamiento: 'Pérdida de peso',
      nivel: 'Intermedio',
      duracionSemanas: 6,
      descripcion: 'Fusión de superseries de alta quema calórica para esculpir y tonificar el cuerpo.',
      ejercicios: ['Sentadilla con salto', 'Thrusters con mancuerna', 'Jumping jacks', 'Zancadas alternas'],
    },
  ];
  private guiasFisicas: GuiaFisica[] = [
    {
      id: 1,
      titulo: 'Biomecánica de la Sentadilla Libre y Profunda',
      metodo: 'Fuerza y Powerlifting',
      contenido: 'Mantén el pecho erguido, activa el core mediante respiración diafragmática (bracing), alinea las rodillas en dirección a la punta de los pies y desciende controlando la fase excéntrica hasta romper el paralelo.',
      fechaPublicacion: '2026-08-12',
    },
    {
      id: 2,
      titulo: 'Técnica de Retracción Escapular en Press y Dominadas',
      metodo: 'Hipertrofia y Calistenia',
      contenido: 'Antes de iniciar el empuje o tracción, junta y deprime las escápulas hacia los bolsillos traseros para proteger el manguito rotador y maximizar la activación pectoral y dorsal.',
      fechaPublicacion: '2026-09-05',
    },
  ];
  private guiasNutricionales: GuiaNutricional[] = [
    {
      id: 1,
      categoriaIMC: 'Peso normal',
      titulo: 'Plan de Recomposición Corporal y Rendimiento',
      recomendaciones: 'Prioriza entre 1.8g y 2.2g de proteína por kg de peso corporal, carbohidratos complejos alrededor del entrenamiento y al menos 3 litros de hidratación diaria.',
      ejemploComidas: 'Desayuno: Omelette de 3 huevos con avena y frutos rojos. Almuerzo: 180g de pechuga a la plancha, arroz jazmín y aguacate. Cena: Salmón o tilapia con vegetales salteados.',
    },
    {
      id: 2,
      categoriaIMC: 'Sobrepeso',
      titulo: 'Déficit Calórico Inteligente con Preservación Muscular',
      recomendaciones: 'Establece un déficit moderado de 300 a 450 kcal diarias, alta densidad de fibra vegetal para saciedad y entrenamiento de fuerza combinado con HIIT.',
      ejemploComidas: 'Desayuno: Claras de huevo con espinaca y pan integral. Almuerzo: Carne magra, ensalada verde abundante y papa al vapor. Snack: Yogur griego sin azúcar.',
    },
  ];

  constructor(private api: ApiService) {}

  async cargar(): Promise<void> {
    try {
      const rutinas = await this.api.obtener<Rutina[]>('/rutinas');
      if (rutinas && rutinas.length > 0) {
        reemplazarLista(this.rutinas, rutinas);
      }
    } catch (_) {}

    try {
      const guiasFisicas = await this.api.obtener<GuiaFisica[]>('/guias-fisicas');
      if (guiasFisicas && guiasFisicas.length > 0) {
        reemplazarLista(this.guiasFisicas, guiasFisicas);
      }
    } catch (_) {}

    try {
      const guiasNutricionales = await this.api.obtener<GuiaNutricional[]>('/guias-nutricionales');
      if (guiasNutricionales && guiasNutricionales.length > 0) {
        reemplazarLista(this.guiasNutricionales, guiasNutricionales);
      }
    } catch (_) {}
  }

  // ----- Rutinas (HU27, HU28, HU33) -----
  listarRutinas(): Rutina[] {
    return this.rutinas;
  }
  rutinasPorTipo(tipo: string): Rutina[] {
    return this.rutinas.filter((r) => r.tipoEntrenamiento === tipo);
  }
  crearRutina(rutina: Omit<Rutina, 'id'>): void {
    const nueva: Rutina = { ...rutina, id: Date.now() };
    this.rutinas.push(nueva);

    this.api
      .crear<Rutina>('/rutinas', rutina)
      .then((creada) => Object.assign(nueva, creada))
      .catch(() => {});
  }
  actualizarRutina(id: number, cambios: Partial<Rutina>): void {
    const item = this.rutinas.find((r) => r.id === id);
    if (item) {
      Object.assign(item, cambios);
      this.api.actualizar('/rutinas/' + id, cambios).catch(() => {});
    }
  }
  eliminarRutina(id: number): void {
    reemplazarLista(
      this.rutinas,
      this.rutinas.filter((r) => r.id !== id),
    );
    this.api.borrar('/rutinas/' + id).catch(() => {});
  }

  // ----- Guías físicas (HU29, HU31) -----
  listarGuiasFisicas(): GuiaFisica[] {
    return this.guiasFisicas;
  }
  crearGuiaFisica(guia: Omit<GuiaFisica, 'id'>): void {
    const nueva: GuiaFisica = { ...guia, id: Date.now() };
    this.guiasFisicas.push(nueva);

    this.api
      .crear<GuiaFisica>('/guias-fisicas', guia)
      .then((creada) => Object.assign(nueva, creada))
      .catch(() => {});
  }
  actualizarGuiaFisica(id: number, cambios: Partial<GuiaFisica>): void {
    const item = this.guiasFisicas.find((g) => g.id === id);
    if (item) {
      Object.assign(item, cambios);
      this.api.actualizar('/guias-fisicas/' + id, cambios).catch(() => {});
    }
  }
  eliminarGuiaFisica(id: number): void {
    reemplazarLista(
      this.guiasFisicas,
      this.guiasFisicas.filter((g) => g.id !== id),
    );
    this.api.borrar('/guias-fisicas/' + id).catch(() => {});
  }

  // ----- Guías nutricionales (HU32, HU34) -----
  listarGuiasNutricionales(): GuiaNutricional[] {
    return this.guiasNutricionales;
  }
  guiaNutricionalPorIMC(categoria: string): GuiaNutricional | undefined {
    return this.guiasNutricionales.find((g) => g.categoriaIMC === categoria);
  }
  crearGuiaNutricional(guia: Omit<GuiaNutricional, 'id'>): void {
    const nueva: GuiaNutricional = { ...guia, id: Date.now() };
    this.guiasNutricionales.push(nueva);

    this.api
      .crear<GuiaNutricional>('/guias-nutricionales', guia)
      .then((creada) => Object.assign(nueva, creada))
      .catch(() => {});
  }
  actualizarGuiaNutricional(id: number, cambios: Partial<GuiaNutricional>): void {
    const item = this.guiasNutricionales.find((g) => g.id === id);
    if (item) {
      Object.assign(item, cambios);
      this.api.actualizar('/guias-nutricionales/' + id, cambios).catch(() => {});
    }
  }
  eliminarGuiaNutricional(id: number): void {
    reemplazarLista(
      this.guiasNutricionales,
      this.guiasNutricionales.filter((g) => g.id !== id),
    );
    this.api.borrar('/guias-nutricionales/' + id).catch(() => {});
  }

  // ----- Calculadora de IMC (HU30) -----
  // se calcula en el navegador para que responda al instante
  // (el MID también tiene GET /imc con la misma cuenta)
  calcularIMC(pesoKg: number, estaturaM: number): number {
    if (!pesoKg || !estaturaM) return 0;
    return Number((pesoKg / (estaturaM * estaturaM)).toFixed(1));
  }

  clasificarIMC(imc: number): 'Bajo peso' | 'Peso normal' | 'Sobrepeso' | 'Obesidad' {
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidad';
  }

  private avisarError(error: unknown): void {
    alert(mensajeDeError(error));
    this.cargar();
  }
}
