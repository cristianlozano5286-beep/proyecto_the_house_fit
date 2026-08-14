
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,

  imports: [FormsModule, RouterLink, NgIf],

  imports: [FormsModule, RouterLink],

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


    this.router.navigate(['/panel/dashboard']);
  }
}

    // Redirección tras inicio de sesión exitoso
    this.router.navigate(['/dashboard']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}

