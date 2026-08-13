import { Component, inject } from '@angular/core';
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
  private router = inject(Router);
  private authService = inject(AuthService);

  email: string = '';
  password: string = '';
  mensaje: string = '';

  // Método ejecutado al presionar ingresar (HU10, HU11)
  login(): void {
    const autenticado = this.authService.inciarSesion(this.email, this.password);

    if (!autenticado) {
      this.mensaje = 'Correo o contraseña incorrectos.';
      return;
    }

    // Redirección tras inicio de sesión exitoso
    this.router.navigate(['/dashboard']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}