import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Card {
  imagen: string;
  texto: string;
  boton: string;
  ruta: string;
}

interface SubSeccion {
  titulo: string;
  texto: string;
  imagen: string;
}

@Component({
  selector: 'app-contenido-destacado',
  imports: [RouterLink],
  templateUrl: './contenido-destacado.html',
  styleUrl: './contenido-destacado.css',
})
export class ContenidoDestacadoComponent {
  cards: Card[] = [
    {
      imagen: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&auto=format',
      texto: 'Conoce los gimnasios afiliados en Yopal',
      boton: 'Ver gimnasios',
      ruta: '/gimnasios',
    },
    {
      imagen: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&auto=format',
      texto: 'Entrena con instructores certificados',
      boton: 'Conocer instructores',
      ruta: '/gimnasios',
    },
    {
      imagen: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&auto=format',
      texto: 'Descubre rutinas de entrenamiento personalizadas',
      boton: 'Ver rutinas',
      ruta: '/imc',
    },
    {
      imagen: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop&auto=format',
      texto: 'Encuentra tu plan nutricional según tu IMC',
      boton: 'Calcular mi IMC',
      ruta: '/imc',
    },
    {
      imagen: 'https://images.unsplash.com/photo-1591291621164-2c6367723315?w=600&h=400&fit=crop&auto=format',
      texto: 'Suplementos y equipo deportivo en nuestra tienda',
      boton: 'Ir a la tienda',
      ruta: '/tienda',
    },
    {
      imagen: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&h=400&fit=crop&auto=format',
      texto: 'Lee reseñas reales de nuestra comunidad',
      boton: 'Ver blog',
      ruta: '/blog',
    },
  ];

  subsecciones: SubSeccion[] = [
    {
      titulo: 'Entrenamiento personalizado',
      texto:
        'Elige tu tipo de entrenamiento (fuerza, cardio, funcional, flexibilidad o pérdida de peso) y accede a rutinas y manuales físicos diseñados por instructores certificados.',
      imagen: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=500&fit=crop&auto=format',
    },
    {
      titulo: 'Nutrición basada en tu IMC',
      texto:
        'Calcula tu Índice de Masa Corporal y recibe una guía nutricional adaptada a tu categoría, con recomendaciones y ejemplos de comidas reales.',
      imagen: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=500&fit=crop&auto=format',
    },
    {
      titulo: 'Comunidad y reseñas reales',
      texto:
        'Compara gimnasios según las experiencias de otros usuarios, deja tu propia reseña y entérate de noticias, ofertas y promociones al instante.',
      imagen: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=500&fit=crop&auto=format',
    },
  ];
}
