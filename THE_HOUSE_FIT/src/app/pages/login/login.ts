import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  constructor(private router: Router, private authService: AuthService) {}

  email: string = '';
  password: string = '';
  mensaje: string = '';

  // Método que será ejecutado al presionar el botón ingresar (HU10, HU11)
  login(): void {
    const autenticado = this.authService.inciarSesion(this.email, this.password);

    if (!autenticado) {
      this.mensaje = 'Correo o contraseña incorrectos.';
      return;
    }
    // Redirección al menú principal según el rol tras un inicio de sesión exitoso
    this.router.navigate(['/panel/dashboard']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
