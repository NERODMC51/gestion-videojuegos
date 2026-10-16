import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs';
import { MensajeEstadoComponent } from '../../../../shared/components/mensaje-estado/mensaje-estado.component';
import { conEstado } from '../../../../shared/utils/estado-carga';
import { OfertasService } from '../../services/ofertas.service';

@Component({
  selector: 'app-ofertas',
  imports: [
    AsyncPipe,
    CurrencyPipe,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MensajeEstadoComponent,
  ],
  templateUrl: './ofertas.component.html',
  styleUrl: './ofertas.component.css',
})
export class OfertasComponent {
  private readonly servicio = inject(OfertasService);

  
  protected readonly titulo = signal(
    inject(ActivatedRoute).snapshot.queryParamMap.get('titulo') ?? '',
  );

  protected readonly estado$ = toObservable(this.titulo).pipe(
    startWith(this.titulo()),
    debounceTime(350),
    map((texto) => texto.trim()),
    distinctUntilChanged(),
    switchMap((texto) => conEstado(this.servicio.buscarOfertas(texto))),
  );
}
