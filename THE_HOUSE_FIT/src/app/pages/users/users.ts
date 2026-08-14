import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';



interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  estado: boolean;
}


const STORAGE_KEY='usuariosSistema';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, NgForOf, NgIf],
  templateUrl: './users.html',
  styleUrl: './users.css',
})

export class UsersComponent implements OnInit {
  id: number = 0;
  nombre: string = '';
  apellido: string = '';
  correo: string = '';
  rol: string = 'Usuario';
  estado: boolean = true;
  /**Listas de usuarios, un arreglo de usuario */

  usuarios: Usuario[] = [];
  //lista filtrada
  usuariosFiltrados: Usuario[] = [];
  //input de busqueda
  textoBusqueda: string = '';
  //implementacion del filtro
  filtroRol: String = '';
  //Id en edición
  idEditar: number | null = null;

  //pagina actual
  paginaActual: number = 1;

  //cantidad de registro por pagina
  registrosPorPagina: number = 10;

  //Lista que realmente muestra la tabla osea paginada
  usuariosPaginados: Usuario[] = [];

  // columnba actualemte ordenada
  columnaOrden: string = '';

  // direcion de orden
  //true -> ascendente
  //false -> descendente

  ordenAscendente: boolean = true;

  mensaje: string = '';
  tipoMensaje: 'success' | 'error' | '' = '';

  //bandera para saber si se esta editando un usurio

  modoEdicion: boolean = false;
  //mostrar o no mostral el modal
  mostrarModalEliminar: boolean = false;
   //usuario a eliminar

  usuarioSeleccionado: Usuario | null = null;

  ngOnInit(): void {
    this.cargarUsuarios();
    this.actualizarPaginacion();
  }

  cargarDatosInciales(): void {
    this.usuarios = [
      {
        id: 1,
        nombre: 'Carlos',
        apellido: 'Martinez',
        correo: 'admin@thehousefit.com',
        rol: 'Administrador',
        estado: true,
      },
      {
        id: 2,
        nombre: 'Maria',
        apellido: 'Rodriguez',
        correo: 'entrenador@thehousefit.com',
        rol: 'Entrenador',
        estado: true,
      },
      {
        id: 3,
        nombre: 'Juan',
        apellido: 'Gomez',
        correo: 'usuario@thehousefit.com',
        rol: 'Usuario',
        estado: false,
      },
    ];
  }

  validarCorreo(correo: string): boolean {
    const expresion = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[a-zA]{2,}$/;
    return expresion.test(correo);
  }

  correoExiste(correo: string, idUsuario: number | null = null): boolean {
    return this.usuarios.some(
      (usuario) =>
        usuario.correo.toLowerCase() === correo.toLowerCase() && usuario.id !== idUsuario,
    );
  }

  limpiarFormulario(): void {
    const respuesta = confirm('¿Desea Limpiar el formulario');

    if (!respuesta) {
      return;
    }
    this.id = 0;
    this.nombre = '';
    this.apellido = '';
    this.correo = '';
    this.rol = 'Usuario';
    this.estado = true;
    this.mensaje = '';
  }

  registrarUsuario(): void {
    //Validacion de campos
    if (this.nombre.trim() === '' || this.apellido.trim() === '' || this.correo.trim() === '') {
      this.tipoMensaje = 'error';
      this.mensaje = 'Todos los campos son obligatorios';
      return;
    }

    //validacion correo
    if (!this.validarCorreo(this.correo)) {
      this.tipoMensaje = 'error';
      this.mensaje = 'El formato del correo es incorrecto.';
      return;
    }

    // validar duplicado
    if (this.correoExiste(this.correo, this.idEditar)) {
      this.tipoMensaje = 'error';
      this.mensaje = 'El correo ya se encuentra registrado.';
      return;
    }

    if (this.idEditar != null) {
      const usuariobuscado = this.usuarios.find((usuario) => usuario.id == this.idEditar);

      if (usuariobuscado) {
        usuariobuscado.nombre = this.nombre;
        usuariobuscado.apellido = this.apellido;
        usuariobuscado.correo = this.correo;
        usuariobuscado.rol = this.rol;
        usuariobuscado.estado = this.estado;
      }
      this.idEditar = null;
      this.guardarUsuarios();
      this.buscarUsuarios();
      this.actualizarPaginacion()
      alert('Usuario Actualizado');
      this.limpiarFormularioAutomatico();
      return;
    }

    /**Se construye un nuevo objeo usuario utilizando la informacion ingresada
     * en el formulario
     */
    const nuevoUsuario: Usuario = {
      id: this.usuarios.length + 1,
      nombre: this.nombre,
      apellido: this.apellido,
      correo: this.correo,
      rol: this.rol,
      estado: this.estado,
    };
    //Agrega el nuevo objeto al arreglo
    this.usuarios.push(nuevoUsuario);
    this.guardarUsuarios();
    this.buscarUsuarios();
    this.tipoMensaje = 'success';
    this.mensaje = 'Usuario registrado correctamente.';

    this.limpiarFormularioAutomatico();
  }

  limpiarFormularioAutomatico(): void {
    this.id = 0;
    this.nombre = '';
    this.apellido = '';
    this.correo = '';
    this.rol = 'Usuario';
    this.estado = true;
  }

  obtenerTotalUsuarios(): number {
    return this.usuarios.length;
  }

  buscarUsuarios(): void {
    this.usuariosFiltrados = this.usuarios.filter((usuario) => {
      const coincideTexto =
        usuario.nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
        usuario.apellido.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
        usuario.correo.toLowerCase().includes(this.textoBusqueda.toLowerCase());

      const coincideRol = this.filtroRol == '' || usuario.rol == this.filtroRol;

      this.paginaActual = 1;
      if (this.columnaOrden !== '') {
        this.ordenar(this.columnaOrden);
      }
      this.actualizarPaginacion();

      return coincideTexto && coincideRol;
    });
  }

  editarUsuario(usuario: Usuario): void {
    this.idEditar = usuario.id;
    this.nombre = usuario.nombre;
    this.apellido = usuario.apellido;
    this.correo = usuario.correo;
    this.rol = usuario.rol;
    this.estado = usuario.estado;
  }

  actualizarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;

    this.usuariosPaginados = this.usuariosFiltrados.slice(inicio, fin);
  }
  obtenerTotalPaginas(): number {
    return Math.ceil(this.usuariosFiltrados.length / this.registrosPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.obtenerTotalPaginas()) {
      return;
    }
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }
  siguientePagina(): void {
    this.cambiarPagina(this.paginaActual + 1);
  }
  anteriorPagina(): void {
    this.cambiarPagina(this.paginaActual - 1);
  }
  obtenerPaginas(): number[] {
    return Array.from(
      {
        length: this.obtenerTotalPaginas(),
      },
      (_, indice) => indice + 1,
    );
  }

  ordenar(columna: string): void {
    if (this.columnaOrden === columna) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.columnaOrden = columna;
      this.ordenAscendente = true;
    }

    this.usuariosFiltrados.sort((a: Usuario, b: Usuario) => {
      let valorA: any;
      let valorB: any;
      switch (columna) {
        case 'id':
          valorA = a.id;
          valorB = b.id;
          break;
        case 'nombre':
          valorA = a.nombre.toLowerCase();
          valorB = b.nombre.toLowerCase();
          break;
        case 'rol':
          valorA = a.rol.toLowerCase();
          valorB = b.rol.toLowerCase();
          break;
        case 'estado':
          valorA = a.estado ? 1 : 0;
          valorB = b.estado ? 1 : 0;
          break;
        default:
          return 0;
      }
      if (valorA < valorB) {
        return this.ordenAscendente ? -1 : 1;
      }
      if (valorA > valorB) {
        return this.ordenAscendente ? 1 : -1;
      }
      return 0;
    });

    this.actualizarPaginacion();
  }

  obtenerIconoOrden(columna: string): string {
    if (this.columnaOrden !== columna) {
      return '↕';
    }
    return this.ordenAscendente ? '↑' : '↓';
  }

  abriModalEliminar(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.mostrarModalEliminar = true;
  }

  cerrarModal(): void {
    this.mostrarModalEliminar = false;
    this.usuarioSeleccionado = null;
  }

  confirmarEliminar(): void {
    if (!this.usuarioSeleccionado) {
      return;
    }

    this.usuarios = this.usuarios.filter((usuario) => usuario.id !== this.usuarioSeleccionado!.id);
    // actualiza busqueda, filtros, el oredenamiento y la pginacion
    this.guardarUsuarios();
    this.buscarUsuarios();
    this.actualizarPaginacion();

    //Mensaje de exitos
    this.tipoMensaje = 'success';
    this.mensaje = 'Usuario eliminado correctamente';

    //cerrar el modal
    this.cerrarModal();
  }
  
  guardarUsuarios():void{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.usuarios))
    
  }  
  cargarUsuarios():void{
    const datos= localStorage.getItem(STORAGE_KEY)
    if(datos){
      this.usuarios= JSON.parse(datos);
    }else{
      this.cargarDatosInciales();
      this.guardarUsuarios();
    }
    this.usuariosFiltrados=[...this.usuarios];
  }
  reiniciarDatos():void{
    const respuesta = confirm('Desea Resturar los usuarios Iniciales')
    if(!respuesta){
      return
    }
    localStorage.removeItem(STORAGE_KEY)
    this.cargarUsuarios();
    this.buscarUsuarios();
  }
}
