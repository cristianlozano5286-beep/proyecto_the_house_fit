import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContenidoService } from '../../services/contenido';
import { AuthService } from '../../services/auth';
import { GuiaFisica, GuiaNutricional, Rutina } from '../../models/contenido.models';

@Component({
  selector: 'app-entrenamiento',
  imports: [FormsModule],
  templateUrl: './entrenamiento.html',
  styleUrl: './entrenamiento.css',
})
export class EntrenamientoComponent implements OnInit {
  nombreUsuario = '';

  tiposEntrenamiento: Rutina['tipoEntrenamiento'][] = ['Fuerza', 'Cardio', 'Funcional', 'Flexibilidad', 'Pérdida de peso'];
  tipoSeleccionado: Rutina['tipoEntrenamiento'] | null = null;
  rutinasFiltradas: Rutina[] = [];
  rutinaSeleccionada: Rutina | null = null;

  guiasFisicas: GuiaFisica[] = [];
  guiaSeleccionada: GuiaFisica | null = null;

  // Calculadora de IMC integrada (HU30) para sugerir el plan nutricional (HU34)
  peso: number | null = null;
  estatura: number | null = null;
  imc: number | null = null;
  categoriaIMC = '';
  guiaNutricional: GuiaNutricional | undefined;

  constructor(private contenidoService: ContenidoService, private authService: AuthService) {}

  ngOnInit(): void {
    this.nombreUsuario = this.authService.obtenerNombre();
    this.guiasFisicas = this.contenidoService.listarGuiasFisicas();
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
    if (!this.peso || !this.estatura) return;
    this.imc = this.contenidoService.calcularIMC(this.peso, this.estatura);
    this.categoriaIMC = this.contenidoService.clasificarIMC(this.imc);
    this.guiaNutricional = this.contenidoService.guiaNutricionalPorIMC(this.categoriaIMC);
  }
}
