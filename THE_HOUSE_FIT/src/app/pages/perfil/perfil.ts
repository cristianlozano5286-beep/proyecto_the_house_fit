import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

interface AvatarPreset {
  id: string;
  etiqueta: string;
  dataUrl: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilComponent implements OnInit {
  nombre = '';
  correo = '';
  rol = 'Usuario';
  fotoPerfil = '';
  urlExterna = '';
  mostrarInputUrl = false;

  guardando = false;
  procesandoImagen = false;
  mensajeExito = '';
  mensajeError = '';

  readonly presets: AvatarPreset[] = [
    {
      id: 'atleta-fuego',
      etiqueta: 'Atleta Pro',
      dataUrl:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'><defs><linearGradient id='g1' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23ff4500'/><stop offset='100%' stop-color='%23ff8c3b'/></linearGradient></defs><rect width='160' height='160' rx='80' fill='url(%23g1)'/><circle cx='80' cy='60' r='26' fill='%23fff'/><path d='M36 136c6-26 24-40 44-40s38 14 44 40' fill='%23fff'/></svg>",
    },
    {
      id: 'coach-dark',
      etiqueta: 'Fuerza Élite',
      dataUrl:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'><defs><linearGradient id='g2' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%2318181f'/><stop offset='100%' stop-color='%23331a12'/></linearGradient></defs><rect width='160' height='160' rx='80' fill='url(%23g2)'/><circle cx='80' cy='80' r='74' fill='none' stroke='%23ff5722' stroke-width='4'/><path d='M42 80h76M54 62v36M106 62v36M44 68v24M116 68v24' stroke='%23ff6b2b' stroke-width='8' stroke-linecap='round'/></svg>",
    },
    {
      id: 'cardio-emerald',
      etiqueta: 'Cardio & Runner',
      dataUrl:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'><defs><linearGradient id='g3' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23059669'/><stop offset='100%' stop-color='%2310b981'/></linearGradient></defs><rect width='160' height='160' rx='80' fill='url(%23g3)'/><polygon points='88,28 48,88 78,88 70,132 112,72 82,72' fill='%23ffffff'/></svg>",
    },
    {
      id: 'creador-gold',
      etiqueta: 'Anfitrión Gym',
      dataUrl:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'><defs><linearGradient id='g4' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23d97706'/><stop offset='100%' stop-color='%23f59e0b'/></linearGradient></defs><rect width='160' height='160' rx='80' fill='url(%23g4)'/><path d='M80 36l40 30v54H40V66z' fill='%23141418'/><path d='M62 94h36M80 76v36' stroke='%23fbbf24' stroke-width='8' stroke-linecap='round'/></svg>",
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  get primerNombre(): string {
    return (this.nombre || 'Atleta').trim().split(/\s+/)[0] || 'Atleta';
  }

  get esUsuarioOEntrenador(): boolean {
    return this.rol === 'Usuario' || this.rol === 'Entrenador';
  }

  salirAlPanel(): void {
    this.router.navigate(['/panel/dashboard']);
  }

  async ngOnInit(): Promise<void> {
    this.cargarDesdeSesion();
    const sincronizado = await this.authService.sincronizarPerfil();
    if (sincronizado) {
      this.cargarDesdeSesion();
      this.cdr.markForCheck();
    }
  }

  private cargarDesdeSesion(): void {
    const u = this.authService.obtenerUsuario();
    this.nombre = u?.nombre || 'Usuario';
    this.correo = u?.correo || '';
    this.rol = u?.rol || 'Usuario';
    this.fotoPerfil = this.authService.obtenerFotoPerfil();
  }

  get inicial(): string {
    return this.nombre ? this.nombre.trim().charAt(0).toUpperCase() : 'U';
  }

  get esCreadorOAdmin(): boolean {
    return this.rol === 'Creador gym' || this.rol === 'Administrador';
  }

  async alSeleccionarArchivo(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    this.limpiarAvisos();
    if (!archivo.type.startsWith('image/')) {
      this.mensajeError = 'Por favor selecciona un archivo de imagen válido (JPG, PNG o WebP).';
      input.value = '';
      return;
    }

    this.procesandoImagen = true;
    try {
      const dataUrl = await this.redimensionarImagenCuadrada(archivo, 320, 0.86);
      this.fotoPerfil = dataUrl;
      await this.guardarCambios('¡Tu nueva foto de perfil se guardó correctamente!');
    } catch {
      this.mensajeError = 'No se pudo procesar la imagen seleccionada. Intenta con otra foto.';
    } finally {
      this.procesandoImagen = false;
      input.value = '';
      this.cdr.markForCheck();
    }
  }

  async elegirPreset(preset: AvatarPreset): Promise<void> {
    this.limpiarAvisos();
    this.fotoPerfil = preset.dataUrl;
    await this.guardarCambios(`Avatar «${preset.etiqueta}» aplicado en tu perfil.`);
  }

  async aplicarUrlExterna(): Promise<void> {
    this.limpiarAvisos();
    const limpia = this.urlExterna.trim();
    if (!limpia.startsWith('http://') && !limpia.startsWith('https://')) {
      this.mensajeError = 'Ingresa un enlace válido que comience con https:// o http://';
      return;
    }
    this.fotoPerfil = limpia;
    this.urlExterna = '';
    this.mostrarInputUrl = false;
    await this.guardarCambios('Foto de perfil actualizada desde enlace externo.');
  }

  async quitarFoto(): Promise<void> {
    this.limpiarAvisos();
    this.fotoPerfil = '';
    await this.guardarCambios('Se restauró el avatar con tu inicial.');
  }

  async guardarCambios(mensajePersonalizado?: string): Promise<void> {
    this.limpiarAvisos();
    const nombreLimpio = this.nombre.trim();
    if (nombreLimpio.length < 2) {
      this.mensajeError = 'El nombre debe tener al menos 2 caracteres.';
      return;
    }

    this.guardando = true;
    const { error, usuario } = await this.authService.actualizarPerfil({
      nombre: nombreLimpio,
      fotoPerfil: this.fotoPerfil,
    });
    this.guardando = false;

    if (error) {
      this.mensajeError = error;
    } else {
      if (usuario) {
        this.nombre = usuario.nombre;
        this.fotoPerfil = usuario.fotoPerfil || '';
      }
      this.mensajeExito = mensajePersonalizado || '¡Datos de perfil actualizados con éxito!';
    }
    this.cdr.markForCheck();
  }

  private limpiarAvisos(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  private redimensionarImagenCuadrada(
    archivo: File,
    lado = 320,
    calidad = 0.86,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onerror = () => reject(new Error('Error leyendo archivo'));
      lector.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Error cargando imagen'));
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = lado;
          canvas.height = lado;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Sin contexto canvas'));
            return;
          }
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, lado, lado);
          resolve(canvas.toDataURL('image/jpeg', calidad));
        };
        img.src = String(lector.result);
      };
      lector.readAsDataURL(archivo);
    });
  }
}

