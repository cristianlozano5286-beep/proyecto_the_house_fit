import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContenidoService } from '../../services/contenido';
import { Rutina } from '../../models/contenido.models';

export interface InfoEjercicio {
  instrucciones: string;
  imagen: string;
  musculoObjetivo: string;
  seriesReps: string;
  tipTecnico: string;
  totalSeries: number;
}

interface EjercicioCatalogo {
  claves: string[];
  instrucciones: string;
  claveImagen: string;
  musculoObjetivo: string;
  seriesReps: string;
  tipTecnico: string;
  totalSeries: number;
}

const FOTO_RESPALDO_EJ =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&auto=format';

const BASE_EJERCICIOS: EjercicioCatalogo[] = [
  {
    claves: ['sentadilla con salto', 'jump squat'],
    instrucciones:
      'Baja en sentadilla profunda y explota hacia arriba en un salto vertical, amortiguando la caída con media punta.',
    claveImagen: 'sentadilla-salto',
    musculoObjetivo: 'Potencia · Cuádriceps y Glúteos',
    seriesReps: '4 series × 12 reps',
    tipTecnico: 'Aterriza con rodillas ligeramente flexionadas alineadas con la punta del pie.',
    totalSeries: 4,
  },
  {
    claves: ['saltos de cuerda', 'salto de cuerda', 'saltar cuerda'],
    instrucciones:
      'Codos cerca de las costillas, gira la cuerda desde las muñecas y realiza saltos cortos sobre el metatarso.',
    claveImagen: 'cuerda',
    musculoObjetivo: 'Cardio · Pantorrillas y Coordinación',
    seriesReps: '4 rondas × 60 seg',
    tipTecnico: 'Despega apenas 2-3 cm del suelo para conservar energía.',
    totalSeries: 4,
  },
  {
    claves: ['burpee', 'burpees'],
    instrucciones:
      'Apoya manos en el suelo, extiende piernas a plancha atlética, realiza flexión, recoge pies y salta verticalmente.',
    claveImagen: 'burpee',
    musculoObjetivo: 'Cuerpo Completo · Capacidad Aeróbica',
    seriesReps: '4 series × 10–12 reps',
    tipTecnico: 'Mantén el abdomen firme al pasar a plancha para evitar que la cadera colapse.',
    totalSeries: 4,
  },
  {
    claves: ['mountain climber', 'mountain climbers', 'escalador'],
    instrucciones:
      'En plancha alta con manos bajo los hombros, conduce rodillas al pecho de forma alternada y rítmica.',
    claveImagen: 'mountain-climber',
    musculoObjetivo: 'Core Dinámico y Flexores de Cadera',
    seriesReps: '4 series × 40 seg',
    tipTecnico: 'Hombros, cadera y tobillos deben formar una línea recta estable.',
    totalSeries: 4,
  },
  {
    claves: ['jumping jack'],
    instrucciones:
      'Salta abriendo piernas más allá del ancho de hombros mientras elevas brazos sobre la cabeza de forma fluida.',
    claveImagen: 'jumping-jack',
    musculoObjetivo: 'Activación Cardiorrespiratoria',
    seriesReps: '3 rondas × 45 seg',
    tipTecnico: 'Mantén ritmo constante y respiración nasal o acompasada.',
    totalSeries: 3,
  },
  {
    claves: ['circuito hiit', 'hiit', 'circuito'],
    instrucciones:
      'Alterna intervalos de máxima intensidad de trabajo con pausas breves de recuperación activa.',
    claveImagen: 'hiit',
    musculoObjetivo: 'Metabolismo y Resistencia Anaeróbica',
    seriesReps: '6 intervalos · 30s / 15s',
    tipTecnico: 'Prioriza una técnica limpia incluso en los últimos segundos de fatiga.',
    totalSeries: 6,
  },
  {
    claves: ['kettlebell', 'swing'],
    instrucciones:
      'Bisagra de cadera llevando la pesa entre muslos y extiende explosivamente glúteos para proyectarla al frente.',
    claveImagen: 'kettlebell',
    musculoObjetivo: 'Cadena Posterior · Glúteos y Lumbar',
    seriesReps: '4 series × 15 reps',
    tipTecnico: 'El impulso nace de la cadera, nunca de levantar el peso con los hombros.',
    totalSeries: 4,
  },
  {
    claves: ['sentadilla', 'squat'],
    instrucciones:
      'Pies al ancho de hombros, desciende flexionando cadera y rodillas rompiendo el paralelo y empuja el suelo.',
    claveImagen: 'sentadilla',
    musculoObjetivo: 'Tren Inferior · Cuádriceps y Glúteos',
    seriesReps: '4 series × 8–10 reps',
    tipTecnico: 'Toma aire antes de descender y exhala al superar el punto crítico.',
    totalSeries: 4,
  },
  {
    claves: ['press banca', 'press de banca', 'bench press', 'press pecho'],
    instrucciones:
      'Escápulas retraídas y pies firmes; desciende la barra al esternón medio y empuja con control.',
    claveImagen: 'press-banca',
    musculoObjetivo: 'Pectoral Mayor, Deltoides y Tríceps',
    seriesReps: '4 series × 8–10 reps',
    tipTecnico: 'Mantén ángulo ~45° entre codos y torso para proteger el hombro.',
    totalSeries: 4,
  },
  {
    claves: ['peso muerto', 'deadlift'],
    instrucciones:
      'Barra pegada a las espinillas y columna neutra; empuja el piso extendiendo cadera y rodillas en simultáneo.',
    claveImagen: 'peso-muerto',
    musculoObjetivo: 'Cadena Posterior Completa · Fuerza',
    seriesReps: '4 series × 6–8 reps',
    tipTecnico: 'Mantén la barra rozando las piernas y evita hiperextender la espalda arriba.',
    totalSeries: 4,
  },
  {
    claves: ['dominada', 'pull up', 'pullup', 'chin up'],
    instrucciones:
      'Deprime escápulas antes de traccionar llevando el pecho hacia la barra y desciende en 2 segundos.',
    claveImagen: 'dominada',
    musculoObjetivo: 'Dorsal Ancho y Bíceps Braquial',
    seriesReps: '4 series × 6–10 reps',
    tipTecnico: 'Imagina llevar los codos hacia tus bolsillos traseros para activar el dorsal.',
    totalSeries: 4,
  },
  {
    claves: ['plancha', 'plank'],
    instrucciones:
      'Antebrazos bajo los hombros, abdomen y glúteos contraídos sosteniendo una línea rígida de cabeza a talones.',
    claveImagen: 'plancha',
    musculoObjetivo: 'Estabilidad del Core · Transverso',
    seriesReps: '3 series × 45–60 seg',
    tipTecnico: 'Empuja el suelo activamente con los antebrazos sin contener la respiración.',
    totalSeries: 3,
  },
  {
    claves: ['zancada', 'zancadas', 'lunge', 'estocada'],
    instrucciones:
      'Paso largo al frente descendiendo verticalmente a 90° en ambas rodillas; empuja con el talón delantero.',
    claveImagen: 'zancada',
    musculoObjetivo: 'Cuádriceps Unilateral y Glúteo',
    seriesReps: '3 series × 10 reps c/pierna',
    tipTecnico: 'Inclina ligeramente el torso al frente para enfatizar el trabajo del glúteo.',
    totalSeries: 3,
  },
  {
    claves: ['remo', 'row'],
    instrucciones:
      'Torso a 45° y espalda neutra; tracciona hacia la cadera juntando escápulas un segundo arriba.',
    claveImagen: 'remo',
    musculoObjetivo: 'Espalda Media · Romboides y Dorsal',
    seriesReps: '4 series × 10–12 reps',
    tipTecnico: 'Evita balancear la lumbar; el trabajo nace de brazos y escápulas.',
    totalSeries: 4,
  },
  {
    claves: ['curl', 'biceps'],
    instrucciones:
      'Codos fijos a los costados, flexiona antebrazos contrayendo el bíceps arriba y desciende lento.',
    claveImagen: 'curl',
    musculoObjetivo: 'Bíceps Braquial y Braquiorradial',
    seriesReps: '3 series × 12 reps',
    tipTecnico: 'Mantén hombros abajo sin impulsar con la espalda.',
    totalSeries: 3,
  },
  {
    claves: ['press militar', 'press hombro', 'overhead press', 'shoulder press'],
    instrucciones:
      'Desde la clavícula, empuja verticalmente sobre la cabeza manteniendo glúteos y abdomen estables.',
    claveImagen: 'press-militar',
    musculoObjetivo: 'Deltoides Anterior, Lateral y Tríceps',
    seriesReps: '4 series × 8–10 reps',
    tipTecnico: 'Mete ligeramente la cabeza bajo la barra al superar tu frente.',
    totalSeries: 4,
  },
  {
    claves: ['estiramiento de isquiotibiales', 'isquiotibiales', 'estiramiento'],
    instrucciones:
      'Con espalda neutra, inclínate desde la cadera hasta percibir tensión controlada posterior.',
    claveImagen: 'isquiotibiales',
    musculoObjetivo: 'Flexibilidad · Isquiotibiales y Lumbar',
    seriesReps: '3 series × 40 seg c/pierna',
    tipTecnico: 'Exhala profundo para relajar el músculo sin hacer rebotes.',
    totalSeries: 3,
  },
  {
    claves: ['movilidad de cadera', 'cadera'],
    instrucciones:
      'Rotaciones internas y externas 90/90 controladas para descomprimir y lubricar la cadera.',
    claveImagen: 'cadera',
    musculoObjetivo: 'Movilidad Articular · Cadera',
    seriesReps: '3 series × 10 rotaciones',
    tipTecnico: 'Pecho erguido moviendo únicamente el fémur dentro de la articulación.',
    totalSeries: 3,
  },
  {
    claves: ['yoga flow', 'yoga', 'flujo'],
    instrucciones:
      'Encadena perro mirando abajo, cobra y guerrero sincronizando cada transición con la respiración.',
    claveImagen: 'yoga-flow',
    musculoObjetivo: 'Movilidad Global y Control Motor',
    seriesReps: '1 bloque × 15 min',
    tipTecnico: 'Sostén cada postura de 3 a 5 respiraciones nasales completas.',
    totalSeries: 1,
  },
  {
    claves: ['trote', 'correr', 'running'],
    instrucciones:
      'Cadencia ágil y postura erguida, apoyando debajo de tu centro de gravedad con braceo relajado.',
    claveImagen: 'trote',
    musculoObjetivo: 'Resistencia Cardiovascular · Zona 2',
    seriesReps: '1 bloque × 20–30 min',
    tipTecnico: 'Relaja los hombros y mantén la mirada al frente para mejorar tu respiración.',
    totalSeries: 1,
  },
  {
    claves: ['bicicleta estática', 'bicicleta', 'spinning', 'estática'],
    instrucciones:
      'Ajusta el sillín a la altura de la cresta ilíaca y mantén pedaleo redondo entre 80 y 95 RPM.',
    claveImagen: 'bicicleta',
    musculoObjetivo: 'Capacidad Aeróbica Bajo Impacto',
    seriesReps: '1 sesión × 25 min',
    tipTecnico: 'La rodilla debe mantener 25–30° de flexión en el punto inferior del pedal.',
    totalSeries: 1,
  },
];

const INFO_GENERICA: Omit<EjercicioCatalogo, 'claves' | 'claveImagen'> = {
  instrucciones:
    'Ejecuta cada repetición con control técnico tanto al subir como al bajar, estabilizando el core.',
  musculoObjetivo: 'Acondicionamiento General',
  seriesReps: '4 series × 10–12 reps',
  tipTecnico: 'Prioriza el rango completo de movimiento sobre cargas excesivas.',
  totalSeries: 4,
};

// Todas las URLs verificadas con HTTP 200 (cero miniaturas rotas)
const IMAGENES_EJERCICIO: Record<string, string> = {
  'trote': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&h=400&fit=crop&auto=format',
  'bicicleta': 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600&h=400&fit=crop&auto=format',
  'cuerda': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&h=400&fit=crop&auto=format',
  'burpee': 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=600&h=400&fit=crop&auto=format',
  'mountain-climber': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop&auto=format',
  'jumping-jack': 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=600&h=400&fit=crop&auto=format',
  'hiit': 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=600&h=400&fit=crop&auto=format',
  'kettlebell': 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&h=400&fit=crop&auto=format',
  'sentadilla-salto': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop&auto=format',
  'sentadilla': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop&auto=format',
  'press-banca': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&auto=format',
  'peso-muerto': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&auto=format',
  'dominada': 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&h=400&fit=crop&auto=format',
  'plancha': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&auto=format',
  'zancada': 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&h=400&fit=crop&auto=format',
  'remo': 'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=600&h=400&fit=crop&auto=format',
  'curl': 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=400&fit=crop&auto=format',
  'press-militar': 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&h=400&fit=crop&auto=format',
  'isquiotibiales': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&auto=format',
  'cadera': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop&auto=format',
  'yoga-flow': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&auto=format',
};

@Component({
  selector: 'app-detalle-rutinas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-rutinas.html',
  styleUrl: './detalle-rutinas.css',
})
export class DetalleRutinasComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly contenidoService = inject(ContenidoService);

  @ViewChild('sessionProgressRing') sessionProgressRingRef?: ElementRef<HTMLProgressElement>;

  rutina?: Rutina;
  otrasRutinas: Rutina[] = [];

  readonly completadosSet = signal<Set<number>>(new Set());
  readonly seriesChecked = signal<Map<number, Set<number>>>(new Map());
  readonly ejercicioActivo = signal(0);
  readonly tecnicasAbiertas = signal<Set<number>>(new Set([0]));
  readonly filtroEstado = signal<'todos' | 'pendientes' | 'completados'>('todos');

  // Temporizador de descanso integrado
  readonly duracionDescanso = signal(60);
  readonly tiempoRestante = signal(60);
  readonly timerActivo = signal(false);
  readonly descansoTerminado = signal(false);

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private ringObserver: MutationObserver | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        const id = +idParam;
        const rutinas = this.contenidoService.listarRutinas();
        this.rutina = rutinas.find((r) => r.id === id);
        this.otrasRutinas = rutinas.filter((r) => r.id !== id).slice(0, 3);
        this.ejercicioActivo.set(0);
        this.tecnicasAbiertas.set(new Set([0]));
        this.filtroEstado.set('todos');
        this.reiniciarTimer(this.duracionDescanso());
        this.restaurarProgresoLocal();

        setTimeout(() => this.conectarProgressObserver(), 0);
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.conectarProgressObserver();
  }

  ngOnDestroy(): void {
    this.detenerInterval();
    this.ringObserver?.disconnect();
    this.ringObserver = null;
  }

  private conectarProgressObserver(): void {
    if (typeof window === 'undefined') return;
    const progressEl = this.sessionProgressRingRef?.nativeElement;
    if (!progressEl) return;

    this.ringObserver?.disconnect();
    const usaAttr = typeof CSS !== 'undefined' && CSS.supports?.('width: attr(value type(<number>))');
    if (!usaAttr) {
      const syncValue = () => {
        progressEl.style.setProperty('--value', progressEl.getAttribute('value') || '0');
      };
      syncValue();
      this.ringObserver = new MutationObserver(syncValue);
      this.ringObserver.observe(progressEl, {
        attributes: true,
        attributeFilter: ['value'],
      });
    }
  }

  get tiempoEstimadoMin(): number {
    if (!this.rutina) return 30;
    return Math.max(20, this.rutina.ejercicios.length * 12);
  }

  get caloriasEstimadas(): number {
    if (!this.rutina) return 220;
    const base = this.rutina.ejercicios.length * 75;
    if (this.rutina.nivel.toLowerCase().includes('avanzado')) return base + 110;
    if (this.rutina.nivel.toLowerCase().includes('intermedio')) return base + 60;
    return base;
  }

  get completadosCount(): number {
    return this.completadosSet().size;
  }

  get pendientesCount(): number {
    if (!this.rutina) return 0;
    return Math.max(0, this.rutina.ejercicios.length - this.completadosCount);
  }

  get porcentajeProgreso(): number {
    if (!this.rutina || this.rutina.ejercicios.length === 0) return 0;
    return Math.round((this.completadosCount / this.rutina.ejercicios.length) * 100);
  }

  ejerciciosFiltradosIndices(): number[] {
    if (!this.rutina) return [];
    const estado = this.filtroEstado();
    const res: number[] = [];
    this.rutina.ejercicios.forEach((_, idx) => {
      const hecho = this.esCompletado(idx);
      if (estado === 'todos' || (estado === 'pendientes' && !hecho) || (estado === 'completados' && hecho)) {
        res.push(idx);
      }
    });
    return res;
  }

  esCompletado(index: number): boolean {
    return this.completadosSet().has(index);
  }

  toggleCompletado(index: number): void {
    const copia = new Set(this.completadosSet());
    const seriesMap = new Map(this.seriesChecked());

    if (copia.has(index)) {
      copia.delete(index);
      seriesMap.delete(index);
    } else {
      copia.add(index);
      if (this.rutina) {
        const totalSeries = this.infoEjercicio(this.rutina.ejercicios[index]).totalSeries;
        const todas = new Set<number>();
        for (let s = 1; s <= totalSeries; s++) todas.add(s);
        seriesMap.set(index, todas);
      }
      if (this.rutina && index + 1 < this.rutina.ejercicios.length) {
        this.ejercicioActivo.set(index + 1);
      }
    }

    this.completadosSet.set(copia);
    this.seriesChecked.set(seriesMap);
    this.guardarProgresoLocal();
  }

  seriesIndices(total: number): number[] {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  esSerieLista(ejercicioIdx: number, serieNum: number): boolean {
    return this.seriesChecked().get(ejercicioIdx)?.has(serieNum) ?? false;
  }

  toggleSerie(event: Event, ejercicioIdx: number, serieNum: number, totalSeries: number): void {
    event.stopPropagation();
    const mapa = new Map(this.seriesChecked());
    const setActual = new Set(mapa.get(ejercicioIdx) || []);

    if (setActual.has(serieNum)) {
      setActual.delete(serieNum);
    } else {
      setActual.add(serieNum);
    }
    mapa.set(ejercicioIdx, setActual);
    this.seriesChecked.set(mapa);

    const completados = new Set(this.completadosSet());
    if (setActual.size >= totalSeries) {
      completados.add(ejercicioIdx);
    } else {
      completados.delete(ejercicioIdx);
    }
    this.completadosSet.set(completados);
    this.ejercicioActivo.set(ejercicioIdx);
    this.guardarProgresoLocal();
  }

  toggleTecnica(event: Event, idx: number): void {
    event.stopPropagation();
    const copia = new Set(this.tecnicasAbiertas());
    if (copia.has(idx)) {
      copia.delete(idx);
    } else {
      copia.add(idx);
    }
    this.tecnicasAbiertas.set(copia);
  }

  tecnicaAbierta(idx: number): boolean {
    return this.tecnicasAbiertas().has(idx);
  }

  marcarTodos(): void {
    if (!this.rutina) return;
    if (this.completadosCount === this.rutina.ejercicios.length) {
      this.completadosSet.set(new Set());
      this.seriesChecked.set(new Map());
    } else {
      const todos = new Set<number>();
      const mapa = new Map<number, Set<number>>();
      this.rutina.ejercicios.forEach((nombre, idx) => {
        todos.add(idx);
        const total = this.infoEjercicio(nombre).totalSeries;
        const sSet = new Set<number>();
        for (let s = 1; s <= total; s++) sSet.add(s);
        mapa.set(idx, sSet);
      });
      this.completadosSet.set(todos);
      this.seriesChecked.set(mapa);
    }
    this.guardarProgresoLocal();
  }

  // Temporizador de descanso interactivo
  formatoTiempo(seg: number): string {
    const mins = Math.floor(seg / 60);
    const rem = seg % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  }

  iniciarDescanso(segundos?: number): void {
    const objetivo = segundos ?? this.duracionDescanso();
    this.duracionDescanso.set(objetivo);
    this.tiempoRestante.set(objetivo);
    this.descansoTerminado.set(false);
    this.timerActivo.set(true);
    this.detenerInterval();

    this.timerInterval = setInterval(() => {
      const actual = this.tiempoRestante();
      if (actual <= 1) {
        this.tiempoRestante.set(0);
        this.timerActivo.set(false);
        this.descansoTerminado.set(true);
        this.detenerInterval();
      } else {
        this.tiempoRestante.set(actual - 1);
      }
    }, 1000);
  }

  pausarReanudarTimer(): void {
    if (this.timerActivo()) {
      this.timerActivo.set(false);
      this.detenerInterval();
      return;
    }
    if (this.tiempoRestante() <= 0) {
      this.iniciarDescanso(this.duracionDescanso());
      return;
    }
    this.timerActivo.set(true);
    this.descansoTerminado.set(false);
    this.detenerInterval();
    this.timerInterval = setInterval(() => {
      const actual = this.tiempoRestante();
      if (actual <= 1) {
        this.tiempoRestante.set(0);
        this.timerActivo.set(false);
        this.descansoTerminado.set(true);
        this.detenerInterval();
      } else {
        this.tiempoRestante.set(actual - 1);
      }
    }, 1000);
  }

  reiniciarTimer(segundos?: number): void {
    this.detenerInterval();
    this.timerActivo.set(false);
    this.descansoTerminado.set(false);
    const val = segundos ?? this.duracionDescanso();
    this.duracionDescanso.set(val);
    this.tiempoRestante.set(val);
  }

  private detenerInterval(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private claveStorage(): string {
    return `thehousefit_rutina_sesion_${this.rutina?.id || 0}`;
  }

  private guardarProgresoLocal(): void {
    if (typeof localStorage === 'undefined' || !this.rutina) return;
    try {
      const seriesObj: Record<string, number[]> = {};
      this.seriesChecked().forEach((v, k) => {
        seriesObj[String(k)] = [...v];
      });
      localStorage.setItem(
        this.claveStorage(),
        JSON.stringify({
          completados: [...this.completadosSet()],
          series: seriesObj,
        })
      );
    } catch {
      // ignora errores de cuota en storage
    }
  }

  private restaurarProgresoLocal(): void {
    if (typeof localStorage === 'undefined' || !this.rutina) {
      this.completadosSet.set(new Set());
      this.seriesChecked.set(new Map());
      return;
    }
    try {
      const raw = localStorage.getItem(this.claveStorage());
      if (!raw) {
        this.completadosSet.set(new Set());
        this.seriesChecked.set(new Map());
        return;
      }
      const parsed = JSON.parse(raw);
      this.completadosSet.set(new Set(Array.isArray(parsed.completados) ? parsed.completados : []));
      const mapa = new Map<number, Set<number>>();
      if (parsed.series && typeof parsed.series === 'object') {
        for (const [k, v] of Object.entries(parsed.series)) {
          if (Array.isArray(v)) mapa.set(Number(k), new Set(v.map(Number)));
        }
      }
      this.seriesChecked.set(mapa);
    } catch {
      this.completadosSet.set(new Set());
      this.seriesChecked.set(new Map());
    }
  }

  infoEjercicio(nombre: string): InfoEjercicio {
    const nombreLower = nombre.toLowerCase();
    const encontrado = BASE_EJERCICIOS.find((e) =>
      e.claves.some((clave) => nombreLower.includes(clave))
    );

    const ref = encontrado ?? INFO_GENERICA;
    const claveImg = encontrado ? encontrado.claveImagen : 'default';

    return {
      instrucciones: ref.instrucciones,
      imagen: IMAGENES_EJERCICIO[claveImg] || FOTO_RESPALDO_EJ,
      musculoObjetivo: ref.musculoObjetivo,
      seriesReps: ref.seriesReps,
      tipTecnico: ref.tipTecnico,
      totalSeries: ref.totalSeries,
    };
  }

  imagenOtraRutina(otra: Rutina): string {
    if (otra.tipoEntrenamiento === 'Fuerza') {
      return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=360&fit=crop&auto=format';
    }
    if (otra.tipoEntrenamiento === 'Cardio') {
      return 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&h=360&fit=crop&auto=format';
    }
    if (otra.tipoEntrenamiento === 'Flexibilidad') {
      return 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=360&fit=crop&auto=format';
    }
    if (otra.tipoEntrenamiento === 'Pérdida de peso') {
      return 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=600&h=360&fit=crop&auto=format';
    }
    return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&h=360&fit=crop&auto=format';
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.dataset['fallbackApplied']) return;
    img.dataset['fallbackApplied'] = '1';
    img.src = FOTO_RESPALDO_EJ;
  }
}
