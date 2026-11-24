import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-recuperar-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './recuperar-password.html',
  styleUrl: './recuperar-password.css',
})
export class RecuperarPasswordComponent implements OnInit {
  paso: 1 | 2 = 1;
  correo: string = '';
  codigo: string = '';
  nuevaPassword: string = '';
  confirmarPassword: string = '';
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' | '' = '';
  cargando: boolean = false;

  // Visibilidad de contraseñas
  mostrarPasswordNueva: boolean = false;
  mostrarPasswordConfirmar: boolean = false;

  // Propiedades del Captcha visual interactivo
  captchaTexto: string = '';
  codigoIngresadoCaptcha: string = '';
  rotandoCaptcha: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.generarCaptcha();
  }

  generarCaptcha(): void {
    this.rotandoCaptcha = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.rotandoCaptcha = false;
      this.cdr.markForCheck();
    }, 450);

    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let resultado = '';
    for (let i = 0; i < 5; i++) {
      resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    this.captchaTexto = resultado;
    this.codigoIngresadoCaptcha = '';
    this.cdr.markForCheck();
  }

  async validarCaptchaYContinuar(): Promise<void> {
    const correoLimpio = this.correo.trim();
    if (!correoLimpio) {
      this.mostrarError('Ingresa tu correo electrónico.');
      return;
    }

    if (this.codigoIngresadoCaptcha.toUpperCase() !== this.captchaTexto) {
      this.mostrarError('El código de seguridad visual no coincide. Intenta con uno nuevo.');
      this.generarCaptcha();
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.cdr.markForCheck();

    try {
      // El MID busca la cuenta y genera el código de recuperación
      const error = await this.authService.solicitarRecuperacion(correoLimpio);

      if (error) {
        this.mostrarError(error);
        this.generarCaptcha();
        return;
      }

      this.codigo = "";
      this.mensaje = "Si existe una cuenta con ese correo, recibirás un código de recuperación.";

      this.tipoMensaje = 'success';
      this.paso = 2;
    } catch (e: any) {
      this.mostrarError(e?.message || 'Ocurrió un error inesperado al procesar la solicitud.');
      this.generarCaptcha();
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  async restablecer(): Promise<void> {
    const codigoLimpio = this.codigo.trim();
    
    if (!codigoLimpio || !this.nuevaPassword || !this.confirmarPassword) {
      this.mostrarError('Completa todos los campos obligatorios.');
      return;
    }
    
    if (this.nuevaPassword.length < 6) {
      this.mostrarError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      this.mostrarError('Las contraseñas no coinciden. Verifícalas e intenta nuevamente.');
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.cdr.markForCheck();

    try {
      const error = await this.authService.restablecerPassword(
        this.correo.trim(),
        codigoLimpio,
        this.nuevaPassword
      );

      if (error) {
        this.mostrarError(error);
        return;
      }

      this.tipoMensaje = 'success';
      this.mensaje = '¡Contraseña actualizada con éxito! Redirigiendo a inicio de sesión...';
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
    this.paso = 1;
    this.mensaje = '';
    this.generarCaptcha();
    this.cdr.markForCheck();
  }

  toggleMostrarPasswordNueva(): void {
    this.mostrarPasswordNueva = !this.mostrarPasswordNueva;
    this.cdr.markForCheck();
  }

  toggleMostrarPasswordConfirmar(): void {
    this.mostrarPasswordConfirmar = !this.mostrarPasswordConfirmar;
    this.cdr.markForCheck();
  }

  private mostrarError(texto: string): void {
    this.tipoMensaje = 'error';
    this.mensaje = texto;
    this.cdr.markForCheck();
  }
}