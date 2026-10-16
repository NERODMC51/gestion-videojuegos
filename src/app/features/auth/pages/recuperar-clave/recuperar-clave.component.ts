import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { ConfirmacionMatcher, clavesIguales } from '../../../../shared/validators/claves-iguales.validator';
import { mensajeConfirmacion, mensajeDeError } from '../../../../shared/utils/mensajes-validacion';


@Component({
  selector: 'app-recuperar-clave',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './recuperar-clave.component.html',
})
export class RecuperarClaveComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificacion = inject(NotificacionService);

  protected readonly matcher = new ConfirmacionMatcher();
  protected readonly paso = signal<1 | 2>(1);
  protected readonly pregunta = signal('');
  protected readonly errorMensaje = signal('');
  protected readonly cargando = signal(false);

  protected readonly formUsuario = this.fb.group({
    nombreUsuario: ['', Validators.required],
  });

  protected readonly formRestablecer = this.fb.group(
    {
      respuesta: ['', Validators.required],
      clave: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
      confirmar: ['', Validators.required],
    },
    { validators: clavesIguales },
  );

  protected error(campo: string): string {
    return mensajeDeError(this.formRestablecer.get(campo));
  }

  protected errorConfirmacion(): string {
    return mensajeConfirmacion(this.formRestablecer);
  }

  protected buscarCuenta(): void {
    if (this.formUsuario.invalid) {
      this.formUsuario.markAllAsTouched();
      return;
    }
    this.errorMensaje.set('');
    this.cargando.set(true);

    this.auth
      .obtenerPreguntaSecreta(this.formUsuario.controls.nombreUsuario.value)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (pregunta) => {
          this.pregunta.set(pregunta);
          this.paso.set(2);
        },
        error: (error: Error) => this.errorMensaje.set(error.message),
      });
  }

  protected restablecer(): void {
    if (this.formRestablecer.invalid) {
      this.formRestablecer.markAllAsTouched();
      return;
    }
    const { respuesta, clave } = this.formRestablecer.getRawValue();
    this.errorMensaje.set('');
    this.cargando.set(true);

    this.auth
      .restablecerClave(this.formUsuario.controls.nombreUsuario.value, respuesta, clave)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => {
          this.notificacion.mostrar('Contraseña actualizada. Iniciá sesión con la nueva.');
          this.router.navigate(['/login']);
        },
        error: (error: Error) => this.errorMensaje.set(error.message),
      });
  }

  protected volverAlPaso1(): void {
    this.errorMensaje.set('');
    this.formRestablecer.reset();
    this.paso.set(1);
  }
}
