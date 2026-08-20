export interface Rutina {
  id: number;
  tipoEntrenamiento: string;
  nombre: string;
  nivel: string;
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
  categoriaIMC: string;
  titulo: string;
  recomendaciones: string;
  ejemploComidas: string;
}