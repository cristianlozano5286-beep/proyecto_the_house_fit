import { Injectable } from '@angular/core';
import { GuiaFisica, GuiaNutricional, Rutina } from '../models/contenido.models';

const KEY_RUTINAS = 'thehousefit_rutinas';
const KEY_GUIAS_FISICAS = 'thehousefit_guias_fisicas';
const KEY_GUIAS_NUTRICIONALES = 'thehousefit_guias_nutricionales';

@Injectable({ providedIn: 'root' })
export class ContenidoService {
  // -------- RUTINAS (HU27, HU28, HU33) --------
  private rutinasIniciales: Rutina[] = [
    {
      id: 1,
      tipoEntrenamiento: 'Fuerza',
      nombre: 'Rutina de fuerza - Tren superior',
      nivel: 'Intermedio',
      descripcion: 'Enfocada en desarrollar fuerza en pecho, espalda y brazos.',
      ejercicios: ['Press de banca 4x8', 'Remo con barra 4x8', 'Press militar 3x10', 'Curl de bíceps 3x12'],
      duracionSemanas: 6,
    },
    {
      id: 2,
      tipoEntrenamiento: 'Cardio',
      nombre: 'Rutina cardiovascular quema grasa',
      nivel: 'Principiante',
      descripcion: 'Sesiones de cardio moderado para mejorar resistencia y quemar calorías.',
      ejercicios: ['Trote 20 min', 'Bicicleta estática 15 min', 'Saltos de cuerda 3x2min'],
      duracionSemanas: 4,
    },
    {
      id: 3,
      tipoEntrenamiento: 'Funcional',
      nombre: 'Entrenamiento funcional total body',
      nivel: 'Intermedio',
      descripcion: 'Movimientos multiarticulares que trabajan todo el cuerpo.',
      ejercicios: ['Burpees 4x15', 'Kettlebell swing 4x15', 'Mountain climbers 4x20', 'Sentadilla con salto 4x12'],
      duracionSemanas: 5,
    },
    {
      id: 4,
      tipoEntrenamiento: 'Pérdida de peso',
      nombre: 'Plan de pérdida de peso acelerado',
      nivel: 'Principiante',
      descripcion: 'Combinación de cardio y fuerza para maximizar el gasto calórico.',
      ejercicios: ['Circuito HIIT 20 min', 'Sentadillas 4x15', 'Plancha 3x40seg'],
      duracionSemanas: 8,
    },
    {
      id: 5,
      tipoEntrenamiento: 'Flexibilidad',
      nombre: 'Rutina de movilidad y flexibilidad',
      nivel: 'Principiante',
      descripcion: 'Estiramientos y movilidad articular para prevenir lesiones.',
      ejercicios: ['Estiramiento de isquiotibiales', 'Movilidad de cadera', 'Yoga flow 15 min'],
      duracionSemanas: 4,
    },
  ];

  // -------- GUÍAS FÍSICAS (HU29, HU31) --------
  private guiasFisicasIniciales: GuiaFisica[] = [
    {
      id: 1,
      titulo: 'Manual de técnica de sentadilla',
      metodo: 'Fuerza',
      contenido:
        'Coloca la barra sobre los trapecios, pies al ancho de hombros, baja controlando la rodilla en línea con la punta del pie y mantén la espalda recta durante todo el recorrido.',
      fechaPublicacion: '2026-02-10',
    },
    {
      id: 2,
      titulo: 'Guía de entrenamiento en circuito',
      metodo: 'Funcional',
      contenido:
        'Alterna ejercicios de 40 segundos de trabajo por 20 segundos de descanso, completando 4 rondas por sesión para maximizar la quema calórica.',
      fechaPublicacion: '2026-03-02',
    },
  ];

  // -------- GUÍAS NUTRICIONALES (HU32, HU34) --------
  private guiasNutricionalesIniciales: GuiaNutricional[] = [
    {
      id: 1,
      categoriaIMC: 'Bajo peso',
      titulo: 'Plan de alimentación para aumento de masa',
      recomendaciones: 'Aumenta la ingesta calórica con proteínas magras, carbohidratos complejos y grasas saludables.',
      ejemploComidas: 'Desayuno: avena con maní y banano. Almuerzo: pollo, arroz y aguacate. Cena: pasta con carne y ensalada.',
    },
    {
      id: 2,
      categoriaIMC: 'Peso normal',
      titulo: 'Plan de mantenimiento saludable',
      recomendaciones: 'Mantén una dieta balanceada con proteína, vegetales y grasas saludables en cada comida.',
      ejemploComidas: 'Desayuno: huevos y fruta. Almuerzo: pescado, quinoa y vegetales. Cena: ensalada con pollo a la plancha.',
    },
    {
      id: 3,
      categoriaIMC: 'Sobrepeso',
      titulo: 'Plan de control de peso',
      recomendaciones: 'Reduce carbohidratos refinados, aumenta fibra y vegetales, controla las porciones.',
      ejemploComidas: 'Desayuno: batido de proteína con espinaca. Almuerzo: pechuga a la plancha con ensalada. Cena: sopa de vegetales.',
    },
    {
      id: 4,
      categoriaIMC: 'Obesidad',
      titulo: 'Plan de reducción calórica supervisada',
      recomendaciones: 'Déficit calórico moderado, alta ingesta de proteína y vegetales, acompañamiento profesional recomendado.',
      ejemploComidas: 'Desayuno: claras de huevo y vegetales. Almuerzo: proteína magra con ensalada abundante. Cena: caldo de vegetales con pollo.',
    },
  ];

  private rutinas: Rutina[] = [];
  private guiasFisicas: GuiaFisica[] = [];
  private guiasNutricionales: GuiaNutricional[] = [];

  constructor() {
    this.rutinas = this.cargarLista(KEY_RUTINAS, this.rutinasIniciales);
    this.guiasFisicas = this.cargarLista(KEY_GUIAS_FISICAS, this.guiasFisicasIniciales);
    this.guiasNutricionales = this.cargarLista(KEY_GUIAS_NUTRICIONALES, this.guiasNutricionalesIniciales);
  }

  private cargarLista<T>(key: string, iniciales: T[]): T[] {
    const datos = localStorage.getItem(key);
    if (datos) return JSON.parse(datos);
    localStorage.setItem(key, JSON.stringify(iniciales));
    return [...iniciales];
  }

  // ----- Rutinas -----
  listarRutinas(): Rutina[] {
    return this.rutinas;
  }
  rutinasPorTipo(tipo: string): Rutina[] {
    return this.rutinas.filter((r) => r.tipoEntrenamiento === tipo);
  }
  crearRutina(rutina: Omit<Rutina, 'id'>): void {
    const id = this.rutinas.length ? Math.max(...this.rutinas.map((r) => r.id)) + 1 : 1;
    this.rutinas.push({ ...rutina, id });
    localStorage.setItem(KEY_RUTINAS, JSON.stringify(this.rutinas));
  }
  eliminarRutina(id: number): void {
    this.rutinas = this.rutinas.filter((r) => r.id !== id);
    localStorage.setItem(KEY_RUTINAS, JSON.stringify(this.rutinas));
  }

  // ----- Guías físicas -----
  listarGuiasFisicas(): GuiaFisica[] {
    return this.guiasFisicas;
  }
  crearGuiaFisica(guia: Omit<GuiaFisica, 'id'>): void {
    const id = this.guiasFisicas.length ? Math.max(...this.guiasFisicas.map((g) => g.id)) + 1 : 1;
    this.guiasFisicas.push({ ...guia, id });
    localStorage.setItem(KEY_GUIAS_FISICAS, JSON.stringify(this.guiasFisicas));
  }
  eliminarGuiaFisica(id: number): void {
    this.guiasFisicas = this.guiasFisicas.filter((g) => g.id !== id);
    localStorage.setItem(KEY_GUIAS_FISICAS, JSON.stringify(this.guiasFisicas));
  }

  // ----- Guías nutricionales -----
  listarGuiasNutricionales(): GuiaNutricional[] {
    return this.guiasNutricionales;
  }
  guiaNutricionalPorIMC(categoria: string): GuiaNutricional | undefined {
    return this.guiasNutricionales.find((g) => g.categoriaIMC === categoria);
  }
  crearGuiaNutricional(guia: Omit<GuiaNutricional, 'id'>): void {
    const id = this.guiasNutricionales.length
      ? Math.max(...this.guiasNutricionales.map((g) => g.id)) + 1
      : 1;
    this.guiasNutricionales.push({ ...guia, id });
    localStorage.setItem(KEY_GUIAS_NUTRICIONALES, JSON.stringify(this.guiasNutricionales));
  }
  eliminarGuiaNutricional(id: number): void {
    this.guiasNutricionales = this.guiasNutricionales.filter((g) => g.id !== id);
    localStorage.setItem(KEY_GUIAS_NUTRICIONALES, JSON.stringify(this.guiasNutricionales));
  }

  // ----- Calculadora de IMC (HU30) -----
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
}
