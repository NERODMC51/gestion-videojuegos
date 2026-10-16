import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CarritoService } from '../../../../core/services/carrito.service';

@Component({
  selector: 'app-checkout',
  imports: [CurrencyPipe, FormsModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
  protected readonly carrito = inject(CarritoService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly nombre = signal(this.auth.usuario()?.nombre ?? '');
  protected readonly email = signal('');
  protected readonly direccion = signal('');

  protected finalizar(): void {
    if (!this.carrito.cantidad()) return;
    this.carrito.vaciar();
    this.router.navigate(['/compra-confirmada']);
  }
}
