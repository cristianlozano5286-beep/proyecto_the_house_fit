import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-public-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './public-nav.html',
  styleUrl: './public-nav.css',
})
export class PublicNavComponent {
  menuAbierto = false;
  scrolled = false;

  navLinks = [
    { label: 'Gimnasios', ruta: '/gimnasios' },
    { label: 'Rutinas', ruta: '/rutinas' },
    { label: 'Tienda', ruta: '/tienda' },
    { label: 'Blog', ruta: '/blog' },
    { label: 'IMC', ruta: '/imc' },
    { label: 'Destacados', ruta: '/destacados' },
    
  ];

  constructor(private authService: AuthService, private router: Router) {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 60;
  }

  get autenticado(): boolean {
    return this.authService.estaAutenticado();
  }

  irAlPanel(): void {
    this.router.navigate(['/panel/dashboard']);
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }
}
