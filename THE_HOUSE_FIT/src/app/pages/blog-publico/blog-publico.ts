import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Comentario {
  id: number;
  nombre: string;
  texto: string;
  fecha: string;
}

interface Noticia {
  id: number;
  categoria: string;
  icono: string;
  titulo: string;
  resumen: string;
  contenido: string[]; // párrafos completos del artículo
  autor: string;
  fuente: string;
  fecha: string;
  comentarios: Comentario[];
}

interface Resena {
  id: number;
  gimnasio: string;
  autor: string;
  avatar: string;
  calificacion: number; // 1 a 5
  texto: string;
  fecha: string;
}   

@Component({
  selector: 'app-blog-publico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blog-publico.html',
  styleUrls: ['./blog-publico.css'],
})
export class BlogPublicoComponent {
  // ===== NOTICIAS — toda la información vive acá, el HTML solo la muestra =====
  noticias: Noticia[] = [
    {
      id: 1,
      categoria: 'NOVEDAD',
      icono: '🏋️',
      titulo: 'Llegaron nuevas máquinas de cardio',
      resumen: 'Renovamos nuestra zona de cardio con equipos de última generación.',
      contenido: [
        'Vital Fitness Club acaba de renovar por completo su zona de cardio. Las nuevas máquinas incluyen caminadoras con pantalla táctil, bicicletas de spinning inteligentes y elípticas con sensores de ritmo cardíaco integrados.',
        'La inversión hace parte de un plan de modernización que busca ofrecer una experiencia de entrenamiento más completa y conectada. Cada equipo permite sincronizar tu progreso con la app del gimnasio para llevar un registro detallado de calorías, distancia y frecuencia cardíaca.',
        'Los nuevos equipos ya están disponibles para todos los miembros sin costo adicional. La zona de cardio ampliada también cuenta con más espacio entre máquinas y mejor ventilación.',
        '"Queríamos que nuestros usuarios entrenen con la misma tecnología que encontrarían en gimnasios de ciudades grandes", comentó el gerente del club durante la inauguración de la nueva zona.'
      ],
      autor: 'Equipo Vital Fitness',
      fuente: 'Vital Fitness Club',
      fecha: '2026-07-28',
      comentarios: [
        { id: 1, nombre: 'Camila R.', texto: '¡Excelente noticia! Ya las probé y se sienten mucho mejor que las anteriores.', fecha: '2026-07-29' },
        { id: 2, nombre: 'Andrés M.', texto: '¿Van a ampliar también la zona de pesas libres?', fecha: '2026-07-30' }
      ]
    },
    {
      id: 2,
      categoria: 'PROMOCIÓN',
      icono: '🎉',
      titulo: 'Nueva promoción de matrícula',
      resumen: 'Este mes matricúlate con 20% de descuento en tu plan mensual.',
      contenido: [
        'PowerZone Yopal lanza su promoción de mitad de año: todos los nuevos miembros que se matriculen durante este mes obtendrán un 20% de descuento en su primer plan mensual, sin importar la modalidad elegida.',
        'La promoción aplica tanto para planes individuales como para el plan familiar, e incluye una evaluación física gratuita con uno de los entrenadores certificados del gimnasio.',
        'Además, quienes se matriculen esta semana recibirán una sesión de entrenamiento personalizada de cortesía para conocer las instalaciones y recibir recomendaciones iniciales sobre su rutina.',
        'Los cupos de la promoción son limitados. Puedes matricularte directamente en recepción o a través de la app, seleccionando el plan de tu preferencia.'
      ],
      autor: 'Equipo PowerZone',
      fuente: 'PowerZone Yopal',
      fecha: '2026-08-01',
      comentarios: [
        { id: 1, nombre: 'Laura G.', texto: '¿La promo aplica también para renovación de matrícula?', fecha: '2026-08-01' }
      ]
    },
    {
      id: 3,
      categoria: 'EVENTO',
      icono: '🏆',
      titulo: 'Torneo interno de powerlifting',
      resumen: 'Iron Temple Gym organiza su primer torneo interno de fuerza.',
      contenido: [
        'Iron Temple Gym anuncia su primer Torneo Interno de Powerlifting, un evento diseñado para que los miembros del gimnasio pongan a prueba su fuerza en las tres disciplinas clásicas: sentadilla, press de banca y peso muerto.',
        'El torneo está abierto a todos los niveles, desde principiantes hasta atletas avanzados, y contará con categorías separadas por peso corporal y nivel de experiencia. Un panel de jueces certificados validará cada levantamiento siguiendo los estándares de la Federación Colombiana de Powerlifting.',
        'Los tres primeros lugares de cada categoría recibirán medalla, reconocimiento en las redes del gimnasio y un mes de membresía gratis. Todos los participantes recibirán una camiseta conmemorativa del evento.',
        'Las inscripciones están abiertas en recepción hasta agotar cupos. Se recomienda a los participantes llegar con al menos dos semanas de preparación específica antes de la fecha del torneo.'
      ],
      autor: 'Coach Iron Temple',
      fuente: 'Iron Temple Gym',
      fecha: '2026-07-15',
      comentarios: [
        { id: 1, nombre: 'Julián P.', texto: '¡Me inscribo ya! ¿Hay categoría para principiantes de verdad o toca competir contra todos?', fecha: '2026-07-16' },
        { id: 2, nombre: 'Mariana V.', texto: 'Buenísima iniciativa, ojalá lo hagan cada semestre.', fecha: '2026-07-17' },
        { id: 3, nombre: 'Diego F.', texto: '¿A qué hora empieza el evento el día del torneo?', fecha: '2026-07-18' }
      ]
    },
    {
      id: 4,
      categoria: 'HORARIO',
      icono: '🕒',
      titulo: 'Ampliación de horario nocturno',
      resumen: 'Ahora puedes entrenar hasta las 11:00 p.m. de lunes a viernes.',
      contenido: [
        'Respondiendo a las solicitudes de la comunidad, Vital Fitness Club amplía su horario de atención de lunes a viernes hasta las 11:00 p.m., pensando en quienes trabajan o estudian hasta tarde y necesitan flexibilidad para entrenar.',
        'El nuevo horario nocturno contará con personal de recepción y al menos un entrenador disponible en sala para resolver dudas o brindar acompañamiento básico durante toda la franja extendida.',
        'La zona de pesas, cardio y funcional estarán completamente disponibles durante el horario ampliado. Las clases grupales seguirán funcionando en sus horarios habituales durante el día y la tarde.',
        'El cambio de horario entra en vigencia de inmediato y no representa ningún costo adicional para los miembros activos.'
      ],
      autor: 'Administración Vital Fitness',
      fuente: 'Vital Fitness Club',
      fecha: '2026-06-20',
      comentarios: []
    },
    {
      id: 5,
      categoria: 'ALIANZA',
      icono: '🤝',
      titulo: 'Alianza con nutricionista deportivo',
      resumen: 'PowerZone Yopal firma alianza para asesorías nutricionales dentro del gimnasio.',
      contenido: [
        'PowerZone Yopal firmó una alianza estratégica con una nutricionista deportiva certificada para ofrecer asesorías personalizadas dentro de las instalaciones del gimnasio, sin necesidad de desplazarse a un consultorio externo.',
        'El servicio incluye valoración nutricional inicial, plan alimenticio ajustado a los objetivos de cada persona (pérdida de grasa, ganancia muscular o rendimiento deportivo) y seguimiento mensual.',
        'Los miembros con plan premium tendrán acceso a una consulta inicial gratuita, mientras que los demás miembros podrán acceder al servicio con una tarifa preferencial frente al valor de mercado.',
        'Las citas se pueden agendar directamente en recepción o a través de la app del gimnasio, en el módulo de "Servicios adicionales".'
      ],
      autor: 'Equipo PowerZone',
      fuente: 'PowerZone Yopal',
      fecha: '2026-05-30',
      comentarios: [
        { id: 1, nombre: 'Sofía T.', texto: 'Justo lo que necesitaba, llevo meses buscando algo así.', fecha: '2026-05-31' }
      ]
    },
    {
      id: 6,
      categoria: 'LOGRO',
      icono: '🥇',
      titulo: 'Atleta de Iron Temple clasifica a nacional',
      resumen: 'Uno de nuestros miembros logró clasificar al campeonato nacional de powerlifting.',
      contenido: [
        'Con orgullo anunciamos que uno de los miembros de Iron Temple Gym logró clasificar al Campeonato Nacional de Powerlifting tras una destacada participación en el torneo clasificatorio regional.',
        'El atleta, que entrena en el gimnasio desde hace más de dos años, superó su propia marca personal en las tres disciplinas, logrando un total que lo ubicó en el primer lugar de su categoría de peso.',
        'Todo el equipo de entrenadores de Iron Temple acompañó su proceso de preparación durante los últimos meses, con una planificación específica orientada a la competencia.',
        'El campeonato nacional se llevará a cabo el próximo trimestre y el gimnasio ya confirmó que apoyará al atleta con parte de los gastos de transporte y alojamiento para el evento.'
      ],
      autor: 'Coach Iron Temple',
      fuente: 'Iron Temple Gym',
      fecha: '2026-08-10',
      comentarios: [
        { id: 1, nombre: 'Camilo A.', texto: '¡Qué orgullo! Vamos con toda en el nacional 💪', fecha: '2026-08-10' },
        { id: 2, nombre: 'Valentina S.', texto: 'Excelente, se nota el trabajo duro. ¡Éxitos!', fecha: '2026-08-11' }
      ]
    }
  ];

  // ===== RESEÑAS =====
  resenas: Resena[] = [
    {
      id: 1,
      gimnasio: 'PowerZone Yopal',
      autor: 'Carlos Herrera',
      avatar: '👨',
      calificacion: 5,
      texto: 'Excelente gimnasio, máquinas de última generación y el personal siempre dispuesto a ayudar. La zona de pesas libres es amplia y nunca hay que esperar mucho tiempo.',
      fecha: '2026-08-05'
    },
    {
      id: 2,
      gimnasio: 'Vital Fitness Club',
      autor: 'Daniela Ortiz',
      avatar: '👩',
      calificacion: 5,
      texto: 'Las clases de spinning son lo mejor de Yopal. El instructor motiva muchísimo y la música está siempre a tono. Totalmente recomendado.',
      fecha: '2026-08-03'
    },
    {
      id: 3,
      gimnasio: 'Iron Temple Gym',
      autor: 'Felipe Santos',
      avatar: '👨',
      calificacion: 4,
      texto: 'Muy buen ambiente para quienes hacen powerlifting en serio. Les falta un poco más de espacio en horas pico, pero el equipo y los entrenadores son de primera.',
      fecha: '2026-07-29'
    },
    {
      id: 4,
      gimnasio: 'PowerZone Yopal',
      autor: 'Marcela Rincón',
      avatar: '👩',
      calificacion: 5,
      texto: 'Llevo 6 meses entrenando aquí y la verdad los resultados se notan. La asesoría nutricional que ofrecen ahora es un plus enorme.',
      fecha: '2026-07-22'
    },
    {
      id: 5,
      gimnasio: 'Vital Fitness Club',
      autor: 'Santiago Molina',
      avatar: '👨',
      calificacion: 4,
      texto: 'Instalaciones limpias y bien mantenidas. El nuevo horario nocturno me salvó la rutina porque salgo tarde del trabajo.',
      fecha: '2026-07-10'
    },
    {
      id: 6,
      gimnasio: 'Iron Temple Gym',
      autor: 'Paula Jiménez',
      avatar: '👩',
      calificacion: 5,
      texto: 'El torneo interno de powerlifting fue una experiencia increíble. Se nota que el gimnasio invierte en su comunidad, no solo en máquinas.',
      fecha: '2026-06-18'
    }
  ];

  gimnasiosDisponibles: string[] = ['PowerZone Yopal', 'Vital Fitness Club', 'Iron Temple Gym'];

  // ===== ESTADO =====
  vistaActual: 'noticias' | 'resenas' = 'noticias';
  noticiaSeleccionada: Noticia | null = null;

  nuevoComentarioNombre: string = '';
  nuevoComentarioTexto: string = '';

  mostrarFormularioResena: boolean = false;
  nuevaResena = {
    gimnasio: this.gimnasiosDisponibles[0],
    autor: '',
    calificacion: 0,
    texto: ''
  };

  // ===== GETTERS / ESTADÍSTICAS =====
  get totalNoticias(): number {
    return this.noticias.length;
  }

  get totalResenas(): number {
    return this.resenas.length;
  }

  get totalComentarios(): number {
    return this.noticias.reduce((sum, n) => sum + n.comentarios.length, 0);
  }

  get calificacionPromedio(): number {
    if (this.resenas.length === 0) return 0;
    const suma = this.resenas.reduce((sum, r) => sum + r.calificacion, 0);
    return Math.round((suma / this.resenas.length) * 10) / 10;
  }

  // ===== NAVEGACIÓN =====
  cambiarVista(vista: 'noticias' | 'resenas'): void {
    this.vistaActual = vista;
  }

  // ===== NOTICIAS =====
  verNoticia(noticia: Noticia): void {
    this.noticiaSeleccionada = noticia;
    this.nuevoComentarioNombre = '';
    this.nuevoComentarioTexto = '';
  }

  cerrarNoticia(): void {
    this.noticiaSeleccionada = null;
  }

  agregarComentario(): void {
    if (!this.noticiaSeleccionada) return;
    if (this.nuevoComentarioNombre.trim().length < 2 || this.nuevoComentarioTexto.trim().length < 3) return;

    const nuevoId = this.noticiaSeleccionada.comentarios.length > 0
      ? Math.max(...this.noticiaSeleccionada.comentarios.map(c => c.id)) + 1
      : 1;

    this.noticiaSeleccionada.comentarios.push({
      id: nuevoId,
      nombre: this.nuevoComentarioNombre.trim(),
      texto: this.nuevoComentarioTexto.trim(),
      fecha: new Date().toISOString().split('T')[0]
    });

    this.nuevoComentarioNombre = '';
    this.nuevoComentarioTexto = '';
  }

  // ===== RESEÑAS =====
  getEstrellas(calificacion: number): boolean[] {
    return [1, 2, 3, 4, 5].map(n => n <= calificacion);
  }

  abrirFormularioResena(): void {
    this.mostrarFormularioResena = true;
    this.nuevaResena = {
      gimnasio: this.gimnasiosDisponibles[0],
      autor: '',
      calificacion: 0,
      texto: ''
    };
  }

  cerrarFormularioResena(): void {
    this.mostrarFormularioResena = false;
  }

  seleccionarCalificacion(valor: number): void {
    this.nuevaResena.calificacion = valor;
  }

  get resenaValida(): boolean {
    return this.nuevaResena.autor.trim().length > 2 &&
           this.nuevaResena.texto.trim().length > 10 &&
           this.nuevaResena.calificacion > 0;
  }

  enviarResena(): void {
    if (!this.resenaValida) return;

    const nuevoId = this.resenas.length > 0 ? Math.max(...this.resenas.map(r => r.id)) + 1 : 1;

    this.resenas.unshift({
      id: nuevoId,
      gimnasio: this.nuevaResena.gimnasio,
      autor: this.nuevaResena.autor.trim(),
      avatar: '🙂',
      calificacion: this.nuevaResena.calificacion,
      texto: this.nuevaResena.texto.trim(),
      fecha: new Date().toISOString().split('T')[0]
    });

    this.mostrarFormularioResena = false;
  }

  // ===== UTILIDADES =====
  formatearFecha(fecha: string): string {
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const [anio, mes, dia] = fecha.split('-').map(Number);
    return `${dia} ${meses[mes - 1]}. ${anio}`;
  }
}