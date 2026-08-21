import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

interface MenuItem {
  icono: string;
  nombre: string;
  ruta: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  constructor(private authService: AuthService) {
    this.rolUsuario = this.authService.obtenerRol() || 'Usuario';
    this.cargarMenu();
  }

  rolUsuario: string = '';
  menuVisible: MenuItem[] = [];

  menu: MenuItem[] = [
    { icono: '📊', nombre: 'Dashboard', ruta: '/panel/dashboard', roles: ['Administrador'] },
    { icono: '🏋️', nombre: 'Gimnasios', ruta: '/panel/gimnasios', roles: ['Administrador'] },
    { icono: '🧑‍🏫', nombre: 'Instructores', ruta: '/panel/instructores', roles: ['Administrador'] },
    { icono: '🛒', nombre: 'Productos', ruta: '/panel/productos', roles: ['Administrador'] },
    { icono: '📋', nombre: 'Rutinas y guías', ruta: '/panel/contenido', roles: ['Administrador', 'Entrenador'] },
    { icono: '🥗', nombre: 'Mi entrenamiento', ruta: '/panel/entrenamiento', roles: ['Usuario', 'Entrenador'] },
    { icono: '📅', nombre: 'Reservar clase', ruta: '/panel/reservar-clase', roles: ['Usuario', 'Entrenador'] },
    { icono: '⭐', nombre: 'Reseñas', ruta: '/panel/resenas', roles: ['Administrador', 'Usuario', 'Entrenador'] },
    { icono: '📰', nombre: 'Noticias', ruta: '/panel/noticias', roles: ['Administrador'] },
    { icono: '💳', nombre: 'Pagos', ruta: '/panel/pagos', roles: ['Usuario', 'Entrenador'] },
    { icono: '🙋', nombre: 'Usuarios', ruta: '/panel/usuarios', roles: ['Administrador'] },
    { icono: '🔑', nombre: 'Roles', ruta: '/panel/roles', roles: ['Administrador'] },
  ];

  private cargarMenu(): void {
    this.menuVisible = this.menu.filter((opcion) => opcion.roles.includes(this.rolUsuario));
  }
}
