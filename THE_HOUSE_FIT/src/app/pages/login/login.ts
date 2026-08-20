import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  email = 'admin@thehousefit.com';
  password = '123456';
  mensaje = '';

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}
  login(): void {
    console.log('Intentando iniciar sesión con:', this.email, this.password);

    const autenticado = this.authService.inciarSesion(this.email, this.password);

    if (!autenticado) {
      this.mensaje = 'Correo o contraseña incorrectos.';
      return;
    }

    this.router.navigate(['/panel/dashboard']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
