import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PlanNutricional {
  titulo: string;
  desc: string;
  ejemplo: string;
}

@Component({
  selector: 'app-imc-calculadora',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculadora-imc.html',
  styleUrl: './calculadora-imc.css'
})
export class  CalculadoraImcComponent {

  genero: 'masculino' | 'femenino' = 'femenino';
  edad: number | null = null;
  peso: number | null = null;
  estatura: number | null = null;

  imc: number | null = null;
  categoria = '';
  posicionMarcador = 0;
  mostrarResultado = false;
  planActual: PlanNutricional | null = null;

  private planes: Record<string, PlanNutricional> = {
    underweight: {
      titulo: 'Plan de aumento de peso saludable',
      desc: 'Incrementa tu ingesta calórica con alimentos densos en nutrientes, priorizando proteína y carbohidratos complejos.',
      ejemplo: 'Desayuno: avena con fruta y frutos secos. Almuerzo: pollo, arroz y aguacate. Cena: pescado con pasta integral.'
    },
    normal: {
      titulo: 'Plan de mantenimiento saludable',
      desc: 'Mantén una dieta balanceada con proteína, vegetales y grasas saludables en cada comida.',
      ejemplo: 'Desayuno: huevos y fruta. Almuerzo: pescado, quinoa y vegetales. Cena: ensalada con proteína y aceite de oliva.'
    },
    overweight: {
      titulo: 'Plan de control de peso',
      desc: 'Reduce porciones y azúcares añadidos, aumentando el consumo de fibra y actividad física regular.',
      ejemplo: 'Desayuno: yogur natural con fruta. Almuerzo: pechuga a la plancha con ensalada. Cena: sopa de vegetales.'
    },
    obese: {
      titulo: 'Plan de pérdida de peso supervisado',
      desc: 'Consulta con un profesional de la salud para diseñar un plan seguro de déficit calórico y actividad progresiva.',
      ejemplo: 'Desayuno: claras de huevo y espinaca. Almuerzo: pescado al vapor y vegetales. Cena: caldo ligero con proteína magra.'
    }
  };

  calcularIMC(): void {
    if (!this.peso || !this.estatura || this.estatura <= 0) {
      alert('Por favor ingresa un peso y estatura válidos.');
      return;
    }

    // Si el usuario escribió la estatura en centímetros (ej. 170) en vez de
    // metros (1.70), la convertimos automáticamente.
    let estaturaMetros = this.estatura;
    if (estaturaMetros > 3) {
      estaturaMetros = estaturaMetros / 100;
    }

    if (this.peso < 20 || this.peso > 400) {
      alert('Ingresa un peso válido en kilogramos (entre 20 y 400).');
      return;
    }
    if (estaturaMetros < 0.5 || estaturaMetros > 2.5) {
      alert('Ingresa una estatura válida en metros (ej. 1.70) o centímetros (ej. 170).');
      return;
    }

    const imc = this.peso / (estaturaMetros * estaturaMetros);
    this.imc = imc;

    let key: string;
    if (imc < 18.5) { this.categoria = 'Bajo peso'; key = 'underweight'; }
    else if (imc < 25) { this.categoria = 'Peso normal'; key = 'normal'; }
    else if (imc < 30) { this.categoria = 'Sobrepeso'; key = 'overweight'; }
    else { this.categoria = 'Obesidad'; key = 'obese'; }

    // Posicionar el marcador en la barra (rango visual 10 a 40)
    const min = 10, max = 40;
    let pos = ((imc - min) / (max - min)) * 100;
    pos = Math.max(0, Math.min(100, pos));
    this.posicionMarcador = pos;

    this.planActual = this.planes[key];
    this.mostrarResultado = true;
  }

  reiniciar(): void {
    this.edad = null;
    this.peso = null;
    this.estatura = null;
    this.imc = null;
    this.categoria = '';
    this.posicionMarcador = 0;
    this.planActual = null;
    this.mostrarResultado = false;
  }
}