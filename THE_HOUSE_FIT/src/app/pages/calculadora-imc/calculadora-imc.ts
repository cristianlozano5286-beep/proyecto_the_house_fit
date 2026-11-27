import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type ObjetivoPrincipal = 'deficit' | 'mantenimiento' | 'superavit';

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
  objetivoPrincipal: ObjetivoPrincipal = 'mantenimiento';

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
  ingestaSubtitulo = 'Mantenimiento: 2450 kcal';
  proteinaDiaria = 137;
  carbosGramos = 280;
  grasasGramos = 76;
  proteinaPct = 22;
  carbosPct = 50;
  grasasPct = 28;
  aguaDiaria = '2.5';

  private planesPorObjetivo: Record<ObjetivoPrincipal, PlanNutricional> = {
    deficit: {
      titulo: 'Plan de Definición y Oxidación de Grasa',
      enfoque: 'Déficit calórico (-400 kcal)',
      desc: 'Prioriza saciedad mediante alto volumen de vegetales fibrosos, proteínas magras y carbohidratos moderados alrededor del entrenamiento para proteger tu masa muscular.',
      ejemplo:
        'Desayuno: claras con espinaca. Almuerzo: pollo a la plancha, arroz moderado y brócoli. Cena: pescado blanco con ensalada.',
      comidas: [
        { momento: 'Desayuno', detalle: 'Omelette de 3 claras y 1 huevo entero con espinaca, tomate cherry y 1 rebanada de pan integral.' },
        { momento: 'Almuerzo', detalle: 'Pechuga de pollo a la plancha (180g), porción moderada de arroz integral y ensalada abundante de brócoli.' },
        { momento: 'Cena / Post-entreno', detalle: 'Filete de pescado blanco al horno con espárragos, calabacín salteado y aguacate.' },
      ],
      enfoqueEntrenamiento: 'Fuerza 3–4 días/semana para preservar masa muscular + acondicionamiento metabólico / HIIT.',
    },
    mantenimiento: {
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
    superavit: {
      titulo: 'Plan de Superávit Limpio e Hipertrofia',
      enfoque: 'Superávit limpio (+300 kcal)',
      desc: 'Incrementa tu ingesta con superávit limpio y mayor aporte de carbohidratos complejos, proteína de alto valor biológico y grasas saludables para ganar masa muscular.',
      ejemplo:
        'Desayuno: avena con fruta y huevos. Almuerzo: pollo, arroz integral/quinoa y aguacate. Cena: salmón con pasta y batido.',
      comidas: [
        { momento: 'Desayuno', detalle: 'Avena en hojuelas con banano, mantequilla de maní natural y 3 huevos enteros.' },
        { momento: 'Almuerzo', detalle: 'Pechuga de pollo o res magra (180g), arroz integral o quinoa, aguacate Hass y vegetales.' },
        { momento: 'Cena / Post-entreno', detalle: 'Salmón o tilapia con pasta integral, aceite de oliva y batido post-entreno.' },
      ],
      enfoqueEntrenamiento: 'Hipertrofia progresiva en ejercicios compuestos (sentadilla, press, peso muerto y remos) 4–5 días/semana.',
    },
  };

  ngOnInit(): void {
    this.calcularIMC(true);
  }

  cambiarGenero(nuevoGenero: 'masculino' | 'femenino'): void {
    this.genero = nuevoGenero;
  }

  cambiarActividad(nivel: 'sedentario' | 'ligero' | 'moderado' | 'intenso'): void {
    this.nivelActividad = nivel;
  }

  cambiarObjetivo(objetivo: ObjetivoPrincipal): void {
    this.objetivoPrincipal = objetivo;
  }

  ajustarEdad(delta: number): void {
    const actual = this.edad || 25;
    this.edad = Math.max(12, Math.min(100, actual + delta));
  }

  ajustarPeso(delta: number): void {
    const actual = this.peso || 70;
    this.peso = Math.round(Math.max(30, Math.min(250, actual + delta)) * 10) / 10;
  }

  ajustarEstatura(delta: number): void {
    let actual = this.estatura || 1.7;
    if (actual > 3) {
      actual = actual / 100;
    }
    this.estatura = Math.round(Math.max(1.2, Math.min(2.3, actual + delta)) * 100) / 100;
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

    let factorProteina = 1.9;
    let pctGrasasObjetivo = 0.28;

    if (this.objetivoPrincipal === 'deficit') {
      this.caloriasObjetivo = Math.max(1200, tdee - 400);
      this.ingestaSubtitulo = '-400 kcal de déficit aplicado';
      factorProteina = 2.0;
      pctGrasasObjetivo = 0.25;
    } else if (this.objetivoPrincipal === 'superavit') {
      this.caloriasObjetivo = tdee + 300;
      this.ingestaSubtitulo = '+300 kcal de superávit limpio';
      factorProteina = 1.8;
      pctGrasasObjetivo = 0.25;
    } else {
      this.caloriasObjetivo = tdee;
      this.ingestaSubtitulo = `Mantenimiento: ${tdee} kcal`;
      factorProteina = 1.9;
      pctGrasasObjetivo = 0.28;
    }

    // Cálculo nutricional (1g P = 4 kcal, 1g C = 4 kcal, 1g G = 9 kcal)
    this.proteinaDiaria = Math.round(this.peso * factorProteina);
    const proteinaKcal = this.proteinaDiaria * 4;
    const grasasKcalObjetivo = this.caloriasObjetivo * pctGrasasObjetivo;
    this.grasasGramos = Math.round(grasasKcalObjetivo / 9);
    const grasasKcalReales = this.grasasGramos * 9;
    const carbosKcal = Math.max(0, this.caloriasObjetivo - proteinaKcal - grasasKcalReales);
    this.carbosGramos = Math.round(carbosKcal / 4);

    const totalKcal = Math.max(1, this.caloriasObjetivo);
    this.proteinaPct = Math.min(100, Math.round((proteinaKcal / totalKcal) * 100));
    this.grasasPct = Math.min(100 - this.proteinaPct, Math.round((grasasKcalReales / totalKcal) * 100));
    this.carbosPct = Math.max(0, 100 - this.proteinaPct - this.grasasPct);

    this.aguaDiaria = (this.peso * 0.038).toFixed(1);

    this.planActual = this.planesPorObjetivo[this.objetivoPrincipal];
    this.mostrarResultado = true;
  }

  reiniciar(): void {
    this.genero = 'masculino';
    this.edad = 26;
    this.peso = 72;
    this.estatura = 1.75;
    this.nivelActividad = 'moderado';
    this.objetivoPrincipal = 'mantenimiento';
    this.mensajeError = '';
    this.calcularIMC(true);
  }
}