import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarraNavegacionComponent } from './shared/components/barra-navegacion/barra-navegacion.component';
import { VisitasService } from './core/services/visitas.service';
import { AuthService } from './core/services/auth.service';
import { LateralAdminComponent } from './shared/components/lateral-admin/lateral-admin.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BarraNavegacionComponent, LateralAdminComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly auth = inject(AuthService);

  constructor() {
    inject(VisitasService).registrarVisita();
  }
}
