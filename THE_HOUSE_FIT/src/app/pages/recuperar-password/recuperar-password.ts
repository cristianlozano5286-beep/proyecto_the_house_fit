import { Component, OnInit } from '@angular/core';
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
  codigoSimulado: string | null = null;

  // Propiedades del Captcha visual estilo Apple
  captchaTexto: string = '';
  codigoIngresadoCaptcha: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.generarCaptcha();
  }

  generarCaptcha(): void {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let resultado = '';
    for (let i = 0; i < 5; i++) {
      resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    this.captchaTexto = resultado;
    this.codigoIngresadoCaptcha = '';
  }

  validarCaptchaYContinuar(): void {
    const correoLimpio = this.correo.trim();
    if (!correoLimpio) {
      this.mostrarError('Ingresa tu correo electrónico.');
      return;
    }

    if (this.codigoIngresadoCaptcha.toUpperCase() !== this.captchaTexto) {
      this.mostrarError('El código de seguridad visual no coincide.');
      this.generarCaptcha();
      return;
    }

    const enviado = this.authService.solicitarRecuperacion(correoLimpio);
    if (!enviado) {
      this.mostrarError('No encontramos una cuenta con ese correo en The House Fit.');
      this.generarCaptcha();
      return;
    }

    this.codigoSimulado = this.authService.obtenerUltimoCodigo();
    this.mensaje = 'Correo verificado. Hemos generado tu código de recuperación.';
    this.tipoMensaje = 'success';
    this.paso = 2;
  }

  restablecer(): void {
    const codigoLimpio = this.codigo.trim();
    
    if (!codigoLimpio || !this.nuevaPassword || !this.confirmarPassword) {
      this.mostrarError('Completa todos los campos.');
      return;
    }
    
    if (this.nuevaPassword !== this.confirmarPassword) {
      this.mostrarError('Las contraseñas no coinciden.');
      return;
    }

    const exito = this.authService.restablecerPassword(
      this.correo.trim(), 
      codigoLimpio, 
      this.nuevaPassword
    );

    if (!exito) {
      this.mostrarError('El código de verificación ingresado no es válido.');
      return;
    }

    this.tipoMensaje = 'success';
    this.mensaje = '¡Contraseña actualizada correctamente! Redirigiendo...';
    
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500);
  }

  private mostrarError(texto: string): void {
    this.tipoMensaje = 'error';
    this.mensaje = texto;
  }
}