import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  anio: number = new Date().getFullYear();

  navLinks = [
    { label: 'Gimnasios', ruta: '/gimnasios' },
    { label: 'Tienda', ruta: '/tienda' },
    { label: 'Blog', ruta: '/blog' },
    { label: 'IMC', ruta: '/imc' },
    { label: 'Destacados', ruta: '/destacados' },
  ];

  redes = ['IG', 'FB', 'TK', 'YT'];
}