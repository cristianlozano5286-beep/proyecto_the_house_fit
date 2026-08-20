import { UsuarioAuth } from '../models/usuario-auth';
import { Injectable } from '@angular/core';

export interface UsuarioSistema extends UsuarioAuth {
  password: string;
  correoVerificado: boolean;
}

const STORAGE_USUARIOS = 'thehousefit_usuariosSistema';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'usuarioSesion';

  // Usuarios semilla del sistema (roles del Módulo 7: Administrador, Entrenador, Usuario)
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

  // Código de verificación / recuperación simulado en memoria (HU04, HU05, HU07, HU08)
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

  // ------------------- LOGIN (HU09, HU10, HU11) -------------------
  inciarSesion(correo: string, password: string): boolean {
    const usuario = this.usuariosSistema.find((u) => u.correo === correo);
    if (!usuario) {
      return false;
    }
    if (usuario.password !== password) {
      return false;
    }

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
    if (!usuario) {
      return null;
    }
    return JSON.parse(usuario);
  }

  obtenerRol(): string {
    return this.obtenerUsuario()?.rol ?? '';
  }

  obtenerNombre(): string {
    return this.obtenerUsuario()?.nombre ?? '';
  }

  // ------------------- REGISTRO (HU01, HU02, HU03) -------------------
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

  // ------------------- VERIFICACIÓN DE CORREO (HU04, HU05) -------------------
  enviarCodigoVerificacion(correo: string): string {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    this.codigoTemporal = { correo, codigo };
    // Simulación de envío de correo: en un entorno real esto llamaría a un servicio de backend/SMTP.
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

  // ------------------- RECUPERAR CONTRASEÑA (HU06, HU07, HU08) -------------------
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

  // ------------------- GESTIÓN DE ROLES (HU44, HU45, HU46, HU47) -------------------
  listarUsuariosSistema(): UsuarioSistema[] {
    return this.usuariosSistema;
  }

  actualizarRol(correo: string, nuevoRol: string): void {
    const usuario = this.usuariosSistema.find((u) => u.correo === correo);
    if (usuario) {
      usuario.rol = nuevoRol;
      this.guardarUsuarios();
      // Si el usuario con sesión activa es el editado, se refleja el cambio
      const sesion = this.obtenerUsuario();
      if (sesion && sesion.correo === correo) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ ...sesion, rol: nuevoRol }));
      }
    }
  }
}
