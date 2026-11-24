import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, UsuarioSistema } from '../../services/auth';

interface DescripcionRol {
  rol: string;
  icono: string;
  permisos: string[];
}

@Component({
  selector: 'app-roles',
  imports: [FormsModule],
  templateUrl: './roles.html',
  styleUrl: './roles.css',
})
export class RolesComponent implements OnInit {
  usuarios: UsuarioSistema[] = [];
  rolesDisponibles = ['Administrador', 'Creador gym', 'Entrenador', 'Usuario'];

  // HU44, HU45, HU46: descripción de permisos por rol
  descripciones: DescripcionRol[] = [
    {
      rol: 'Administrador',
      icono: '🔑',
      permisos: [
        'Gestionar gimnasios, instructores y productos',
        'Publicar rutinas, manuales físicos y guías nutricionales',
        'Publicar y moderar noticias y reseñas',
        'Gestionar usuarios y asignar roles',
      ],
    },
    {
      rol: 'Creador gym',
      icono: '🏋️',
      permisos: [
        'Publicar y editar sus propios gimnasios y sedes',
        'Gestionar instructores, productos, rutinas y noticias',
        'Administrar reservas y reseñas de sus sedes',
      ],
    },
    {
      rol: 'Entrenador',
      icono: '🧑‍🏫',
      permisos: [
        'Consultar y sugerir rutinas y manuales físicos',
        'Ver el perfil de nutrición de sus aprendices',
        'Publicar reseñas y comentarios en el blog',
      ],
    },
    {
      rol: 'Usuario',
      icono: '🙋',
      permisos: [
        'Consultar el catálogo de gimnasios y la tienda',
        'Elegir rutinas, calcular su IMC y ver su plan nutricional',
        'Publicar reseñas y realizar pagos de membresía',
      ],
    },
  ];

  mensaje = '';
  mensajeError = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.usuarios = this.authService.listarUsuariosSistema();
  }

  // HU47: interfaz para que el administrador gestione/asigne roles
  async cambiarRol(usuario: UsuarioSistema, nuevoRol: string): Promise<void> {
    const error = await this.authService.actualizarRol(usuario.correo, nuevoRol);

    if (error) {
      this.mensaje = '';
      this.mensajeError = error;
    } else {
      this.mensajeError = '';
      this.mensaje = `Rol de ${usuario.nombre} actualizado a "${nuevoRol}".`;
    }

    this.cargar();
  }
}
