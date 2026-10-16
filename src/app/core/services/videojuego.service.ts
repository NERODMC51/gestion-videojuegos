import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DatosVideojuego, IdVideojuego, Videojuego } from '../models/videojuego.model';
import { ejecutarPeticion } from '../utils/peticion-api';

const MENSAJE_API_SIN_CONFIGURAR =
  'La API todavía no está configurada. Completá "apiUrl" en src/environments/environment.ts con la URL de tu recurso "videojuegos" de MockAPI (ver README).';

type VideojuegoApi = Partial<Omit<Videojuego, 'id' | 'nombre'>> & {
  id?: IdVideojuego;
  nombre?: string;
  name?: string;
};

function desdeApi(videojuego: VideojuegoApi): Videojuego {
  return {
    ...videojuego,
    id: videojuego.id ?? '',
    nombre: videojuego.name ?? videojuego.nombre ?? '',
  } as Videojuego;
}

function haciaApi(videojuego: DatosVideojuego, id: IdVideojuego): Record<string, unknown> {
  const { nombre, ...datos } = videojuego;
  return { ...datos, id, name: nombre };
}


@Injectable({ providedIn: 'root' })
export class VideojuegoService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl.trim();

  obtenerVideojuegos(): Observable<Videojuego[]> {
    return this.ejecutar(() =>
      this.http.get<VideojuegoApi[]>(this.url).pipe(map((juegos) => juegos.map(desdeApi))),
    );
  }

  obtenerVideojuegoPorId(id: IdVideojuego): Observable<Videojuego> {
    return this.ejecutar(() =>
      this.http.get<VideojuegoApi>(`${this.url}/${id}`).pipe(map(desdeApi)),
    );
  }

  crearVideojuego(videojuego: DatosVideojuego): Observable<Videojuego> {
    return this.ejecutar(() =>
      this.http.get<VideojuegoApi[]>(this.url).pipe(
        switchMap((juegos) => {
          const siguienteId = Math.max(0, ...juegos.map((juego) => Number(juego.id) || 0)) + 1;
          return this.http.post<VideojuegoApi>(this.url, haciaApi(videojuego, String(siguienteId)));
        }),
        map(desdeApi),
      ),
    );
  }

  actualizarVideojuego(id: IdVideojuego, videojuego: DatosVideojuego): Observable<Videojuego> {
    return this.ejecutar(() =>
      this.http
        .put<VideojuegoApi>(`${this.url}/${id}`, haciaApi(videojuego, id))
        .pipe(map(desdeApi)),
    );
  }

  eliminarVideojuego(id: IdVideojuego): Observable<Videojuego> {
    return this.ejecutar(() =>
      this.http.delete<VideojuegoApi>(`${this.url}/${id}`).pipe(map(desdeApi)),
    );
  }

  private ejecutar<T>(peticion: () => Observable<T>): Observable<T> {
    return ejecutarPeticion(this.url, MENSAJE_API_SIN_CONFIGURAR, peticion);
  }
}
