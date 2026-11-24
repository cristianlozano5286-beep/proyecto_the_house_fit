import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface ComidaEjemplo {
  momento: string;
  detalle: string;
}

interface PlanNutricional {
  titulo: string;
  enfoque: string;
  desc: string;
  ejemplo: string;
  comidas: ComidaEjemplo[];
  enfoqueEntrenamiento: string;
}

@Component({
  selector: 'app-imc-calculadora',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './calculadora-imc.html',
  styleUrl: './calculadora-imc.css',
})
export class CalculadoraImcComponent implements OnInit {
  genero: 'masculino' | 'femenino' = 'masculino';
  edad: number | null = 26;
  peso: number | null = 72;
  estatura: number | null = 1.75;
  nivelActividad: 'sedentario' | 'ligero' | 'moderado' | 'intenso' = 'moderado';

  imc: number | null = null;
  categoria = '';
  categoriaKey: 'underweight' | 'normal' | 'overweight' | 'obese' = 'normal';
  posicionMarcador = 0;
  mostrarResultado = false;
  planActual: PlanNutricional | null = null;
  mensajeError = '';

  // Métricas metabólicas y antropométricas adicionales
  pesoMinSaludable = 56.7;
  pesoMaxSaludable = 76.3;
  diferenciaPesoTexto = 'Dentro de tu rango óptimo';
  caloriasMantenimiento = 2450;
  caloriasObjetivo = 2450;
  proteinaDiaria = 144;
  aguaDiaria = '2.5';

  private planes: Record<string, PlanNutricional> = {
    underweight: {
      titulo: 'Plan de Superávit Limpio e Hipertrofia',
      enfoque: 'Superávit calórico (+350 kcal)',
      desc: 'Incrementa tu ingesta calórica con alimentos densos en micronutrientes, priorizando proteína de alto valor biológico y carbohidratos complejos alrededor del entrenamiento.',
      ejemplo:
        'Desayuno: avena con fruta y frutos secos. Almuerzo: pollo, arroz y aguacate. Cena: pescado con pasta integral.',
      comidas: [
        { momento: 'Desayuno', detalle: 'Avena en hojuelas con banano, mantequilla de maní y 3 huevos enteros.' },
        { momento: 'Almuerzo', detalle: 'Pechuga de pollo (180g), arroz jazmín, aguacate Hass y ensalada fresca.' },
        { momento: 'Cena / Post-entreno', detalle: 'Salmón o tilapia con pasta integral, aceite de oliva y batido de proteína.' },
      ],
      enfoqueEntrenamiento: 'Fuerza progresiva en ejercicios compuestos (sentadilla, press, peso muerto) 4 días/semana.',
    },
    normal: {
      titulo: 'Plan de Recomposición y Rendimiento Atlético',
      enfoque: 'Mantenimiento normocalórico',
      desc: 'Mantén una nutrición balanceada con distribución óptima de macronutrientes para sostener energía alta, mejorar definición muscular y optimizar la recuperación.',
      ejemplo:
        'Desayuno: huevos y fruta. Almuerzo: pescado, quinoa y vegetales. Cena: ensalada con proteína y aceite de oliva.',
      comidas: [
        { momento: 'Desayuno', detalle: 'Omelette de 3 huevos con espinaca, pan de masa madre y porción de frutos rojos.' },
        { momento: 'Almuerzo', detalle: 'Lomo de res magro o pescado blanco, quinoa o papa al horno y vegetales salteados.' },
        { momento: 'Cena / Post-entreno', detalle: 'Pechuga a la plancha con ensalada mediterránea, aguacate y semillas.' },
      ],
      enfoqueEntrenamiento: 'Combinación de hipertrofia + acondicionamiento metabólico 4 a 5 días/semana.',
    },
    overweight: {
      titulo: 'Plan de Definición y Oxidación de Grasa',
      enfoque: 'Déficit ligero controlado (-400 kcal)',
      desc: 'Prioriza saciedad mediante proteína magra y vegetales fibrosos, reduciendo azúcares simples y manteniendo el entrenamiento de fuerza para proteger tu masa muscular.',
      ejemplo:
        'Desayuno: yogur natural con fruta. Almuerzo: pechuga a la plancha con ensalada. Cena: sopa de vegetales.',
      comidas: [
        { momento: 'Desayuno', detalle: 'Yogur griego sin azúcar con semillas de chía, fresas y 2 huevos cocidos.' },
        { momento: 'Almuerzo', detalle: 'Pechuga de pollo a la plancha (180g), porción moderada de arroz integral y brócoli.' },
        { momento: 'Cena / Post-entreno', detalle: 'Filete de pescado blanco al horno con espárragos y ensalada verde.' },
      ],
      enfoqueEntrenamiento: 'Entrenamiento de fuerza 3-4 días/semana + sesiones de cardio LISS/HIIT post-sesión.',
    },
    obese: {
      titulo: 'Plan Metabólico de Control y Reducción Progresiva',
      enfoque: 'Déficit estructurado (-500 kcal)',
      desc: 'Enfoque progresivo de déficit calórico sostenible, control glucémico y actividad física de bajo impacto articular acompañado de trabajo de fuerza guiado.',
      ejemplo:
        'Desayuno: claras de huevo y espinaca. Almuerzo: pescado al vapor y vegetales. Cena: caldo ligero con proteína magra.',
      comidas: [
        { momento: 'Desayuno', detalle: 'Revuelto de claras y 1 huevo entero con espinaca, tomate cherry y té verde.' },
        { momento: 'Almuerzo', detalle: 'Pescado o pavo al vapor con mix de vegetales al grill y porción de legumbres.' },
        { momento: 'Cena / Post-entreno', detalle: 'Crema natural de vegetales con pollo desmechado y aguacate.' },
      ],
      enfoqueEntrenamiento: 'Fuerza guiada en máquinas y poleas + caminatas en inclinación y movilidad diaria.',
    },
  };

  ngOnInit(): void {
    this.calcularIMC(true);
  }

  cambiarGenero(nuevoGenero: 'masculino' | 'femenino'): void {
    this.genero = nuevoGenero;
    this.calcularIMC(true);
  }

  cambiarActividad(nivel: 'sedentario' | 'ligero' | 'moderado' | 'intenso'): void {
    this.nivelActividad = nivel;
    this.calcularIMC(true);
  }

  ajustarEdad(delta: number): void {
    const actual = this.edad || 25;
    this.edad = Math.max(12, Math.min(100, actual + delta));
    this.calcularIMC(true);
  }

  ajustarPeso(delta: number): void {
    const actual = this.peso || 70;
    this.peso = Math.round(Math.max(30, Math.min(250, actual + delta)) * 10) / 10;
    this.calcularIMC(true);
  }

  ajustarEstatura(delta: number): void {
    let actual = this.estatura || 1.7;
    if (actual > 3) {
      actual = actual / 100;
    }
    this.estatura = Math.round(Math.max(1.2, Math.min(2.3, actual + delta)) * 100) / 100;
    this.calcularIMC(true);
  }

  calcularIMC(silencioso = false): void {
    this.mensajeError = '';

    if (!this.peso || !this.estatura || this.estatura <= 0) {
      if (!silencioso) {
        this.mensajeError = 'Ingresa tu peso en kilogramos y tu estatura para calcular el diagnóstico.';
      }
      return;
    }

    let estaturaMetros = Number(this.estatura);
    if (estaturaMetros > 3) {
      estaturaMetros = estaturaMetros / 100;
    }

    if (this.peso < 20 || this.peso > 400) {
      if (!silencioso) {
        this.mensajeError = 'Ingresa un peso válido en kilogramos (entre 20 kg y 400 kg).';
      }
      return;
    }
    if (estaturaMetros < 0.5 || estaturaMetros > 2.5) {
      if (!silencioso) {
        this.mensajeError = 'Ingresa una estatura válida en metros (ej. 1.72) o centímetros (ej. 172).';
      }
      return;
    }

    const imc = this.peso / (estaturaMetros * estaturaMetros);
    this.imc = imc;

    if (imc < 18.5) {
      this.categoria = 'Bajo peso';
      this.categoriaKey = 'underweight';
    } else if (imc < 25) {
      this.categoria = 'Peso saludable';
      this.categoriaKey = 'normal';
    } else if (imc < 30) {
      this.categoria = 'Sobrepeso';
      this.categoriaKey = 'overweight';
    } else {
      this.categoria = 'Obesidad';
      this.categoriaKey = 'obese';
    }

    // Posición del indicador en la escala (rango visual 14 a 36)
    const min = 14;
    const max = 36;
    let pos = ((imc - min) / (max - min)) * 100;
    pos = Math.max(3, Math.min(97, pos));
    this.posicionMarcador = pos;

    // Rango de peso saludable según estatura (IMC 18.5 a 24.9)
    this.pesoMinSaludable = Math.round(18.5 * estaturaMetros * estaturaMetros * 10) / 10;
    this.pesoMaxSaludable = Math.round(24.9 * estaturaMetros * estaturaMetros * 10) / 10;

    if (this.peso < this.pesoMinSaludable) {
      const falta = (this.pesoMinSaludable - this.peso).toFixed(1);
      this.diferenciaPesoTexto = `+${falta} kg para entrar a tu rango óptimo`;
    } else if (this.peso > this.pesoMaxSaludable) {
      const sobra = (this.peso - this.pesoMaxSaludable).toFixed(1);
      this.diferenciaPesoTexto = `-${sobra} kg para entrar a tu rango óptimo`;
    } else {
      this.diferenciaPesoTexto = 'Estás exactamente dentro de tu peso ideal';
    }

    // Cálculo metabólico Mifflin-St Jeor
    const edadCalc = this.edad && this.edad > 0 ? this.edad : 26;
    const alturaCm = estaturaMetros * 100;
    const tmbBase = 10 * this.peso + 6.25 * alturaCm - 5 * edadCalc;
    const tmb = this.genero === 'masculino' ? tmbBase + 5 : tmbBase - 161;

    const factores: Record<string, number> = {
      sedentario: 1.2,
      ligero: 1.375,
      moderado: 1.55,
      intenso: 1.725,
    };
    const tdee = Math.round(tmb * (factores[this.nivelActividad] || 1.55));
    this.caloriasMantenimiento = tdee;

    if (this.categoriaKey === 'underweight') {
      this.caloriasObjetivo = tdee + 350;
    } else if (this.categoriaKey === 'overweight') {
      this.caloriasObjetivo = Math.max(1350, tdee - 400);
    } else if (this.categoriaKey === 'obese') {
      this.caloriasObjetivo = Math.max(1400, tdee - 500);
    } else {
      this.caloriasObjetivo = tdee;
    }

    this.proteinaDiaria = Math.round(this.peso * 1.9);
    this.aguaDiaria = (this.peso * 0.038).toFixed(1);

    this.planActual = this.planes[this.categoriaKey];
    this.mostrarResultado = true;
  }

  reiniciar(): void {
    this.genero = 'masculino';
    this.edad = 26;
    this.peso = 72;
    this.estatura = 1.75;
    this.nivelActividad = 'moderado';
    this.mensajeError = '';
    this.calcularIMC(true);
  }
}