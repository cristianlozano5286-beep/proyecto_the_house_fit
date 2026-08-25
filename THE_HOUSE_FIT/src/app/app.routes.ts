import { Routes } from '@angular/router';

// Autenticación
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { RecuperarPasswordComponent } from './pages/recuperar-password/recuperar-password';

// Layouts
import { LayoutComponent } from './layout/layout/layout';
import { PublicLayoutComponent } from './layout/public-layout/public-layout';

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
import { InstructoresAdminComponent } from './pages/instructores-admin/instructores-admin';
import { ProductosAdminComponent } from './pages/productos-admin/productos-admin';
import { ContenidoAdminComponent } from './pages/contenido-admin/contenido-admin';
import { EntrenamientoComponent } from './pages/entrenamiento/entrenamiento';
import { ResenasComponent } from './pages/resenas/resenas';
import { NoticiasAdminComponent } from './pages/noticias-admin/noticias-admin';
import { PagosComponent } from './pages/pagos/pagos';
import { RolesComponent } from './pages/roles/roles';
import { ReservarClaseComponent } from './pages/reservar-clase/reservar-clase';

import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  // ---------- Sitio público (sin autenticación) ----------
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: InicioComponent },
      { path: 'gimnasios', component: CatalogoGimnasiosComponent },
      { path: 'rutinas', component: RutinasComponent },
      { path: 'rutina/:id', component: DetalleRutinasComponent },
      { path: 'tienda', component: TiendaComponent },
      { path: 'blog', component: BlogPublicoComponent },
      { path: 'imc', component: CalculadoraImcComponent },
      { path: 'destacados', component: ContenidoDestacadoComponent },
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
      { path: 'usuarios', component: UsersComponent },
      { path: 'gimnasios', component: GimnasiosAdminComponent },
      { path: 'instructores', component: InstructoresAdminComponent },
      { path: 'productos', component: ProductosAdminComponent },
      { path: 'contenido', component: ContenidoAdminComponent },
      { path: 'entrenamiento', component: EntrenamientoComponent },
      { path: 'reservar-clase', component: ReservarClaseComponent },
      { path: 'resenas', component: ResenasComponent },
      { path: 'noticias', component: NoticiasAdminComponent },
      { path: 'pagos', component: PagosComponent },
      { path: 'roles', component: RolesComponent },
    ],
  },

  // ---------- Ruta comodín ----------
  { path: '**', redirectTo: 'login' },
];