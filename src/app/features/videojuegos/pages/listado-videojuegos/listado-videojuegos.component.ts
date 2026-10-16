import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { Subject, filter, startWith, switchMap } from 'rxjs';
import { GENEROS, PLATAFORMAS, Videojuego } from '../../../../core/models/videojuego.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ContenidoInicioService } from '../../../../core/services/contenido-inicio.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { VideojuegoService } from '../../../../core/services/videojuego.service';
import { ConfirmarDialogoComponent } from '../../../../shared/components/confirmar-dialogo/confirmar-dialogo.component';
import { MensajeEstadoComponent } from '../../../../shared/components/mensaje-estado/mensaje-estado.component';
import { EstadoCarga, conEstado } from '../../../../shared/utils/estado-carga';
import { TarjetaVideojuegoComponent } from '../../components/tarjeta-videojuego/tarjeta-videojuego.component';

@Component({
  selector: 'app-listado-videojuegos',
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    TarjetaVideojuegoComponent,
    MensajeEstadoComponent,
  ],
  templateUrl: './listado-videojuegos.component.html',
  styleUrl: './listado-videojuegos.component.css',
})
export class ListadoVideojuegosComponent {
  private readonly servicio = inject(VideojuegoService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly notificacion = inject(NotificacionService);
  protected readonly auth = inject(AuthService);
  private readonly contenidoInicio = inject(ContenidoInicioService);
  protected readonly diapositivasInicio = computed(() =>
    this.contenidoInicio.diapositivas().filter((diapositiva) => diapositiva.visible),
  );

  protected readonly generos = GENEROS;
  protected readonly plataformas = PLATAFORMAS;

  protected readonly recomendaciones: Videojuego[] = [
    {
      id: 'demo-cyberpunk',
      nombre: 'Cyberpunk 2077',
      genero: 'RPG',
      plataforma: 'PC',
      precio: 0,
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg',
      descripcion: 'Recorré Night City en una aventura de rol y acción de mundo abierto.',
      fechaLanzamiento: '2020-12-10',
    },
    {
      id: 'demo-witcher',
      nombre: 'The Witcher 3: Wild Hunt',
      genero: 'RPG',
      plataforma: 'Xbox',
      precio: 0,
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg',
      descripcion: 'Explorá un enorme mundo de fantasía como el cazador de monstruos Geralt.',
      fechaLanzamiento: '2015-05-19',
    },
    {
      id: 'demo-elden-ring',
      nombre: 'Elden Ring',
      genero: 'Acción',
      plataforma: 'PlayStation',
      precio: 0,
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg',
      descripcion: 'Aventura de acción desafiante con exploración libre y grandes descubrimientos.',
      fechaLanzamiento: '2022-02-25',
    },
    {
      id: 'demo-hades',
      nombre: 'Hades',
      genero: 'Indie',
      plataforma: 'Nintendo Switch',
      precio: 0,
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg',
      descripcion: 'Combate veloz y partidas rejugables en una reinterpretación del inframundo griego.',
      fechaLanzamiento: '2020-09-17',
    },
    {
      id: 'demo-stardew',
      nombre: 'Stardew Valley',
      genero: 'Simulación',
      plataforma: 'PC',
      precio: 0,
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg',
      descripcion: 'Construí una granja, cultivá y conocé a los habitantes del valle a tu ritmo.',
      fechaLanzamiento: '2016-02-26',
    },
    {
      id: 'demo-hollow-knight',
      nombre: 'Hollow Knight',
      genero: 'Plataformas',
      plataforma: 'Nintendo Switch',
      precio: 0,
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg',
      descripcion: 'Descubrí un reino subterráneo de ruinas, secretos y combates exigentes.',
      fechaLanzamiento: '2017-02-24',
    },
    {
      id: 'demo-celeste',
      nombre: 'Celeste',
      genero: 'Plataformas',
      plataforma: 'PlayStation',
      precio: 0,
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/504230/header.jpg',
      descripcion: 'Superá desafíos de precisión y acompañá a Madeline en su ascenso a la montaña.',
      fechaLanzamiento: '2018-01-25',
    },
    {
      id: 'demo-portal-2',
      nombre: 'Portal 2',
      genero: 'Aventura',
      plataforma: 'PC',
      precio: 0,
      imagen: 'https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg',
      descripcion: 'Resolvé acertijos en primera persona con portales, humor y modo cooperativo.',
      fechaLanzamiento: '2011-04-19',
    },
  ];

  
  protected readonly busqueda = signal('');
  protected readonly generoElegido = signal('');
  protected readonly plataformaElegida = signal('');

  
  private readonly recargar$ = new Subject<void>();

  protected readonly estado = toSignal(
    this.recargar$.pipe(
      startWith(undefined),
      switchMap(() => conEstado(this.servicio.obtenerVideojuegos())),
    ),
    { initialValue: { cargando: true, datos: null, error: null } as EstadoCarga<Videojuego[]> },
  );

  protected readonly usaRecomendaciones = computed(
    () => this.estado().datos !== null && this.estado().datos?.length === 0 && !this.estado().error,
  );

  protected readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const genero = this.generoElegido();
    const plataforma = this.plataformaElegida();
    const juegos = this.usaRecomendaciones() ? this.recomendaciones : (this.estado().datos ?? []);

    return juegos.filter(
      (v) =>
        (!texto || v.nombre.toLowerCase().includes(texto)) &&
        (!genero || v.genero === genero) &&
        (!plataforma || v.plataforma === plataforma),
    );
  });

  protected readonly hayFiltros = computed(
    () => !!(this.busqueda().trim() || this.generoElegido() || this.plataformaElegida()),
  );

  protected recargar(): void {
    this.recargar$.next();
  }

  protected limpiarFiltros(): void {
    this.busqueda.set('');
    this.generoElegido.set('');
    this.plataformaElegida.set('');
  }

  protected contadorPromo(indice: number, total: number): string {
    return `${String(indice + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  }

  
  protected verDetalle(videojuego: Videojuego): void {
    this.router.navigate(['/videojuegos', videojuego.id]);
  }

  protected editar(videojuego: Videojuego): void {
    this.router.navigate(['/videojuegos/editar', videojuego.id]);
  }

  protected eliminar(videojuego: Videojuego): void {
    this.dialog
      .open(ConfirmarDialogoComponent, {
        data: {
          titulo: 'Eliminar videojuego',
          mensaje: `¿Seguro que querés eliminar "${videojuego.nombre}"? Esta acción no se puede deshacer.`,
          textoConfirmar: 'Eliminar',
        },
      })
      .afterClosed()
      .pipe(
        filter((confirmado) => confirmado === true),
        switchMap(() => this.servicio.eliminarVideojuego(videojuego.id)),
      )
      .subscribe({
        next: () => {
          this.notificacion.mostrar(`Se eliminó "${videojuego.nombre}".`);
          this.recargar();
        },
        error: (error: Error) => this.notificacion.mostrar(error.message),
      });
  }
}
