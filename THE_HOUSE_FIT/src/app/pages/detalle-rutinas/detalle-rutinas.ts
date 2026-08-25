import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContenidoService } from '../../services/contenido';
import { Rutina } from '../../models/contenido.models';

interface InfoEjercicio {
  instrucciones: string;
  imagen: string;
}

// Base de conocimiento de ejercicios mapeados con sus claves
const BASE_EJERCICIOS: { claves: string[]; instrucciones: string; claveImagen: string }[] = [
  // Base de conocimiento de ejercicios mapeados con sus claves (ordenados por especificidad)
  {
    claves: ['sentadilla con salto', 'jump squat'],
    instrucciones: 'Baja en sentadilla profunda y explota hacia arriba en un salto vertical, amortiguando la caída suavemente al volver a bajar.',
    claveImagen: 'sentadilla-salto'
  },
  {
    claves: ['saltos de cuerda', 'salto de cuerda', 'saltar cuerda'],
    instrucciones: 'Mantén los codos cerca del cuerpo, gira la cuerda usando las muñecas (not los brazos) y salta ligeramente solo lo necesario para que pase la cuerda.',
    claveImagen: 'cuerda'
  },
  {
    claves: ['burpee', 'burpees'],
    instrucciones: 'Desde de pie, baja a posición de plancha, haz una flexión opcional, regresa los pies hacia las manos y salta extendiendo los brazos arriba.',
    claveImagen: 'burpee'
  },
  {
    claves: ['mountain climber', 'mountain climbers', 'escalador'],
    instrucciones: 'En posición de plancha alta, lleva las rodillas al pecho de forma alternada y rápida, manteniendo la cadera estable y el core activo.',
    claveImagen: 'mountain-climber'
  },
  {
    claves: ['jumping jack'],
    instrucciones: 'Salta abriendo piernas y brazos a la vez, y vuelve a la posición inicial juntando piernas y brazos, manteniendo un ritmo constante.',
    claveImagen: 'jumping-jack'
  },
  {
    claves: ['circuito hiit', 'hiit', 'circuito'],
    instrucciones: 'Alterna intervalos de alta intensidad con períodos cortos de descanso activo, manteniendo el ritmo cardíaco elevado y ejecutando cada movimiento con máxima energía.',
    claveImagen: 'hiit'
  },
  {
    claves: ['kettlebell', 'swing'],
    instrucciones: 'Sostén la pesa rusa con ambas manos, flexiona ligeramente las rodillas e impulsa la cadera hacia atrás para balancear el peso al frente usando la fuerza de la cadera.',
    claveImagen: 'kettlebell'
  },
  {
    claves: ['sentadilla', 'squat'],
    instrucciones: 'Pies al ancho de los hombros, baja flexionando cadera y rodillas manteniendo la espalda recta, hasta que los muslos queden paralelos al piso. Empuja con los talones para subir.',
    claveImagen: 'sentadilla'
  },
  {
    claves: ['press banca', 'press de banca', 'bench press', 'press pecho'],
    instrucciones: 'Acostado en el banco, baja la barra controlada hasta rozar el pecho y empuja hacia arriba sin bloquear los codos de golpe. Mantén los omóplatos retraídos.',
    claveImagen: 'press-banca'
  },
  {
    claves: ['peso muerto', 'deadlift'],
    instrucciones: 'Con la barra cerca de las espinillas, espalda neutra, empuja el piso con los pies mientras extiendes cadera y rodillas a la vez. No redondees la espalda baja.',
    claveImagen: 'peso-muerto'
  },
  {
    claves: ['dominada', 'pull up', 'pullup', 'chin up'],
    instrucciones: 'Cuelga de la barra con agarre firme, sube llevando el pecho hacia la barra usando la espalda, y baja de forma controlada hasta extender los brazos.',
    claveImagen: 'dominada'
  },
  {
    claves: ['plancha', 'plank'],
    instrucciones: 'Apoya antebrazos y puntas de los pies, mantén el cuerpo en línea recta sin dejar caer la cadera. Aprieta el abdomen y sostén la posición.',
    claveImagen: 'plancha'
  },
  {
    claves: ['zancada', 'zancadas', 'lunge', 'estocada'],
    instrucciones: 'Da un paso al frente y baja hasta que ambas rodillas formen 90°, sin que la rodilla delantera pase la punta del pie. Vuelve al centro y alterna de pierna.',
    claveImagen: 'zancada'
  },
  {
    claves: ['remo', 'row'],
    instrucciones: 'Con torso inclinado y espalda recta, jala el peso hacia el abdomen apretando los omóplatos, y baja controlado hasta extender los brazos.',
    claveImagen: 'remo'
  },
  {
    claves: ['curl', 'biceps'],
    instrucciones: 'Codos pegados al torso, sube el peso flexionando el antebrazo sin balancear el cuerpo, y baja de forma controlada hasta extender el brazo.',
    claveImagen: 'curl'
  },
  {
    claves: ['press militar', 'press hombro', 'overhead press', 'shoulder press'],
    instrucciones: 'De pie o sentado, empuja el peso desde los hombros hacia arriba hasta extender los brazos, sin arquear excesivamente la espalda baja.',
    claveImagen: 'press-militar'
  },
  {
    claves: ['estiramiento de isquiotibiales', 'isquiotibiales', 'estiramiento'],
    instrucciones: 'Con la espalda recta, inclínate suavemente hacia adelante desde la cadera hasta sentir el estiramiento en la parte posterior de la pierna, sin forzar.',
    claveImagen: 'isquiotibiales'
  },
  {
    claves: ['movilidad de cadera', 'cadera'],
    instrucciones: 'Realiza círculos amplios y controlados con la cadera, o abre y cierra las piernas de forma dinámica para lubricar la articulación.',
    claveImagen: 'cadera'
  },
  {
    claves: ['yoga flow', 'yoga', 'flujo'],
    instrucciones: 'Conecta la respiración con movimientos fluidos y pausados entre posturas de estiramiento y equilibrio, manteniendo la concentración.',
    claveImagen: 'yoga-flow'
  },
  {
    claves: ['trote', 'correr', 'running'],
    instrucciones: 'Mantén un ritmo constante y una postura erguida, pisando de medio pie y respirando de forma rítmica (inhalando en dos pasos, exhalando en dos).',
    claveImagen: 'trote'
  },
  {
    claves: ['bicicleta estática', 'bicicleta', 'spinning', 'estática'],
    instrucciones: 'Ajusta el asiento a la altura de tu cadera, mantén la espalda recta y pedalea a un ritmo constante aplicando fuerza tanto al presionar hacia abajo como al subir.',
    claveImagen: 'bicicleta'
  }
];
const INSTRUCCION_GENERICA = 'Realiza el ejercicio con buena técnica, controla el movimiento en ambas fases (subida y bajada) y mantén una respiración constante durante todo el recorrido.';

@Component({
  selector: 'app-detalle-rutinas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-rutinas.html',
  styleUrl: './detalle-rutinas.css',
})
export class DetalleRutinasComponent implements OnInit {
  rutina?: Rutina;

  constructor(
    private route: ActivatedRoute,
    private contenidoService: ContenidoService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      const rutinas = this.contenidoService.listarRutinas();
      this.rutina = rutinas.find((r) => r.id === id);
    }
  }

  infoEjercicio(nombre: string): InfoEjercicio {
    const nombreLower = nombre.toLowerCase();
    const encontrado = BASE_EJERCICIOS.find((e) =>
      e.claves.some((clave) => nombreLower.includes(clave))
    );

    const instrucciones = encontrado ? encontrado.instrucciones : INSTRUCCION_GENERICA;
    const claveImg = encontrado ? encontrado.claveImagen : 'default';

    return {
      instrucciones,
      imagen: this.getImagenEjercicioUrl(claveImg)
    };
  }

  // Diccionario con enlaces web directos idénticos a los de la tienda (sin repetir imágenes y con burpees reales)
  getImagenEjercicioUrl(clave: string): string {
    const imagenes: { [key: string]: string } = {
      'burpee': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4Ncj3MJxJ9QhqTvX15lqJ7xbAH4hk3xpu8Sg854R5ZA&s=10',
      'mountain-climber': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgZO5sv4QrNRlq7Kh1Tk4PJ52N5XeaYT4Py6yUi0Bykg&s=10',
      'jumping-jack': 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=400&h=300&fit=crop&auto=format',
      'kettlebell': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVe0CXwXkC175UKgJtwK_cSUwkdamPdxgba5G2-oObzQ&s=10',
      'sentadilla-salto': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmxcaXjeUnCb2EuwLDP92KFubSwPEPntzCcRSzFvdDLA&s=10',
      'sentadilla': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTg76yIGBC76zfPF1Xl4RhL7sUNuwBIjyOPPxAv_7LUrg&s=10',
      'press-banca': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqqKD3wKbkxcqpz6sUt_y7u3J8fqIHg5U3752npGnqTw&s=10',
      'peso-muerto': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuUIg_bBXM3WdJke6bRXmOysBb5FOla0xLUdAzvM8bmg&s=10',
      'dominada': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNnhCudNkKtIZ3r3EmgwSTlIVsdMUUYBq8IitNPMhKeg&s=10',
      'plancha': 'https://images.unsplash.com/photo-1674600625236-ad76734fee0d?w=400&h=300&fit=crop&auto=format',
      'zancada': 'https://images.unsplash.com/photo-1757911943497-b7c9fea801e2?w=400&h=300&fit=crop&auto=format',
      'remo': 'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=400&h=300&fit=crop&auto=format',
      'curl': 'https://images.unsplash.com/photo-1681040517791-aba993f05b2b?w=400&h=300&fit=crop&auto=format',
      'press-militar': 'https://images.unsplash.com/photo-1671316149446-4da1e921c007?w=400&h=300&fit=crop&auto=format',
      'isquiotibiales': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbxfvM_3tpC3jh2-rL5yj2Syo2wz4-zS61Vm_DNkFx8Q&s=10',
      'cadera': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUxWZCQBGfgcfttLNpgOP501zETxTevPD9oGZ7JsUa8g&s=10',
      'yoga-flow': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0QZwep8iGXMY1oxaRMKLFOB6FfrlFRyvGwxCqFmvBjw&s=10',
      'hiit': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4FyOR5Ab3FTaGaxz-iblkvCay3BHoy5IVmXbKTZNMdA&s=10',
      'trote': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS3OJEl3mbmvoD0T1ZOqnEZU7dCddU7lX8t0A2YQYmJg&s=10',
      'bicicleta': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdwfZFVlLLL557C0updCDkJJxwMcq2n9GV5Kj-sHg6Dg&s=10',
      'cuerda': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh0wjzr3dcaw2i0haOJFrQdTLCktuNihfpEvFHmDkXVg&s=10',
    };
    return imagenes[clave] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop&auto=format';
  }
}