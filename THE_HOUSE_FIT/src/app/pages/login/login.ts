import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
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
  // Inyección de servicios
  private router = inject(Router);
  private authService = inject(AuthService);

  // Variables para el formulario
  email: string = 'usuario@thehousefit.com';
  password: string = '123456';
  mensaje: string = '';

  // Método ejecutado al presionar ingresar (HU10, HU11)
  login(): void {
    console.log('Intentando iniciar sesión con:', this.email, this.password);

    const autenticado = this.authService.inciarSesion(this.email, this.password);

    if (!autenticado) {
      this.mensaje = 'Correo o contraseña incorrectos.';
      return;
    }

    // Redirección hacia el panel principal definido en tus rutas
    this.router.navigate(['/panel/dashboard']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}