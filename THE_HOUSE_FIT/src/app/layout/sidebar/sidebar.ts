import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

interface MenuItem {
  id: string;
  icono: string;
  nombre: string;
  ruta: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  constructor(private authService: AuthService) {}

  get rolUsuario(): string {
    return this.authService.obtenerRol() || 'Usuario';
  }

  get menuVisible(): MenuItem[] {
    const rol = this.rolUsuario;
    return this.menu.filter((opcion) => opcion.roles.includes(rol));
  }

  menu: MenuItem[] = [
    { id: 'dashboard', icono: '📊', nombre: 'Dashboard', ruta: '/panel/dashboard', roles: ['Administrador', 'Creador gym', 'Usuario', 'Entrenador'] },
    { id: 'perfil', icono: '👤', nombre: 'Mi perfil', ruta: '/mi-perfil', roles: ['Administrador', 'Creador gym', 'Usuario', 'Entrenador'] },
    { id: 'contabilidad-membresias', icono: '🪪', nombre: 'Contabilidad & Cédulas', ruta: '/contabilidad-gestion', roles: ['Administrador', 'Creador gym'] },
    { id: 'editar-gimnasio', icono: '✏️', nombre: 'Editar mi gimnasio', ruta: '/editar-gimnasio', roles: ['Administrador', 'Creador gym'] },
    { id: 'gimnasios', icono: '🏋️', nombre: 'Publicar gimnasio', ruta: '/publicar-gimnasio', roles: ['Administrador', 'Creador gym'] },
    { id: 'instructores', icono: '🧑‍🏫', nombre: 'Instructores', ruta: '/instructores-gestion', roles: ['Administrador', 'Creador gym'] },
    { id: 'productos', icono: '🛒', nombre: 'Productos', ruta: '/productos-gestion', roles: ['Administrador', 'Creador gym'] },
    { id: 'contenido', icono: '📋', nombre: 'Rutinas y guías', ruta: '/contenido-gestion', roles: ['Administrador', 'Creador gym', 'Entrenador'] },
    { id: 'entrenamiento', icono: '🥗', nombre: 'Mi entrenamiento', ruta: '/mi-espacio/entrenamiento', roles: ['Usuario', 'Entrenador'] },
    { id: 'reservar-clase', icono: '📅', nombre: 'Reservar clase', ruta: '/mi-espacio/reservar-clase', roles: ['Usuario', 'Entrenador'] },
    { id: 'resenas', icono: '⭐', nombre: 'Reseñas', ruta: '/mi-espacio/resenas', roles: ['Administrador', 'Usuario', 'Entrenador'] },
    { id: 'noticias', icono: '📰', nombre: 'Noticias', ruta: '/noticias-gestion', roles: ['Administrador', 'Creador gym'] },
    { id: 'pagos', icono: '💳', nombre: 'Pagos', ruta: '/mi-espacio/pagos', roles: ['Usuario', 'Entrenador'] },
    { id: 'usuarios', icono: '🙋', nombre: 'Usuarios', ruta: '/panel/usuarios', roles: ['Administrador', 'Creador gym'] },
    { id: 'roles', icono: '🔑', nombre: 'Roles', ruta: '/panel/roles', roles: ['Administrador'] },
  ];
}
