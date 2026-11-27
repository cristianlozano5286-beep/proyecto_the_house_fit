import { Component, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-recuperar-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './recuperar-password.html',
  styleUrl: './recuperar-password.css',
})
export class RecuperarPasswordComponent implements OnDestroy {
  @ViewChild('correoInput') correoInput?: ElementRef<HTMLInputElement>;
  @ViewChild('codigoInput') codigoInput?: ElementRef<HTMLInputElement>;
  @ViewChild('nuevaPasswordInput') nuevaPasswordInput?: ElementRef<HTMLInputElement>;

  paso: 1 | 2 | 3 = 1;
  correo: string = '';
  codigo: string = '';
  nuevaPassword: string = '';
  confirmarPassword: string = '';
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' | '' = '';
  cargando: boolean = false;

  // Reenvío con cuenta regresiva de 30s (alineado con el límite del MID)
  segundosReenvio: number = 0;
  reenviando: boolean = false;
  private intervaloReenvio: ReturnType<typeof setInterval> | null = null;

  // Visibilidad de contraseñas
  mostrarPasswordNueva: boolean = false;
  mostrarPasswordConfirmar: boolean = false;

  // Estado de validación tras interacción
  correoTocado: boolean = false;
  codigoTocado: boolean = false;
  passwordTocada: boolean = false;
  confirmarTocada: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    this.detenerContadorReenvio();
  }

  get correoValido(): boolean {
    const limpio = this.correo.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio);
  }

  get codigoValido(): boolean {
    return /^\d{6}$/.test(this.codigo.trim());
  }

  get tieneMin6(): boolean {
    return this.nuevaPassword.length >= 6;
  }

  get coincidenPasswords(): boolean {
    return this.nuevaPassword.length > 0 && this.nuevaPassword === this.confirmarPassword;
  }

  limpiarErrorAlEscribir(): void {
    if (this.tipoMensaje === 'error') {
      this.mensaje = '';
      this.tipoMensaje = '';
      this.cdr.markForCheck();
    }
  }

  normalizarCodigo(valor: string): void {
    this.codigo = (valor || '').replace(/\D/g, '').slice(0, 6);
    this.limpiarErrorAlEscribir();
  }

  // PASO 1 -> Envía el código real de 6 dígitos al correo
  async enviarCodigoCorreo(event?: Event): Promise<void> {
    event?.preventDefault();
    this.correoTocado = true;

    const correoLimpio = this.correo.trim().toLowerCase();
    if (!correoLimpio || !this.correoValido) {
      this.mostrarError('Ingresa un correo electrónico válido.');
      this.correoInput?.nativeElement.focus();
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.tipoMensaje = '';
    this.cdr.markForCheck();

    try {
      const { error, mensaje } = await this.authService.solicitarRecuperacion(correoLimpio);
      if (error) {
        this.mostrarError(error);
        this.correoInput?.nativeElement.focus();
        return;
      }

      this.correo = correoLimpio;
      this.codigo = '';
      this.codigoTocado = false;
      this.tipoMensaje = 'success';
      this.mensaje = mensaje || 'Te enviamos un código de 6 dígitos a tu correo.';
      this.paso = 2;
      this.iniciarContadorReenvio(30);
      this.cdr.markForCheck();

      setTimeout(() => this.codigoInput?.nativeElement.focus(), 60);
    } catch (e: any) {
      this.mostrarError(e?.message || 'No se pudo enviar el código. Intenta nuevamente.');
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  async reenviarCodigo(): Promise<void> {
    if (this.segundosReenvio > 0 || this.reenviando || this.cargando) {
      return;
    }

    this.reenviando = true;
    this.mensaje = '';
    this.tipoMensaje = '';
    this.cdr.markForCheck();

    try {
      const { error, mensaje } = await this.authService.solicitarRecuperacion(this.correo);
      if (error) {
        this.mostrarError(error);
        return;
      }
      this.codigo = '';
      this.tipoMensaje = 'success';
      this.mensaje = mensaje || 'Te enviamos un nuevo código de 6 dígitos a tu correo.';
      this.iniciarContadorReenvio(30);
      setTimeout(() => this.codigoInput?.nativeElement.focus(), 40);
    } finally {
      this.reenviando = false;
      this.cdr.markForCheck();
    }
  }

  // PASO 2 -> Valida el código que llegó al correo contra el MID
  async validarCodigoCorreo(event?: Event): Promise<void> {
    event?.preventDefault();
    this.codigoTocado = true;

    const codigoLimpio = this.codigo.trim();
    if (!/^\d{6}$/.test(codigoLimpio)) {
      this.mostrarError('Ingresa el código completo de 6 dígitos que llegó a tu correo.');
      this.codigoInput?.nativeElement.focus();
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.tipoMensaje = '';
    this.cdr.markForCheck();

    try {
      const error = await this.authService.verificarCodigoRecuperacion(this.correo, codigoLimpio);
      if (error) {
        this.mostrarError(error);
        this.codigoInput?.nativeElement.focus();
        return;
      }

      this.tipoMensaje = 'success';
      this.mensaje = 'Código verificado. Ahora escribe tu nueva contraseña.';
      this.paso = 3;
      this.cdr.markForCheck();

      setTimeout(() => this.nuevaPasswordInput?.nativeElement.focus(), 60);
    } catch (e: any) {
      this.mostrarError(e?.message || 'Error al verificar el código.');
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  // PASO 3 -> Guarda la nueva contraseña encriptada en PostgreSQL
  async restablecer(event?: Event): Promise<void> {
    event?.preventDefault();
    this.passwordTocada = true;
    this.confirmarTocada = true;

    if (!this.nuevaPassword || this.nuevaPassword.length < 6) {
      this.mostrarError('La nueva contraseña debe tener mínimo 6 caracteres.');
      this.nuevaPasswordInput?.nativeElement.focus();
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      this.mostrarError('Las contraseñas no coinciden. Verifícalas e intenta nuevamente.');
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.tipoMensaje = '';
    this.cdr.markForCheck();

    try {
      const error = await this.authService.restablecerPassword(
        this.correo.trim(),
        this.codigo.trim(),
        this.nuevaPassword,
      );

      if (error) {
        this.mostrarError(error);
        return;
      }

      this.tipoMensaje = 'success';
      this.mensaje = '¡Contraseña actualizada en la base de datos! Redirigiendo a iniciar sesión...';
      this.cdr.markForCheck();

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
    } catch (e: any) {
      this.mostrarError(e?.message || 'Error al restablecer la contraseña.');
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  cambiarCorreo(): void {
    this.detenerContadorReenvio();
    this.paso = 1;
    this.codigo = '';
    this.nuevaPassword = '';
    this.confirmarPassword = '';
    this.mensaje = '';
    this.tipoMensaje = '';
    this.cdr.markForCheck();
    setTimeout(() => this.correoInput?.nativeElement.focus(), 60);
  }

  toggleMostrarPasswordNueva(): void {
    this.mostrarPasswordNueva = !this.mostrarPasswordNueva;
    this.cdr.markForCheck();
  }

  toggleMostrarPasswordConfirmar(): void {
    this.mostrarPasswordConfirmar = !this.mostrarPasswordConfirmar;
    this.cdr.markForCheck();
  }

  private iniciarContadorReenvio(segundos: number): void {
    this.detenerContadorReenvio();
    this.segundosReenvio = segundos;
    this.intervaloReenvio = setInterval(() => {
      if (this.segundosReenvio > 0) {
        this.segundosReenvio--;
        this.cdr.markForCheck();
      } else {
        this.detenerContadorReenvio();
      }
    }, 1000);
  }

  private detenerContadorReenvio(): void {
    if (this.intervaloReenvio) {
      clearInterval(this.intervaloReenvio);
      this.intervaloReenvio = null;
    }
  }

  private mostrarError(texto: string): void {
    this.tipoMensaje = 'error';
    this.mensaje = texto;
    this.cdr.markForCheck();
  }
}
