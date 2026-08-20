import { Routes } from '@angular/router';

// Autenticación
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
// Layouts
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout';
// Páginas públicas
import { InicioComponent } from './pages/inicio/inicio';
// Páginas del panel (protegidas)
import { DashboardComponent } from './pages/dashboard/dashboard';

export const routes: Routes = [
  // ---------- Ruta inicial / raíz ----------
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirige la raíz al login

  // ---------- Sitio público (sin autenticación) ----------
  { path: 'inicio', component: InicioComponent },

  // ---------- Autenticación ----------
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // ---------- Panel administrativo (requiere sesión) ----------
  {
    path: 'panel',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'usuarios', component: UsersComponent },
      { path: 'productos', component: ProductosAdminComponent },
      { path: 'resenas', component: ResenasComponent },
      { path: 'roles', component: RolesComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
