import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { inicioGuard } from './core/guards/inicio.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [inicioGuard], children: [] },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./features/auth/pages/registro/registro.component').then((m) => m.RegistroComponent),
  },
  {
    path: 'recuperar-clave',
    loadComponent: () =>
      import('./features/auth/pages/recuperar-clave/recuperar-clave.component').then(
        (m) => m.RecuperarClaveComponent,
      ),
  },
  {
    
    path: 'videojuegos',
    loadChildren: () =>
      import('./features/videojuegos/videojuegos.routes').then((m) => m.VIDEOJUEGOS_ROUTES),
  },
  {
    path: 'ofertas',
    loadComponent: () =>
      import('./features/api-externa/pages/ofertas/ofertas.component').then(
        (m) => m.OfertasComponent,
      ),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/pages/panel-admin/panel-admin.component').then(
        (m) => m.PanelAdminComponent,
      ),
  },
  {
    path: 'no-autorizado',
    loadComponent: () =>
      import('./shared/components/pagina-mensaje/pagina-mensaje.component').then(
        (m) => m.PaginaMensajeComponent,
      ),
    data: {
      icono: 'lock',
      titulo: 'Acceso restringido',
      mensaje: 'Esta sección es solo para administradores.',
    },
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/pagina-mensaje/pagina-mensaje.component').then(
        (m) => m.PaginaMensajeComponent,
      ),
    data: {
      icono: 'search_off',
      titulo: 'Página no encontrada',
      mensaje: 'La dirección que buscás no existe.',
    },
  },
];
