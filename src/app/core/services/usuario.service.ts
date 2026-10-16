import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NuevoUsuario, UsuarioRegistrado } from '../models/usuario.model';
import { ejecutarPeticion } from '../utils/peticion-api';

const MENSAJE_BD_SIN_CONFIGURAR =
  'La base de datos de usuarios todavía no está configurada. Completá "usuariosApiUrl" en src/environments/environment.ts con la URL de tu recurso "usuarios" de MockAPI (ver README).';


@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.usuariosApiUrl.trim();

  
  buscarPorNombreUsuario(nombreUsuario: string): Observable<UsuarioRegistrado | null> {
    const parametros = new HttpParams().set('nombreUsuario', nombreUsuario);
    return this.ejecutar(() =>
      this.http.get<UsuarioRegistrado[]>(this.url, { params: parametros }).pipe(
        
        catchError((error) =>
          error instanceof HttpErrorResponse && error.status === 404
            ? of([] as UsuarioRegistrado[])
            : throwError(() => error),
        ),
        
        map(
          (lista) =>
            lista.find((u) => u.nombreUsuario.toLowerCase() === nombreUsuario.toLowerCase()) ?? null,
        ),
      ),
    );
  }

  crear(usuario: NuevoUsuario): Observable<UsuarioRegistrado> {
    return this.ejecutar(() => this.http.post<UsuarioRegistrado>(this.url, usuario));
  }

  actualizar(usuario: UsuarioRegistrado): Observable<UsuarioRegistrado> {
    return this.ejecutar(() =>
      this.http.put<UsuarioRegistrado>(`${this.url}/${usuario.id}`, usuario),
    );
  }

  private ejecutar<T>(peticion: () => Observable<T>): Observable<T> {
    return ejecutarPeticion(this.url, MENSAJE_BD_SIN_CONFIGURAR, peticion);
  }
}
