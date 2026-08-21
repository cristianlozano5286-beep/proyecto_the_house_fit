import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { GimnasiosService } from '../../services/gimnasios';
import { InstructoresService } from '../../services/instructores';
import { ProductosService } from '../../services/productos';
import { BlogService } from '../../services/blog';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  usuario: string = 'Administrador';
  rol: string = 'Administrador del sistema';

  Estadisticas = {
    Gimnasios: 0,
    Instructores: 0,
    Productos: 0,
    Usuarios: 0,
  };

  Grafica = [
    { mes: 'Marzo', valor: 65 },
    { mes: 'Abril', valor: 72 },
    { mes: 'Mayo', valor: 68 },
    { mes: 'Junio', valor: 80 },
    { mes: 'Julio', valor: 76 },
    { mes: 'Agosto', valor: 88 },
  ];

  usuarios: { id: number; nombre: string; correo: string; rol: string; estado: string }[] = [];

  constructor(
    private authService: AuthService,
    private gimnasiosService: GimnasiosService,
    private instructoresService: InstructoresService,
    private productosService: ProductosService,
    private blogService: BlogService,
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.obtenerNombre() || 'Administrador';
    this.rol = this.authService.obtenerRol() || 'Administrador del sistema';

    this.Estadisticas.Gimnasios = this.gimnasiosService.listar().length;
    this.Estadisticas.Instructores = this.instructoresService.listar().length;
    this.Estadisticas.Productos = this.productosService.listar().length;
    this.Estadisticas.Usuarios = this.authService.listarUsuariosSistema().length;

    this.usuarios = this.authService.listarUsuariosSistema().map((u, idx) => ({
      id: idx + 1,
      nombre: u.nombre,
      correo: u.correo,
      rol: u.rol,
      estado: u.correoVerificado ? 'Activo' : 'Pendiente',
    }));
  }

  mostrarMensaje(): void {
    alert('Bienvenido al panel administrativo de The House Fit');
  }

  obtenerTotalUsuarios(): number {
    return this.usuarios.length;
  }

  ultimasResenas() {
    return [...this.blogService.listarResenas()].reverse().slice(0, 3);
  }
}
