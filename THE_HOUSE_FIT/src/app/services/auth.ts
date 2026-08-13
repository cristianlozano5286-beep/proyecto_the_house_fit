import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UsuarioAuth } from '../models/usuario-auth';

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
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

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

  constructor() {
    this.cargarUsuarios();
  }

  private cargarUsuarios(): void {
    if (!this.isBrowser) {
      this.usuariosSistema = [...this.usuariosIniciales];
      return;
    }
    const datos = localStorage.getItem(STORAGE_USUARIOS);
    if (datos) {
      this.usuariosSistema = JSON.parse(datos);
    } else {
      this.usuariosSistema = [...this.usuariosIniciales];
      this.guardarUsuarios();
    }
  }

  private guardarUsuarios(): void {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_USUARIOS, JSON.stringify(this.usuariosSistema));
  }

  estaAutenticado(): boolean {
    if (!this.isBrowser) return false;
    return localStorage.getItem(this.STORAGE_KEY) != null;
  }

  obtenerUsuario(): UsuarioAuth | null {
    if (!this.isBrowser) return null;
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

  listarUsuariosSistema(): UsuarioSistema[] {
    return this.usuariosSistema;
  }

  actualizarRol(correo: string, nuevoRol: string): void {
    const usuario = this.usuariosSistema.find((u) => u.correo === correo);
    if (usuario) {
      usuario.rol = nuevoRol;
      this.guardarUsuarios();
      const sesion = this.obtenerUsuario();
      if (sesion && sesion.correo === correo) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ ...sesion, rol: nuevoRol }));
      }
    }
  }
}