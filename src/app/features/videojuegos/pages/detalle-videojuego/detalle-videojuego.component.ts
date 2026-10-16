import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { VideojuegoService } from '../../../../core/services/videojuego.service';
import { MensajeEstadoComponent } from '../../../../shared/components/mensaje-estado/mensaje-estado.component';
import { conEstado } from '../../../../shared/utils/estado-carga';

@Component({
  selector: 'app-detalle-videojuego',
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MensajeEstadoComponent,
  ],
  templateUrl: './detalle-videojuego.component.html',
  styleUrl: './detalle-videojuego.component.css',
})
export class DetalleVideojuegoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly servicio = inject(VideojuegoService);
  protected readonly auth = inject(AuthService);
  protected readonly estado$ = this.route.paramMap.pipe(
    map((parametros) => parametros.get('id') ?? ''),
    switchMap((id) => conEstado(this.servicio.obtenerVideojuegoPorId(id))),
  );
}
