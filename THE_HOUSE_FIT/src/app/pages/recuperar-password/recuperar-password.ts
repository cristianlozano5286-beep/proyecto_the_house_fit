import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-recuperar-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './recuperar-password.html',
  styleUrl: './recuperar-password.css',
})
export class RecuperarPasswordComponent {
  paso: 1 | 2 = 1;
  correo: string = '';
  codigo: string = '';
  nuevaPassword: string = '';
  confirmarPassword: string = '';
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' | '' = '';
  codigoSimulado: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  // Paso 1 (HU06, HU07): solicitar el envío del código al correo
  solicitarCodigo(): void {
    if (!this.correo.trim()) {
      this.mostrarError('Ingresa tu correo electrónico.');
      return;
    }
    const enviado = this.authService.solicitarRecuperacion(this.correo);
    if (!enviado) {
      this.mostrarError('No encontramos una cuenta con ese correo.');
      return;
    }
    this.codigoSimulado = this.authService.obtenerUltimoCodigo();
    this.mensaje = 'Hemos enviado un código de verificación a tu correo.';
    this.tipoMensaje = 'success';
    this.paso = 2;
  }

  // Paso 2 (HU08): ingresar el código y la nueva contraseña
  restablecer(): void {
    if (!this.codigo.trim() || !this.nuevaPassword || !this.confirmarPassword) {
      this.mostrarError('Completa todos los campos.');
      return;
    }
    if (this.nuevaPassword !== this.confirmarPassword) {
      this.mostrarError('Las contraseñas no coinciden.');
      return;
    }
    const exito = this.authService.restablecerPassword(this.correo, this.codigo, this.nuevaPassword);
    if (!exito) {
      this.mostrarError('El código ingresado no es válido.');
      return;
    }
    this.tipoMensaje = 'success';
    this.mensaje = 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.';
    setTimeout(() => this.router.navigate(['/login']), 1500);
  }

  private mostrarError(texto: string): void {
    this.tipoMensaje = 'error';
    this.mensaje = texto;
  }
}
