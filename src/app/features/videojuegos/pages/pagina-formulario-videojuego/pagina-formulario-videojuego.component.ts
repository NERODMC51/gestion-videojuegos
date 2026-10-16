import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, finalize, of } from 'rxjs';
import { DatosVideojuego, Videojuego } from '../../../../core/models/videojuego.model';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { VideojuegoService } from '../../../../core/services/videojuego.service';
import { MensajeEstadoComponent } from '../../../../shared/components/mensaje-estado/mensaje-estado.component';
import { EstadoCarga, conEstado } from '../../../../shared/utils/estado-carga';
import { FormularioVideojuegoComponent } from '../../components/formulario-videojuego/formulario-videojuego.component';


@Component({
  selector: 'app-pagina-formulario-videojuego',
  imports: [AsyncPipe, FormularioVideojuegoComponent, MensajeEstadoComponent],
  templateUrl: './pagina-formulario-videojuego.component.html',
  styleUrl: './pagina-formulario-videojuego.component.css',
})
export class PaginaFormularioVideojuegoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly servicio = inject(VideojuegoService);
  private readonly notificacion = inject(NotificacionService);

  private readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly esEdicion = this.id !== null;
  protected readonly guardando = signal(false);

  
  protected readonly estado$: Observable<EstadoCarga<Videojuego>> = this.id
    ? conEstado(this.servicio.obtenerVideojuegoPorId(this.id))
    : of({ cargando: false, datos: null, error: null });

  protected guardar(datos: DatosVideojuego): void {
    this.guardando.set(true);

    const peticion$ = this.id
      ? this.servicio.actualizarVideojuego(this.id, datos)
      : this.servicio.crearVideojuego(datos);

    peticion$.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: (guardado) => {
        this.notificacion.mostrar(
          this.esEdicion ? 'Los cambios se guardaron correctamente.' : 'El videojuego se creó correctamente.',
        );
        
        this.router.navigate(['/videojuegos', guardado.id]);
      },
      error: (error: Error) => this.notificacion.mostrar(error.message),
    });
  }

  protected cancelar(): void {
    this.router.navigate(['/videojuegos']);
  }
}
