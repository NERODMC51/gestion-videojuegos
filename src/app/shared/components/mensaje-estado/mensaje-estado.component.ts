import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type TipoEstado = 'cargando' | 'error' | 'vacio';


@Component({
  selector: 'app-mensaje-estado',
  imports: [MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  templateUrl: './mensaje-estado.component.html',
  styleUrl: './mensaje-estado.component.css',
})
export class MensajeEstadoComponent {
  tipo = input.required<TipoEstado>();
  texto = input('');
  conReintento = input(false);
  reintentar = output<void>();
}
