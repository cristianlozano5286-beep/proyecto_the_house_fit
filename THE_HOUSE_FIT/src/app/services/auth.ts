import { Injectable } from '@angular/core';
import { ApiService, mensajeDeError, reemplazarLista } from './api';

export interface UsuarioAuth {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  fotoPerfil?: string;
}

export interface UsuarioSistema extends UsuarioAuth {
  correoVerificado: boolean;
}

// lo que responde el MID cuando alguien inicia sesión
interface RespuestaSesion {
  token: string;
  usuario: UsuarioAuth;
}

/*
  Ahora el login, el registro, el código de verificación y la
  recuperación de contraseña los hace el MID (que guarda en PostgreSQL).
  Acá solo se guarda en el navegador el token y los datos de la sesión.
  Las funciones que hablan con el MID devuelven null si salió bien,
  o el mensaje de error si algo falló.
*/
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'usuarioSesion';
  private readonly STORAGE_TOKEN = 'tokenSesion';

  // lista de usuarios, solo la puede traer el Administrador
  private usuariosSistema: UsuarioSistema[] = [];

  constructor(private api: ApiService) {}

  // ------------------- LOGIN -------------------
  async iniciarSesion(correo: string, password: string): Promise<string | null> {
    try {
      const respuesta = await this.api.crear<RespuestaSesion>('/auth/login', {
        correo: correo.trim().toLowerCase(),
        password,
      });
      this.guardarSesion(respuesta);
      return null;
    } catch (error) {
      return mensajeDeError(error);
    }
  }

  guardarSesion(respuesta: RespuestaSesion): void {
    const correoKey = respuesta.usuario?.correo?.trim().toLowerCase() ?? '';
    const fotoGuardadaLocal = correoKey
      ? localStorage.getItem('thehousefit_foto_' + correoKey) ?? ''
      : '';
    const usuarioFinal: UsuarioAuth = {
      ...respuesta.usuario,
      fotoPerfil: respuesta.usuario.fotoPerfil || fotoGuardadaLocal || '',
    };
    if (correoKey && usuarioFinal.fotoPerfil) {
      localStorage.setItem('thehousefit_foto_' + correoKey, usuarioFinal.fotoPerfil);
    }
    localStorage.setItem(this.STORAGE_TOKEN, respuesta.token);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuarioFinal));
    localStorage.setItem('usuarioLogueado', 'true');
  }

  cerrarSesion(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STORAGE_TOKEN);
    localStorage.removeItem('usuarioLogueado');
    reemplazarLista(this.usuariosSistema, []);
  }

  estaAutenticado(): boolean {
    return (
      localStorage.getItem('usuarioLogueado') === 'true' &&
      Boolean(localStorage.getItem(this.STORAGE_TOKEN)) &&
      Boolean(localStorage.getItem(this.STORAGE_KEY))
    );
  }

  obtenerToken(): string {
    return localStorage.getItem(this.STORAGE_TOKEN) ?? '';
  }

  obtenerUsuario(): UsuarioAuth | null {
    const usuario = localStorage.getItem(this.STORAGE_KEY);
    if (!usuario) return null;
    try {
      return JSON.parse(usuario) as UsuarioAuth;
    } catch {
      return null;
    }
  }

  obtenerRol(): string {
    return this.obtenerUsuario()?.rol ?? '';
  }

  obtenerNombre(): string {
    return this.obtenerUsuario()?.nombre ?? '';
  }

  obtenerCorreo(): string {
    return this.obtenerUsuario()?.correo ?? '';
  }

  obtenerFotoPerfil(): string {
    const u = this.obtenerUsuario();
    if (!u) return '';
    if (u.fotoPerfil) return u.fotoPerfil;
    const correoKey = u.correo?.trim().toLowerCase() ?? '';
    return correoKey ? localStorage.getItem('thehousefit_foto_' + correoKey) ?? '' : '';
  }

  async sincronizarPerfil(): Promise<UsuarioAuth | null> {
    if (!this.estaAutenticado()) return null;
    try {
      const perfil = await this.api.obtener<UsuarioAuth>('/auth/perfil');
      if (perfil && perfil.id) {
        const correoKey = perfil.correo?.trim().toLowerCase() ?? '';
        const fotoFinal =
          perfil.fotoPerfil ||
          (correoKey ? localStorage.getItem('thehousefit_foto_' + correoKey) ?? '' : '');
        const fusionado: UsuarioAuth = { ...perfil, fotoPerfil: fotoFinal };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(fusionado));
        if (correoKey && fotoFinal) {
          localStorage.setItem('thehousefit_foto_' + correoKey, fotoFinal);
        }
        return fusionado;
      }
      return this.obtenerUsuario();
    } catch {
      return this.obtenerUsuario();
    }
  }

  async actualizarPerfil(cambios: {
    nombre?: string;
    fotoPerfil?: string;
  }): Promise<{ error: string | null; usuario?: UsuarioAuth }> {
    const actual = this.obtenerUsuario();
    if (!actual) {
      return { error: 'Debes iniciar sesión para editar tu perfil.' };
    }
    try {
      const actualizado = await this.api.actualizar<UsuarioAuth>('/auth/perfil', cambios);
      const fusionado: UsuarioAuth = {
        ...actual,
        ...actualizado,
        nombre: cambios.nombre !== undefined ? cambios.nombre.trim() : actualizado?.nombre || actual.nombre,
        fotoPerfil:
          cambios.fotoPerfil !== undefined
            ? cambios.fotoPerfil
            : actualizado?.fotoPerfil ?? actual.fotoPerfil ?? '',
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(fusionado));
      const correoKey = fusionado.correo?.trim().toLowerCase() ?? '';
      if (correoKey) {
        if (fusionado.fotoPerfil) {
          localStorage.setItem('thehousefit_foto_' + correoKey, fusionado.fotoPerfil);
        } else {
          localStorage.removeItem('thehousefit_foto_' + correoKey);
        }
      }
      return { error: null, usuario: fusionado };
    } catch (error) {
      return { error: mensajeDeError(error) };
    }
  }

  async registrarUsuario(
    nombre: string,
    correo: string,
    password: string,
    rol: 'Usuario' | 'Creador gym' = 'Usuario',
  ): Promise<{ error: string | null; mensaje?: string }> {
    try {
      const respuesta = await this.api.crear<{ mensaje: string }>('/auth/registro', {
        nombre, correo: correo.trim().toLowerCase(), password, rol,
      });
      return { error: null, mensaje: respuesta.mensaje };
    } catch (error) {
      return { error: mensajeDeError(error) };
    }
  }

  async enviarCodigoVerificacion(correo: string): Promise<string | null> {
    try {
      await this.api.crear('/auth/codigo', { correo: correo.trim().toLowerCase() });
      return null;
    } catch (error) {
      return mensajeDeError(error);
    }
  }

  async verificarCodigo(correo: string, codigo: string): Promise<string | null> {
    try {
      const respuesta = await this.api.crear<RespuestaSesion>('/auth/verificar', {
        correo: correo.trim().toLowerCase(),
        codigo: codigo.trim(),
      });
      if (respuesta && respuesta.token) {
        this.guardarSesion(respuesta);
      }
      return null;
    } catch (error) {
      return mensajeDeError(error);
    }
  }

  // ------------------- RECUPERAR CONTRASEÑA -------------------
  async solicitarRecuperacion(correo: string): Promise<string | null> {
    try {
      await this.api.crear('/auth/recuperar', { correo: correo.trim().toLowerCase() });
      return null;
    } catch (error) {
      return mensajeDeError(error);
    }
  }

  async restablecerPassword(correo: string, codigo: string, nuevaPassword: string): Promise<string | null> {
    try {
      await this.api.crear('/auth/restablecer', {
        correo: correo.trim().toLowerCase(),
        codigo: codigo.trim(),
        nuevaPassword,
      });
      return null;
    } catch (error) {
      return mensajeDeError(error);
    }
  }

  // ------------------- GESTIÓN DE ROLES -------------------
  async cargarUsuarios(): Promise<void> {
    const lista = await this.api.obtener<UsuarioSistema[]>('/usuarios');
    reemplazarLista(this.usuariosSistema, lista);
  }

  listarUsuariosSistema(): UsuarioSistema[] {
    return this.usuariosSistema;
  }

  async actualizarRol(correo: string, nuevoRol: string): Promise<string | null> {
    const correoLimpio = correo.trim().toLowerCase();
    const usuario = this.usuariosSistema.find((u) => u.correo.toLowerCase() === correoLimpio);
    if (!usuario) return 'No se encontró el usuario.';

    try {
      await this.api.actualizar('/usuarios/' + usuario.id + '/rol', { rol: nuevoRol });
      usuario.rol = nuevoRol;
      return null;
    } catch (error) {
      return mensajeDeError(error);
    }
  }
}
