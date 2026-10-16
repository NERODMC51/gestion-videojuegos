import { CurrencyPipe } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Videojuego } from '../../../../core/models/videojuego.model';
import { ResumenPipe } from '../../../../shared/pipes/resumen.pipe';


@Component({
  selector: 'app-tarjeta-videojuego',
  imports: [MatCardModule, MatButtonModule, MatIconModule, CurrencyPipe, ResumenPipe],
  templateUrl: './tarjeta-videojuego.component.html',
  styleUrl: './tarjeta-videojuego.component.css',
})
export class TarjetaVideojuegoComponent {
  videojuego = input.required<Videojuego>(); 
  esAdmin = input(false);

  ver = output<Videojuego>(); 
  editar = output<Videojuego>();
  eliminar = output<Videojuego>();

  protected readonly imagenFallida = signal(false);
}
