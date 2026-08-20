import { Routes } from '@angular/router';

// Autenticación
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
// Layouts
// Páginas públicas
import { InicioComponent } from './pages/inicio/inicio';
// Páginas del panel (protegidas)
import { DashboardComponent } from './pages/dashboard/dashboard';
import { UsersComponent } from './pages/users/users';
import { ProductosAdminComponent } from './pages/productos-admin/productos-admin';
import { ResenasComponent } from './pages/resenas/resenas';
import { RolesComponent } from './pages/roles/roles';
import { authGuard } from './guards/auth-guard';
export const routes: Routes = [
  // ---------- Sitio público (sin autenticación) ----------

  // ---------- Autenticación ----------
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  

  // ---------- Panel administrativo (requiere sesión) ----------
  {
    path: 'panel',
    component: LayoutComponent,
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

  // ---------- Ruta comodín ----------
  { path: '**', redirectTo: '' },
];
