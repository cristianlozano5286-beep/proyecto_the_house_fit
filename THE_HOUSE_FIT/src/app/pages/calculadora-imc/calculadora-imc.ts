import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContenidoService } from '../../services/contenido';
import { GuiaNutricional } from '../../models/contenido.models';

@Component({
  selector: 'app-calculadora-imc',
  imports: [FormsModule, RouterLink],
  templateUrl: './calculadora-imc.html',
  styleUrl: './calculadora-imc.css',
})
export class CalculadoraImcComponent {
  peso: number | null = null;
  estatura: number | null = null;
  resultado: number | null = null;
  categoria: string = '';
  guia: GuiaNutricional | undefined;
  calculado = false;

  constructor(private contenidoService: ContenidoService) {}

  calcular(): void {
    if (!this.peso || !this.estatura) return;
    this.resultado = this.contenidoService.calcularIMC(this.peso, this.estatura);
    this.categoria = this.contenidoService.clasificarIMC(this.resultado);
    this.guia = this.contenidoService.guiaNutricionalPorIMC(this.categoria);
    this.calculado = true;
  }

  reiniciar(): void {
    this.peso = null;
    this.estatura = null;
    this.resultado = null;
    this.categoria = '';
    this.calculado = false;
  }
}
