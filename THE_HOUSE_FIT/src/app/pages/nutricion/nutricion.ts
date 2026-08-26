import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ImcNutricionService } from '../../services/nutricion';

@Component({
  selector: 'app-nutricion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './nutricion.html',
  styleUrls: ['./nutricion.css']
})
export class NutricionComponent implements OnInit {
  // Estado para alternar entre formulario y resultado
  dietaGenerada: boolean = false;

  // Datos personales del formulario
  nombre: string = '';
  genero: string = '';
  actividad: string = '';
  objetivo: string = '';

  // Variables para almacenar los datos que vienen de la calculadora de IMC
  pesoImc: number | null = null;
  estaturaImc: number | null = null;
  clasificacionImc: string = '';

  // Inyectamos el servicio de IMC en el constructor
  constructor(private imcService: ImcNutricionService) {}

  // Se ejecuta al cargar la página para capturar los datos del IMC automáticamente
  ngOnInit() {
    const datos = this.imcService.obtenerDatos();
    if (datos) {
      this.pesoImc = datos.peso;
      this.estaturaImc = datos.estatura;
      this.clasificacionImc = datos.clasificacion;
    }
  }

  // Información de salud
  salud = {
    diabetes: false,
    colesterol: false,
    tiroides: false,
    hipertension: false,
    cardiaca: false,
    otra: false
  };

  // Alergias e intolerancias
  alergias = {
    gluten: false,
    lacteos: false,
    frutosSecos: false,
    huevo: false,
    mariscos: false,
    soja: false,
    mani: false,
    pescado: false
  };

  // Preferencias alimentarias
  dieta: string = '';
  evitar: string = '';

  // Método al enviar el formulario
  generarDieta() {
    if (!this.nombre || !this.genero) {
      alert('Por favor completa al menos tu nombre y tu género.');
      return;
    }

    // Aquí ya dispones de this.pesoImc y this.estaturaImc para utilizarlos 
    // en la lógica de cálculo de calorías o en el envío de datos de tu dieta.
    
    // Activamos la vista de la tarjeta de dieta generada
    this.dietaGenerada = true;
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube la pantalla suavemente
  }

  // Método para volver a editar el formulario
  reiniciarFormulario() {
    this.dietaGenerada = false;
  }
}