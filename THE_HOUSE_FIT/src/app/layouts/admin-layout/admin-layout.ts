import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayoutComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/auth/login']);
  }
}
