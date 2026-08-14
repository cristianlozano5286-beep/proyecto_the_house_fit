import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface UsuarioAuth {
  nombre: string;
  correo: string;
  rol: string;
}

export interface UsuarioSistema extends UsuarioAuth {
  password: string;
  correoVerificado: boolean;
}

const STORAGE_USUARIOS = 'fitzone_usuariosSistema';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID); // Identificador de plataforma (Servidor vs Navegador)
  private readonly STORAGE_KEY = 'usuarioSesion';

  private usuariosIniciales: UsuarioSistema[] = [
    {
      nombre: 'Administrador FitZone',
      correo: '@adminfitzone.com',
      password: '123456',
      rol: 'Administrador',
      correoVerificado: true,
    },
    {
      nombre: 'Marlon Monsalve',
      correo: 'entrenador@fitzone.com',
      password: '123456',
      rol: 'Entrenador',
      correoVerificado: true,
    },
    {
      nombre: 'Andrés Torres',
      correo: 'usuario@fitzone.com',
      password: '123456',
      rol: 'Usuario',
      correoVerificado: true,
    },
  ];

  private usuariosSistema: UsuarioSistema[] = [];
  private codigoTemporal: { correo: string; codigo: string } | null = null;

  constructor() {
    this.cargarUsuarios();
  }

  // Comprueba de forma segura si estamos ejecutando en el navegador
  private esNavegador(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private cargarUsuarios(): void {
    if (!this.esNavegador()) return; // Evita que se ejecute en el servidor Node.js

    const datos = localStorage.getItem(STORAGE_USUARIOS);
    if (datos) {
      this.usuariosSistema = JSON.parse(datos);
    } else {
      this.usuariosSistema = [...this.usuariosIniciales];
      this.guardarUsuarios();
    }
  }

  private guardarUsuarios(): void {
    if (!this.esNavegador()) return;
    localStorage.setItem(STORAGE_USUARIOS, JSON.stringify(this.usuariosSistema));
  }

  // ------------------- LOGIN -------------------
  inciarSesion(correo: string, password: string): boolean {
    const usuario = this.usuariosSistema.find((u) => u.correo === correo);
    if (!usuario || usuario.password !== password) {
      return false;
    }

    const usuarioAuth: UsuarioAuth = {
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    };

    if (this.esNavegador()) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuarioAuth));
      localStorage.setItem('usuarioLogueado', 'true');
    }
    return true;
  }

  cerrarSesion(): void {
    if (this.esNavegador()) {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem('usuarioLogueado');
    }
  }

  estaAutenticado(): boolean {
    if (!this.esNavegador()) return false;
    return localStorage.getItem(this.STORAGE_KEY) != null;
  }

  obtenerUsuario(): UsuarioAuth | null {
    if (!this.esNavegador()) return null;
    const usuario = localStorage.getItem(this.STORAGE_KEY);
    return usuario ? JSON.parse(usuario) : null;
  }

  obtenerRol(): string {
    return this.obtenerUsuario()?.rol ?? '';
  }

  obtenerNombre(): string {
    return this.obtenerUsuario()?.nombre ?? '';
  }

  // ------------------- REGISTRO -------------------
  correoExiste(correo: string): boolean {
    return this.usuariosSistema.some((u) => u.correo.toLowerCase() === correo.toLowerCase());
  }

  registrarUsuario(nombre: string, correo: string, password: string): void {
    const nuevoUsuario: UsuarioSistema = {
      nombre,
      correo,
      password,
      rol: 'Usuario',
      correoVerificado: false,
    };
    this.usuariosSistema.push(nuevoUsuario);
    this.guardarUsuarios();
  }

  // ------------------- VERIFICACIÓN DE CORREO -------------------
  enviarCodigoVerificacion(correo: string): string {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    this.codigoTemporal = { correo, codigo };
    return codigo;
  }

  verificarCodigo(correo: string, codigo: string): boolean {
    if (!this.codigoTemporal) return false;
    const valido = this.codigoTemporal.correo === correo && this.codigoTemporal.codigo === codigo;
    if (valido) {
      const usuario = this.usuariosSistema.find((u) => u.correo === correo);
      if (usuario) {
        usuario.correoVerificado = true;
        this.guardarUsuarios();
      }
      this.codigoTemporal = null;
    }
    return valido;
  }

  // ------------------- RECUPERAR CONTRASEÑA -------------------
  solicitarRecuperacion(correo: string): boolean {
    if (!this.correoExiste(correo)) return false;
    this.enviarCodigoVerificacion(correo);
    return true;
  }

  restablecerPassword(correo: string, codigo: string, nuevaPassword: string): boolean {
    const valido = this.verificarCodigo(correo, codigo);
    if (!valido) return false;
    const usuario = this.usuariosSistema.find((u) => u.correo === correo);
    if (usuario) {
      usuario.password = nuevaPassword;
      this.guardarUsuarios();
      return true;
    }
    return false;
  }

  obtenerUltimoCodigo(): string | null {
    return this.codigoTemporal?.codigo ?? null;
  }

  // ------------------- GESTIÓN DE ROLES -------------------
  listarUsuariosSistema(): UsuarioSistema[] {
    return this.usuariosSistema;
  }

  actualizarRol(correo: string, nuevoRol: string): void {
    const usuario = this.usuariosSistema.find((u) => u.correo === correo);
    if (usuario) {
      usuario.rol = nuevoRol;
      this.guardarUsuarios();

      const sesion = this.obtenerUsuario();
      if (sesion && sesion.correo === correo && this.esNavegador()) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ ...sesion, rol: nuevoRol }));
      }
    }
>> release
  }
}