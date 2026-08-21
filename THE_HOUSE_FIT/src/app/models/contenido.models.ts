// Modelos relacionados con el Módulo 4 (Rutinas y Nutrición)

export interface Rutina {
  id: number;
  tipoEntrenamiento: 'Fuerza' | 'Cardio' | 'Funcional' | 'Flexibilidad' | 'Pérdida de peso';
  nombre: string;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
  descripcion: string;
  ejercicios: string[];
  duracionSemanas: number;
}

export interface GuiaFisica {
  id: number;
  titulo: string;
  metodo: string;
  contenido: string;
  fechaPublicacion: string;
}

export interface GuiaNutricional {
  id: number;
  categoriaIMC: 'Bajo peso' | 'Peso normal' | 'Sobrepeso' | 'Obesidad';
  titulo: string;
  recomendaciones: string;
  ejemploComidas: string;
}
