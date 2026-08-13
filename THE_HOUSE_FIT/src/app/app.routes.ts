import { Routes } from '@angular/router';

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