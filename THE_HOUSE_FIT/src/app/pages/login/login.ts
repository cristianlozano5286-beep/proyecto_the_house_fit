import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  // Propiedades para los campos del formulario
  email: string = '';
  password: string = '';
  mensaje: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  // Método ejecutado al presionar el botón de inicio de sesión (HU10, HU11)
  login(): void {
    console.log('--- INTENTO DE INICIO DE SESIÓN ---');
    console.log('Correo capturado:', this.email);
    console.log('Contraseña capturada:', this.password);

    // Validación básica en frontend para evitar llamados vacíos
    if (!this.email || !this.password) {
      this.mensaje = 'Por favor, completa todos los campos.';
      console.warn('Aviso:', this.mensaje);
      return;
    }

    // Nota: Revisa si en tu AuthService el método se llama "iniciarSesion" o "inciarSesion"
    const autenticado = this.authService.inciarSesion(this.email, this.password);
    console.log('Respuesta del AuthService (autenticado):', autenticado);

    if (!autenticado) {
      this.mensaje = 'Correo o contraseña incorrectos.';
      console.error('Error:', this.mensaje);
      return;
    }

    console.log('¡Credenciales correctas! Redirigiendo al panel...');
    this.router.navigate(['/panel/dashboard']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}