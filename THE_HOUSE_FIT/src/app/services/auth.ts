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
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'usuarioSesion';

  private usuariosIniciales: UsuarioSistema[] = [
    {
      nombre: 'Administrador The House Fit',
      correo: 'admin@thehousefit.com',
      password: '123456',
      rol: 'Administrador',
      correoVerificado: true,
    },
    {
      nombre: 'Marlon Monsalve',
      correo: 'entrenador@thehousefit.com',
      password: '123456',
      rol: 'Entrenador',
      correoVerificado: true,
    },
    {
      nombre: 'Andrés Torres',
      correo: 'usuario@thehousefit.com',
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

  private cargarUsuarios(): void {
    const datos = localStorage.getItem(STORAGE_USUARIOS);
    if (datos) {
      this.usuariosSistema = JSON.parse(datos);
    } else {
      this.usuariosSistema = [...this.usuariosIniciales];
      this.guardarUsuarios();
    }
  }

  private guardarUsuarios(): void {
    localStorage.setItem(STORAGE_USUARIOS, JSON.stringify(this.usuariosSistema));
  }

  // ------------------- LOGIN -------------------
  iniciarSesion(correo: string, password: string): boolean {
    const correoLimpio = correo.trim().toLowerCase();
    const usuario = this.usuariosSistema.find((u) => u.correo.toLowerCase() === correoLimpio);
    if (!usuario) return false;
    if (usuario.password !== password) return false;

    const usuarioAuth: UsuarioAuth = {
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuarioAuth));
    localStorage.setItem('usuarioLogueado', 'true');
    return true;
  }

  cerrarSesion(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem('usuarioLogueado');
  }

  estaAutenticado(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) != null;
  }

  obtenerUsuario(): UsuarioAuth | null {
    const usuario = localStorage.getItem(this.STORAGE_KEY);
    if (!usuario) return null;
    return JSON.parse(usuario);
  }

  obtenerRol(): string {
    return this.obtenerUsuario()?.rol ?? '';
  }

  obtenerNombre(): string {
    return this.obtenerUsuario()?.nombre ?? '';
  }

  // ------------------- REGISTRO -------------------
  correoExiste(correo: string): boolean {
    const correoLimpio = correo.trim().toLowerCase();
    return this.usuariosSistema.some((u) => u.correo.toLowerCase() === correoLimpio);
  }

  registrarUsuario(nombre: string, correo: string, password: string): void {
    const nuevoUsuario: UsuarioSistema = {
      nombre,
      correo: correo.trim().toLowerCase(),
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
    this.codigoTemporal = { correo: correo.trim().toLowerCase(), codigo };
    return codigo;
  }

  verificarCodigo(correo: string, codigo: string): boolean {
    if (!this.codigoTemporal) return false;
    const correoLimpio = correo.trim().toLowerCase();
    const codigoLimpio = codigo.trim();

    const valido = this.codigoTemporal.correo === correoLimpio && this.codigoTemporal.codigo === codigoLimpio;
    if (valido) {
      const usuario = this.usuariosSistema.find((u) => u.correo.toLowerCase() === correoLimpio);
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
    const correoLimpio = correo.trim().toLowerCase();
    if (!this.correoExiste(correoLimpio)) return false;
    this.enviarCodigoVerificacion(correoLimpio);
    return true;
  }

  restablecerPassword(correo: string, codigo: string, nuevaPassword: string): boolean {
    const correoLimpio = correo.trim().toLowerCase();
    const valido = this.verificarCodigo(correoLimpio, codigo);
    if (!valido) return false;

    const usuario = this.usuariosSistema.find((u) => u.correo.toLowerCase() === correoLimpio);
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
    const correoLimpio = correo.trim().toLowerCase();
    const usuario = this.usuariosSistema.find((u) => u.correo.toLowerCase() === correoLimpio);
    if (usuario) {
      usuario.rol = nuevoRol;
      this.guardarUsuarios();
      const sesion = this.obtenerUsuario();
      if (sesion && sesion.correo.toLowerCase() === correoLimpio) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ ...sesion, rol: nuevoRol }));
      }
    }
  }
}