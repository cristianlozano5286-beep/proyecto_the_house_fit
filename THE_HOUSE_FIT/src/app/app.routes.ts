import { Routes } from '@angular/router';

// Autenticación
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { RecuperarPasswordComponent } from './pages/recuperar-password/recuperar-password';

// Layouts
import { LayoutComponent } from './layout/layout/layout';
import { PublicLayoutComponent } from './layout/public-layout/public-layout';
import { MiEspacioLayoutComponent } from './layout/mi-espacio-layout/mi-espacio-layout';

// Páginas públicas
import { InicioComponent } from './pages/inicio/inicio';
import { CatalogoGimnasiosComponent } from './pages/catalogo-gimnasios/catalogo-gimnasios';
import { RutinasComponent } from './pages/rutinas/rutinas';
import { DetalleRutinasComponent } from './pages/detalle-rutinas/detalle-rutinas';
import { TiendaComponent } from './pages/tienda/tienda';
import { BlogPublicoComponent } from './pages/blog-publico/blog-publico';
import { CalculadoraImcComponent } from './pages/calculadora-imc/calculadora-imc';
import { ContenidoDestacadoComponent } from './pages/contenido-destacado/contenido-destacado';

// Páginas del panel (protegidas)
import { DashboardComponent } from './pages/dashboard/dashboard';
import { UsersComponent } from './pages/users/users';
import { GimnasiosAdminComponent } from './pages/gimnasios-admin/gimnasios-admin';
import { PublicarGimnasioComponent } from './pages/publicar-gimnasio/publicar-gimnasio';
import { InstructoresAdminComponent } from './pages/instructores-admin/instructores-admin';
import { ProductosAdminComponent } from './pages/productos-admin/productos-admin';
import { ContenidoAdminComponent } from './pages/contenido-admin/contenido-admin';
import { EntrenamientoComponent } from './pages/entrenamiento/entrenamiento';
import { ResenasComponent } from './pages/resenas/resenas';
import { NoticiasAdminComponent } from './pages/noticias-admin/noticias-admin';
import { PagosComponent } from './pages/pagos/pagos';
import { RolesComponent } from './pages/roles/roles';
import { ReservarClaseComponent } from './pages/reservar-clase/reservar-clase';
import { NutricionComponent } from './pages/nutricion/nutricion';
import { PerfilComponent } from './pages/perfil/perfil';
import { ContabilidadMembresiasComponent } from './pages/contabilidad-membresias/contabilidad-membresias';

import { authGuard } from './guards/auth-guard';
import { rolGuard } from './guards/rol-guard';

export const routes: Routes = [
  // ---------- Apartado Dedicado en Pantalla Completa (Mi Perfil · Todos los Roles) ----------
  { path: 'mi-perfil', component: PerfilComponent, canActivate: [authGuard] },

  // ---------- Apartados Dedicados en Pantalla Completa (Creador Gym / Admin) ----------
  { path: 'contabilidad-gestion', component: ContabilidadMembresiasComponent, canActivate: [authGuard, rolGuard], data: { roles: ['Administrador', 'Creador gym'] } },
  { path: 'contabilidad-membresias', component: ContabilidadMembresiasComponent, canActivate: [authGuard, rolGuard], data: { roles: ['Administrador', 'Creador gym'] } },
  { path: 'publicar-gimnasio', component: PublicarGimnasioComponent, canActivate: [authGuard, rolGuard], data: { roles: ['Administrador', 'Creador gym'] } },
  { path: 'editar-gimnasio', component: PublicarGimnasioComponent, canActivate: [authGuard, rolGuard], data: { roles: ['Administrador', 'Creador gym'] } },
  { path: 'instructores-gestion', component: InstructoresAdminComponent, canActivate: [authGuard, rolGuard], data: { roles: ['Administrador', 'Creador gym'] } },
  { path: 'productos-gestion', component: ProductosAdminComponent, canActivate: [authGuard, rolGuard], data: { roles: ['Administrador', 'Creador gym'] } },
  { path: 'contenido-gestion', component: ContenidoAdminComponent, canActivate: [authGuard, rolGuard], data: { roles: ['Administrador', 'Creador gym', 'Entrenador'] } },
  { path: 'noticias-gestion', component: NoticiasAdminComponent, canActivate: [authGuard, rolGuard], data: { roles: ['Administrador', 'Creador gym'] } },

  // ---------- Apartados Dedicados en Pantalla Completa (Usuario) ----------
  {
    path: 'mi-espacio',
    component: MiEspacioLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'entrenamiento', pathMatch: 'full' },
      { path: 'entrenamiento', component: EntrenamientoComponent },
      { path: 'reservar-clase', component: ReservarClaseComponent },
      { path: 'resenas', component: ResenasComponent },
      { path: 'pagos', component: PagosComponent },
    ],
  },

  // ---------- Sitio principal (requiere registrarse e iniciar sesión) ----------
  {
    path: '',
    component: PublicLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', component: InicioComponent },
      { path: 'gimnasios', component: CatalogoGimnasiosComponent },
      { path: 'rutinas', component: RutinasComponent },
      { path: 'rutina/:id', component: DetalleRutinasComponent },
      { path: 'rutinas/:id', component: DetalleRutinasComponent },
      { path: 'tienda', component: TiendaComponent },
      { path: 'noticias', component: BlogPublicoComponent },
      { path: 'blog', redirectTo: 'noticias', pathMatch: 'full' },
      { path: 'imc', component: CalculadoraImcComponent },
      { path: 'destacados', component: ContenidoDestacadoComponent },
      { path: 'nutricion', component: NutricionComponent }
    ],
  },

  // ---------- Autenticación ----------
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'recuperar-password', component: RecuperarPasswordComponent },

  // ---------- Panel administrativo (requiere sesión) ----------
  {
    path: 'panel',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'perfil', redirectTo: '/mi-perfil', pathMatch: 'full' },
      { path: 'contabilidad-membresias', redirectTo: '/contabilidad-gestion', pathMatch: 'full' },
      { path: 'usuarios', component: UsersComponent, canActivate: [rolGuard], data: { roles: ['Administrador', 'Creador gym'] } },
      { path: 'gimnasios', redirectTo: '/editar-gimnasio', pathMatch: 'full' },
      { path: 'mi-gimnasio', redirectTo: '/editar-gimnasio', pathMatch: 'full' },
      { path: 'gimnasios-admin', redirectTo: '/editar-gimnasio', pathMatch: 'full' },
      { path: 'instructores', redirectTo: '/instructores-gestion', pathMatch: 'full' },
      { path: 'productos', redirectTo: '/productos-gestion', pathMatch: 'full' },
      { path: 'contenido', redirectTo: '/contenido-gestion', pathMatch: 'full' },
      { path: 'entrenamiento', redirectTo: '/mi-espacio/entrenamiento', pathMatch: 'full' },
      { path: 'reservar-clase', redirectTo: '/mi-espacio/reservar-clase', pathMatch: 'full' },
      { path: 'resenas', redirectTo: '/mi-espacio/resenas', pathMatch: 'full' },
      { path: 'noticias', redirectTo: '/noticias-gestion', pathMatch: 'full' },
      { path: 'pagos', redirectTo: '/mi-espacio/pagos', pathMatch: 'full' },
      { path: 'roles', component: RolesComponent, canActivate: [rolGuard], data: { roles: ['Administrador'] } },
    ],
  },

  // ---------- Ruta comodín ----------
  { path: '**', redirectTo: 'login' },
];