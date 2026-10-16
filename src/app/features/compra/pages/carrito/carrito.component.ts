import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CarritoService } from '../../../../core/services/carrito.service';

@Component({
  selector: 'app-carrito',
  imports: [CurrencyPipe, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css',
})
export class CarritoComponent {
  protected readonly carrito = inject(CarritoService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected continuar(): void {
    this.router.navigate(this.auth.estaAutenticado() ? ['/checkout'] : ['/login'], {
      queryParams: this.auth.estaAutenticado() ? undefined : { returnUrl: '/checkout' },
    });
  }
}
