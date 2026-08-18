import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout';
import { InicioComponent } from './pages/inicio/inicio';
import { RegisterComponent } from './pages/register/register';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ResenasComponent } from './pages/resenas/resenas';
// Importación de componentes
import { LoginComponent } from './pages/login/login';
// Descomenta/ajusta las importaciones de tus otros componentes a medida que los uses:
// import { RegisterComponent } from './pages/register/register';
// import { DashboardComponent } from './pages/dashboard/dashboard';

export const routes: Routes = [
  // 1. Redirección automática de la raíz '/' hacia '/login'
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // 2. Ruta del Login
  {
    path: 'login',
    component: LoginComponent,
  },

  // 3. Comodín: cualquier ruta no encontrada redirige a 'login'
  {
    path: '**',
    redirectTo: 'login',
  },
];

