import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly errorLogin = signal('');
  protected readonly cargando = signal(false);
  protected readonly returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

  protected readonly formulario = this.fb.group({
    usuario: ['', Validators.required],
    clave: ['', Validators.required],
  });

  protected iniciarSesion(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const { usuario, clave } = this.formulario.getRawValue();
    this.errorLogin.set('');
    this.cargando.set(true);

    this.auth
      .iniciarSesion(usuario, clave)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (correcto) => {
          if (correcto) {
            this.router.navigateByUrl(this.destinoSeguro());
          } else {
            this.errorLogin.set('Usuario o contraseña incorrectos.');
          }
        },
        error: (error: Error) => this.errorLogin.set(error.message),
      });
  }

  
  private destinoSeguro(): string {
    const destino = this.route.snapshot.queryParamMap.get('returnUrl');
    return destino && destino.startsWith('/') && !destino.startsWith('//')
      ? destino
      : this.auth.esAdmin()
        ? '/admin'
        : '/videojuegos';
  }
}
