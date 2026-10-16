import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { PREGUNTAS_SECRETAS } from '../../../../core/models/usuario.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { ConfirmacionMatcher, clavesIguales } from '../../../../shared/validators/claves-iguales.validator';
import { mensajeConfirmacion, mensajeDeError } from '../../../../shared/utils/mensajes-validacion';

@Component({
  selector: 'app-registro',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './registro.component.html',
})
export class RegistroComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificacion = inject(NotificacionService);

  protected readonly preguntas = PREGUNTAS_SECRETAS;
  protected readonly matcher = new ConfirmacionMatcher();
  protected readonly errorRegistro = signal('');
  protected readonly cargando = signal(false);

  protected readonly formulario = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(40)]],
      nombreUsuario: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]{3,20}$/)]],
      clave: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
      confirmar: ['', Validators.required],
      preguntaSecreta: ['', Validators.required],
      respuesta: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    },
    { validators: clavesIguales },
  );

  protected error(campo: string): string {
    return mensajeDeError(
      this.formulario.get(campo),
      'Usá de 3 a 20 caracteres: letras, números o guion bajo (sin espacios).',
    );
  }

  protected errorConfirmacion(): string {
    return mensajeConfirmacion(this.formulario);
  }

  protected registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const { confirmar, ...datos } = this.formulario.getRawValue();
    this.errorRegistro.set('');
    this.cargando.set(true);

    this.auth
      .registrar(datos)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => {
          this.notificacion.mostrar('Cuenta creada. Ya podés iniciar sesión.');
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          this.router.navigate(['/login'], {
            queryParams: returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? { returnUrl } : undefined,
          });
        },
        error: (error: Error) => this.errorRegistro.set(error.message),
      });
  }
}
