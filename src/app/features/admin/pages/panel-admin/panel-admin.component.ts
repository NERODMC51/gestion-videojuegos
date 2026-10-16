import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, startWith, switchMap, tap } from 'rxjs';
import { DiapositivaInicio, IdDiapositivaInicio } from '../../../../core/models/diapositiva-inicio.model';
import { ContenidoInicioService } from '../../../../core/services/contenido-inicio.service';
import { Videojuego } from '../../../../core/models/videojuego.model';
import { AuthService } from '../../../../core/services/auth.service';
import { VisitasService } from '../../../../core/services/visitas.service';
import { VideojuegoService } from '../../../../core/services/videojuego.service';
import { MensajeEstadoComponent } from '../../../../shared/components/mensaje-estado/mensaje-estado.component';
import { conEstado } from '../../../../shared/utils/estado-carga';

@Component({
  selector: 'app-panel-admin',
  imports: [AsyncPipe, CurrencyPipe, FormsModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, RouterLink, MensajeEstadoComponent],
  templateUrl: './panel-admin.component.html',
  styleUrl: './panel-admin.component.css',
})
export class PanelAdminComponent {
  private readonly videojuegos = inject(VideojuegoService);
  protected readonly auth = inject(AuthService);
  protected readonly visitas = inject(VisitasService);
  protected readonly contenidoInicio = inject(ContenidoInicioService);
  protected readonly mensajeContenido = signal('');
  private readonly recargar$ = new Subject<void>();
  protected readonly actualizando = signal(false);
  protected readonly actualizadoA = signal('');
  protected readonly estado$ = this.recargar$.pipe(
    startWith(undefined),
    switchMap(() =>
      conEstado(this.videojuegos.obtenerVideojuegos()).pipe(
        tap((estado) => {
          if (!estado.cargando) {
            this.actualizando.set(false);
            if (!estado.error) {
              this.actualizadoA.set(
                new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
              );
            }
          }
        }),
      ),
    ),
  );

  protected actualizar(): void {
    this.actualizando.set(true);
    this.recargar$.next();
  }

  protected cambiarDiapositiva(id: IdDiapositivaInicio, cambios: Partial<DiapositivaInicio>): void {
    this.contenidoInicio.actualizar(id, cambios);
    this.mensajeContenido.set('Hay cambios sin guardar.');
  }

  protected visibles(): number {
    return this.contenidoInicio.diapositivas().filter((diapositiva) => diapositiva.visible).length;
  }

  protected guardarContenido(): void {
    this.mensajeContenido.set(
      this.contenidoInicio.guardar()
        ? 'Cambios guardados en este navegador.'
        : 'No se pudieron guardar los cambios en este navegador.',
    );
  }

  protected restaurarContenido(): void {
    this.contenidoInicio.restaurar();
    this.mensajeContenido.set('Se restauraron los textos iniciales. Guardá los cambios para aplicarlos.');
  }

  protected rutaEdicion(videojuego: Videojuego): unknown[] {
    return ['/videojuegos/editar', videojuego.id];
  }
}
