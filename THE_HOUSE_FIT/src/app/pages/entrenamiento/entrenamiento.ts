import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContenidoService } from '../../services/contenido';
import { AuthService } from '../../services/auth';
import { GuiaFisica, GuiaNutricional, Rutina } from '../../models/contenido.models';

export interface ComidaDesglosada {
  momento: string;
  icono: string;
  etiqueta: string;
  detalle: string;
}

export interface CategoriaInfo {
  color: string;
  slug: string;
  icono: string;
  resumen: string;
  calorias: string;
  proteinaFactor: number;
  enfoque: string;
  estrategiaEntrenamiento: string;
  rutinaSugerida: Rutina['tipoEntrenamiento'];
}

@Component({
  selector: 'app-entrenamiento',
  imports: [FormsModule],
  templateUrl: './entrenamiento.html',
  styleUrl: './entrenamiento.css',
})
export class EntrenamientoComponent implements OnInit {
  nombreUsuario = '';

  tiposEntrenamiento: Rutina['tipoEntrenamiento'][] = ['Fuerza', 'Cardio', 'Funcional', 'Flexibilidad', 'Pérdida de peso'];
  readonly categoriasVisuales: { tipo: Rutina['tipoEntrenamiento']; subtitulo: string; tag: string; imagen: string }[] = [
    {
      tipo: 'Fuerza',
      subtitulo: 'Hipertrofia & levantamiento',
      tag: 'Popular',
      imagen: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    },
    {
      tipo: 'Cardio',
      subtitulo: 'Resistencia & ritmo',
      tag: 'Aeróbico',
      imagen: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    },
    {
      tipo: 'Funcional',
      subtitulo: 'Potencia & core',
      tag: 'Atlético',
      imagen: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    },
    {
      tipo: 'Pérdida de peso',
      subtitulo: 'Quema metabólica HIIT',
      tag: 'Definición',
      imagen: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
    },
  ];
  tipoSeleccionado: Rutina['tipoEntrenamiento'] | null = null;
  rutinasFiltradas: Rutina[] = [];
  rutinaSeleccionada: Rutina | null = null;

  guiasFisicas: GuiaFisica[] = [];
  guiaSeleccionada: GuiaFisica | null = null;

  // Calculadora de IMC integrada (HU30) para sugerir el plan nutricional (HU34)
  peso: number | null = 55;
  estatura: number | null = 1.74;
  imc: number | null = null;
  categoriaIMC = '';
  guiaNutricional: GuiaNutricional | undefined;
  copiadoExitoso = false;

  constructor(private contenidoService: ContenidoService, private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    this.nombreUsuario = this.authService.obtenerNombre();
    await this.contenidoService.cargar();
    this.guiasFisicas = this.contenidoService.listarGuiasFisicas();

    // Si ya hay valores por defecto, inicializar el cálculo al cargar
    if (this.peso && this.estatura) {
      this.calcularImc();
    }
  }

  // HU27, HU28, HU33: el usuario elige un tipo de entrenamiento y recibe rutinas recomendadas
  seleccionarTipo(tipo: Rutina['tipoEntrenamiento']): void {
    this.tipoSeleccionado = tipo;
    this.rutinasFiltradas = this.contenidoService.rutinasPorTipo(tipo);
    this.rutinaSeleccionada = null;
  }

  verRutina(rutina: Rutina): void {
    this.rutinaSeleccionada = rutina;
  }

  // HU29, HU31: consulta del manual/guía física de ejercicios
  verGuiaFisica(guia: GuiaFisica): void {
    this.guiaSeleccionada = this.guiaSeleccionada?.id === guia.id ? null : guia;
  }

  // HU30, HU32, HU34: calcular IMC y mostrar plan de alimentación recomendado
  calcularImc(): void {
    if (!this.peso || !this.estatura || this.peso <= 0 || this.estatura <= 0) return;
    this.imc = this.contenidoService.calcularIMC(this.peso, this.estatura);
    this.categoriaIMC = this.contenidoService.clasificarIMC(this.imc);
    this.guiaNutricional = this.contenidoService.guiaNutricionalPorIMC(this.categoriaIMC);

    // Fallback enriquecido en caso de que no haya llegado de la API todavía
    if (!this.guiaNutricional) {
      this.guiaNutricional = this.obtenerGuiaFallback(this.categoriaIMC);
    }
  }

  getSlugCategoria(): string {
    switch (this.categoriaIMC) {
      case 'Bajo peso': return 'bajo';
      case 'Peso normal': return 'normal';
      case 'Sobrepeso': return 'sobrepeso';
      case 'Obesidad': return 'obesidad';
      default: return 'normal';
    }
  }

  getCategoriaInfo(): CategoriaInfo {
    switch (this.categoriaIMC) {
      case 'Bajo peso':
        return {
          color: '#38bdf8',
          slug: 'bajo',
          icono: '🧊',
          resumen: 'Tu peso actual se encuentra por debajo del rango de referencia para tu estatura. Te sugerimos un superávit calórico controlado y entrenamiento de fuerza para ganar masa muscular de forma saludable.',
          calorias: '+350 a +500 kcal / día (Superávit Limpio)',
          proteinaFactor: 2.0,
          enfoque: 'Hipertrofia Muscular & Ganancia de Fuerza',
          estrategiaEntrenamiento: 'Prioriza levantamientos multiarticulares (sentadillas, press de banca, peso muerto) con series pesadas de 8 a 12 repeticiones. Limita el cardio excesivo para favorecer el anabolismo.',
          rutinaSugerida: 'Fuerza',
        };
      case 'Peso normal':
        return {
          color: '#10b981',
          slug: 'normal',
          icono: '⚡',
          resumen: '¡Excelente composición corporal! Te encuentras en un índice saludable. Tu objetivo óptimo es la recomposición corporal, tonificación muscular y maximizar tu rendimiento físico.',
          calorias: 'Mantenimiento / Ajuste leve según meta deportiva',
          proteinaFactor: 1.8,
          enfoque: 'Rendimiento Atlético & Recomposición Corporal',
          estrategiaEntrenamiento: 'Combina entrenamiento de fuerza 3 a 4 días por semana con 1 a 2 sesiones de entrenamiento funcional o cardio para mantener tu capacidad cardiovascular.',
          rutinaSugerida: 'Funcional',
        };
      case 'Sobrepeso':
        return {
          color: '#f59e0b',
          slug: 'sobrepeso',
          icono: '🔥',
          resumen: 'Te encuentras ligeramente por encima del rango saludable. Un plan con déficit calórico moderado junto a sesiones de fuerza y cardio interválico (HIIT) acelerará la oxidación de grasa protegiendo el músculo.',
          calorias: '-300 a -450 kcal / día (Déficit Sostenible)',
          proteinaFactor: 1.9,
          enfoque: 'Fuerza + Acondicionamiento Metabólico (HIIT)',
          estrategiaEntrenamiento: 'Mantén cargas pesadas para proteger la masa magra mientras introduces circuitos funcionales y cardio HIIT para elevar el consumo de oxígeno post-ejercicio (EPOC).',
          rutinaSugerida: 'Pérdida de peso',
        };
      case 'Obesidad':
        return {
          color: '#ef4444',
          slug: 'obesidad',
          icono: '🎯',
          resumen: 'Tu IMC aconseja priorizar la recomposición de hábitos con un plan seguro y sostenible. Se recomienda actividad cardiovascular de bajo impacto para cuidar tus articulaciones y déficit estructurado.',
          calorias: '-500 a -700 kcal / día (Déficit Controlado)',
          proteinaFactor: 1.7,
          enfoque: 'Acondicionamiento Progresivo & Bajo Impacto',
          estrategiaEntrenamiento: 'Inicia con caminatas en pendiente, remo estático, elíptica o ciclismo indoor combinados con ejercicios de movilidad y máquinas guiadas. Aumenta la intensidad progresivamente.',
          rutinaSugerida: 'Cardio',
        };
      default:
        return {
          color: '#ff4500',
          slug: 'normal',
          icono: '📊',
          resumen: 'Mantén un estilo de vida activo y balanceado.',
          calorias: 'Mantenimiento',
          proteinaFactor: 1.8,
          enfoque: 'Acondicionamiento General',
          estrategiaEntrenamiento: 'Entrenamiento equilibrado de fuerza y resistencia.',
          rutinaSugerida: 'Fuerza',
        };
    }
  }

  getPorcentajeGauge(): number {
    if (!this.imc) return 0;
    // Map WHO ranges to gauge percentage:
    // Bajo peso: <18.5 (mapped to 4% - 25%)
    // Peso normal: 18.5 - 24.9 (mapped to 25% - 58%)
    // Sobrepeso: 25.0 - 29.9 (mapped to 58% - 82%)
    // Obesidad: >=30.0 (mapped to 82% - 96%)
    const val = this.imc;
    let pct = 0;
    if (val < 18.5) {
      const min = 14;
      pct = 4 + Math.max(0, ((val - min) / (18.5 - min)) * 21);
    } else if (val < 25.0) {
      pct = 25 + ((val - 18.5) / (25.0 - 18.5)) * 33;
    } else if (val < 30.0) {
      pct = 58 + ((val - 25.0) / (30.0 - 25.0)) * 24;
    } else {
      const max = 38;
      pct = 82 + Math.min(14, ((val - 30.0) / (max - 30.0)) * 14);
    }
    return Math.min(96, Math.max(4, Number(pct.toFixed(1))));
  }

  getRangoPesoIdeal(): { min: number; max: number; diferenciaTexto: string; estado: 'bajo' | 'normal' | 'sobre' } {
    if (!this.estatura || !this.peso) {
      return { min: 0, max: 0, diferenciaTexto: '', estado: 'normal' };
    }
    const h2 = this.estatura * this.estatura;
    const min = Number((18.5 * h2).toFixed(1));
    const max = Number((24.9 * h2).toFixed(1));

    let diferenciaTexto = '';
    let estado: 'bajo' | 'normal' | 'sobre' = 'normal';

    if (this.peso < min) {
      const diff = Number((min - this.peso).toFixed(1));
      diferenciaTexto = `+${diff} kg para el rango saludable`;
      estado = 'bajo';
    } else if (this.peso > max) {
      const diff = Number((this.peso - max).toFixed(1));
      diferenciaTexto = `-${diff} kg para el rango saludable`;
      estado = 'sobre';
    } else {
      diferenciaTexto = '¡Estás en tu rango saludable ideal!';
      estado = 'normal';
    }

    return { min, max, diferenciaTexto, estado };
  }

  getLitrosAgua(): number {
    if (!this.peso) return 2.0;
    return Number(((this.peso * 35) / 1000).toFixed(1));
  }

  getGramosProteina(): number {
    if (!this.peso) return 120;
    const factor = this.getCategoriaInfo().proteinaFactor;
    return Math.round(this.peso * factor);
  }

  getComidasDesglosadas(): ComidaDesglosada[] {
    const raw = this.guiaNutricional?.ejemploComidas || '';
    
    let desayuno = 'Avena con maní, banano y batido de proteína';
    let almuerzo = 'Pechuga de pollo a la plancha, arroz integral y aguacate';
    let cena = 'Pasta con carne magra, ensalada verde y aceite de oliva';
    let snack = 'Yogur griego con frutos secos o batido de fruta natural';

    if (raw) {
      const dMatch = raw.match(/Desayuno:\s*([^.]+)/i);
      const aMatch = raw.match(/Almuerzo:\s*([^.]+)/i);
      const cMatch = raw.match(/Cena:\s*([^.]+)/i);
      if (dMatch) desayuno = dMatch[1].trim();
      if (aMatch) almuerzo = aMatch[1].trim();
      if (cMatch) cena = cMatch[1].trim();
    }

    // Adapt snack according to category
    switch (this.categoriaIMC) {
      case 'Bajo peso':
        snack = 'Batido calórico con crema de cacahuate, banano y semillas';
        break;
      case 'Peso normal':
        snack = 'Yogur griego con almendras y frutos rojos';
        break;
      case 'Sobrepeso':
        snack = 'Manzana verde con nueces o apio con hummus';
        break;
      case 'Obesidad':
        snack = 'Infusión verde con semillas de calabaza o gelatina light';
        break;
    }

    return [
      {
        momento: 'Desayuno',
        icono: '🌅',
        etiqueta: 'Energía Matutina',
        detalle: desayuno,
      },
      {
        momento: 'Almuerzo',
        icono: '☀️',
        etiqueta: 'Proteína & Carbohidratos',
        detalle: almuerzo,
      },
      {
        momento: 'Merienda / Snack',
        icono: '🍏',
        etiqueta: 'Control de Ansiedad',
        detalle: snack,
      },
      {
        momento: 'Cena',
        icono: '🌙',
        etiqueta: 'Recuperación Nocturna',
        detalle: cena,
      },
    ];
  }

  irARutinasSugeridas(tipo: Rutina['tipoEntrenamiento']): void {
    this.seleccionarTipo(tipo);
    this.scrollA('seccion-rutinas');
  }

  scrollA(id: string): void {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async copiarPlan(): Promise<void> {
    if (!this.imc || !this.guiaNutricional) return;
    const rango = this.getRangoPesoIdeal();
    const comidas = this.getComidasDesglosadas()
      .map((c) => `• ${c.momento} (${c.etiqueta}): ${c.detalle}`)
      .join('\n');

    const texto = `THE HOUSE FIT - PLAN NUTRICIONAL & IMC
Diagnóstico: ${this.categoriaIMC} (IMC: ${this.imc} kg/m²)
Peso Actual: ${this.peso} kg | Estatura: ${this.estatura} m
Rango Saludable: ${rango.min} - ${rango.max} kg (${rango.diferenciaTexto})
Meta Calórica: ${this.getCategoriaInfo().calorias}
Proteína sugerida: ${this.getGramosProteina()} g/día | Agua: ${this.getLitrosAgua()} L/día

GUÍA RECOMENDADA:
${this.guiaNutricional.titulo}
${this.guiaNutricional.recomendaciones}

EJEMPLO DE COMIDAS:
${comidas}

ESTRATEGIA DE GIMNASIO:
${this.getCategoriaInfo().enfoque}
${this.getCategoriaInfo().estrategiaEntrenamiento}
`;

    try {
      await navigator.clipboard.writeText(texto);
      this.copiadoExitoso = true;
      setTimeout(() => {
        this.copiadoExitoso = false;
      }, 3000);
    } catch (_) {}
  }

  private obtenerGuiaFallback(categoria: string): GuiaNutricional {
    switch (categoria) {
      case 'Bajo peso':
        return {
          id: 991,
          categoriaIMC: 'Bajo peso',
          titulo: 'Plan de alimentación para aumento de masa',
          recomendaciones: 'Aumenta la ingesta calórica con proteínas magras, carbohidratos complejos y grasas saludables.',
          ejemploComidas: 'Desayuno: avena con maní y banano. Almuerzo: pollo, arroz y aguacate. Cena: pasta con carne y ensalada.',
        };
      case 'Peso normal':
        return {
          id: 992,
          categoriaIMC: 'Peso normal',
          titulo: 'Plan de mantenimiento y rendimiento físico',
          recomendaciones: 'Mantén una ingesta balanceada rica en micronutrientes, hidratación constante y variedad de vegetales y fuentes proteicas limpias.',
          ejemploComidas: 'Desayuno: huevos revueltos con tostadas integrales y fruta. Almuerzo: salmón o pechuga con quinoa y vegetales. Cena: tortilla de claras con verduras salteadas.',
        };
      case 'Sobrepeso':
        return {
          id: 993,
          categoriaIMC: 'Sobrepeso',
          titulo: 'Plan de déficit calórico y tonificación',
          recomendaciones: 'Reduce alimentos ultraprocesados y azúcares simples. Incrementa la ingesta de vegetales de hoja verde y proteínas magras para mayor saciedad.',
          ejemploComidas: 'Desayuno: omelette de espinacas y té verde. Almuerzo: pechuga a la plancha con brócoli y batata asada. Cena: ensalada fresca con atún al agua y semillas.',
        };
      default:
        return {
          id: 994,
          categoriaIMC: 'Obesidad',
          titulo: 'Plan de reestructuración metabólica y control',
          recomendaciones: 'Prioriza alimentos con alto volumen y baja densidad calórica. Mantén hidratación constante y distribuye tus ingestas en horarios estables.',
          ejemploComidas: 'Desayuno: yogur griego sin azúcar con chía y fresas. Almuerzo: pescado blanco al vapor con ensalada abundante. Cena: crema ligera de verduras y pechuga picada.',
        };
    }
  }
}

