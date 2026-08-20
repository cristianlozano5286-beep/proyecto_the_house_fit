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

import { TiendaComponent } from './pages/tienda/tienda';

import { CalculadoraImcComponent } from './pages/calculadora-imc/calculadora-imc';


// Páginas del panel (protegidas)
import { DashboardComponent } from './pages/dashboard/dashboard';
import { UsersComponent } from './pages/users/users';

import { ResenasComponent } from './pages/resenas/resenas';
import { NoticiasAdminComponent } from './pages/noticias-admin/noticias-admin';
import { PagosComponent } from './pages/pagos/pagos';
import { RolesComponent } from './pages/roles/roles';


import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  // ---------- Sitio público (sin autenticación) ----------
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: InicioComponent },

      { path: 'tienda', component: TiendaComponent },

      { path: 'imc', component: CalculadoraImcComponent },

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
      { path: 'resenas', component: ResenasComponent },
      { path: 'noticias', component: NoticiasAdminComponent },
      { path: 'pagos', component: PagosComponent },
      { path: 'roles', component: RolesComponent },
    ],
  },

  // ---------- Ruta comodín ----------
  { path: '**', redirectTo: '' },
];
