import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-compra-confirmada',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './compra-confirmada.component.html',
  styleUrl: './compra-confirmada.component.css',
})
export class CompraConfirmadaComponent {}
