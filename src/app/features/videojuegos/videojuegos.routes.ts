import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { DetalleVideojuegoComponent } from './pages/detalle-videojuego/detalle-videojuego.component';
import { ListadoVideojuegosComponent } from './pages/listado-videojuegos/listado-videojuegos.component';
import { PaginaFormularioVideojuegoComponent } from './pages/pagina-formulario-videojuego/pagina-formulario-videojuego.component';


export const VIDEOJUEGOS_ROUTES: Routes = [
  { path: '', component: ListadoVideojuegosComponent },
  { path: 'nuevo', component: PaginaFormularioVideojuegoComponent, canActivate: [adminGuard] },
  { path: 'editar/:id', component: PaginaFormularioVideojuegoComponent, canActivate: [adminGuard] },
  { path: ':id', component: DetalleVideojuegoComponent },
];
