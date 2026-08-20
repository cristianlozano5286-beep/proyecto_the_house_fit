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
  private platformId = inject(PLATFORM_ID);
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

  // Se inicializa siempre con el fallback por defecto para evitar arreglos vacíos por SSR
  private usuariosSistema: UsuarioSistema[] = [...this.usuariosIniciales];
  private codigoTemporal: { correo: string; codigo: string } | null = null;

  constructor() {
    this.cargarUsuarios();
  }

  private esNavegador(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private cargarUsuarios(): void {
    if (!this.esNavegador()) return;

    const datos = localStorage.getItem(STORAGE_USUARIOS);
    if (datos) {
      try {
        const parsed = JSON.parse(datos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.usuariosSistema = parsed;
        } else {
          this.restablecerUsuariosBase();
        }
      } catch {
        this.restablecerUsuariosBase();
      }
    } else {
      this.restablecerUsuariosBase();
    }
  }

  public restablecerUsuariosBase(): void {
    this.usuariosSistema = [...this.usuariosIniciales];
    this.guardarUsuarios();
  }

  private guardarUsuarios(): void {
    localStorage.setItem(STORAGE_USUARIOS, JSON.stringify(this.usuariosSistema));
  }

  // ------------------- LOGIN (HU09, HU10, HU11) -------------------
  inciarSesion(correo: string, password: string): boolean {
    // Si la lista está vacía en runtime (CSR/SSR mismatch), recarga desde el navegador
    if (this.usuariosSistema.length === 0) {
      this.cargarUsuarios();
    }

    const correoLimpio = correo ? correo.trim().toLowerCase() : '';
    const passLimpia = password ? password.trim() : '';
    
    const usuario = this.usuariosSistema.find(
      (u) => u.correo.trim().toLowerCase() === correoLimpio
    );

    if (!usuario || usuario.password.trim() !== passLimpia) {
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
    const correoLimpio = correo.trim().toLowerCase();
    return this.usuariosSistema.some((u) => u.correo.trim().toLowerCase() === correoLimpio);
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

  // ------------------- VERIFICACIÓN DE CORREO (HU04, HU05) -------------------
  enviarCodigoVerificacion(correo: string): string {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    this.codigoTemporal = { correo: correo.trim().toLowerCase(), codigo };
    return codigo;
  }

  verificarCodigo(correo: string, codigo: string): boolean {
    if (!this.codigoTemporal) return false;
    const correoLimpio = correo.trim().toLowerCase();
    const valido = this.codigoTemporal.correo === correoLimpio && this.codigoTemporal.codigo === codigo;
    if (valido) {
      const usuario = this.usuariosSistema.find((u) => u.correo.trim().toLowerCase() === correoLimpio);
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
    const usuario = this.usuariosSistema.find((u) => u.correo.trim().toLowerCase() === correo.trim().toLowerCase());
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
    const usuario = this.usuariosSistema.find((u) => u.correo.trim().toLowerCase() === correo.trim().toLowerCase());
    if (usuario) {
      usuario.rol = nuevoRol;
      this.guardarUsuarios();
      // Si el usuario con sesión activa es el editado, se refleja el cambio
      const sesion = this.obtenerUsuario();
      if (sesion && sesion.correo.trim().toLowerCase() === correo.trim().toLowerCase() && this.esNavegador()) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ ...sesion, rol: nuevoRol }));
      }
    }
  }
}
