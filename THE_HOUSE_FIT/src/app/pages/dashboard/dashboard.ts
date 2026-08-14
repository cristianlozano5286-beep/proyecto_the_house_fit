import { Component, OnInit } from '@angular/core';

// Interfaz para tipar la lista de usuarios
interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
}

// Interfaz para los datos de la gráfica
interface DatoGrafica {
  mes: string;
  valor: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [], 
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  usuario: string = 'Administrador';
  rol: string = 'Administrador del sistema';

  // Objeto de estadísticas (incluye Usuarios para la tarjeta)
  Estadisticas = {
    Gimnasios: 12,
    Instructores: 8,
    Productos: 45,
    Usuarios: 120
  };

  // Arreglo para renderizar la gráfica con @for
  Grafica: DatoGrafica[] = [
    { mes: 'Ene', valor: 40 },
    { mes: 'Feb', valor: 65 },
    { mes: 'Mar', valor: 85 },
    { mes: 'Abr', valor: 50 },
    { mes: 'May', valor: 90 },
    { mes: 'Jun', valor: 75 }
  ];

  // Arreglo de usuarios para llenar la tabla
  usuarios: Usuario[] = [
    { id: 1, nombre: 'Carlos Gómez', correo: 'carlos@example.com', rol: 'Cliente', estado: 'Activo' },
    { id: 2, nombre: 'Ana Martínez', correo: 'ana@example.com', rol: 'Instructor', estado: 'Activo' },
    { id: 3, nombre: 'Luis Rodríguez', correo: 'luis@example.com', rol: 'Cliente', estado: 'Inactivo' }
  ];

  ngOnInit(): void {
    // Aquí puedes realizar peticiones a servicios backend en el futuro
  }

  // Método requerido por la plantilla HTML en la línea de "Total Registrados"
  obtenerTotalUsuarios(): number {
    return this.usuarios.length;
  }

  // Método para el evento (click) del botón
  mostrarMensaje(): void {
    alert('¡Panel de administración cargado correctamente!');
  }
}