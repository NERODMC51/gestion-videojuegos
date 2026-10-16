import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, map, of, switchMap, tap, throwError } from 'rxjs';
import { DatosRegistro, NuevoUsuario, Usuario, UsuarioRegistrado } from '../models/usuario.model';
import { generarSal, hashear } from '../utils/hash';
import { UsuarioService } from './usuario.service';


const CLAVE_SESION = 'gamevault-sesion';

interface UsuarioDemo extends Usuario {
  clave: string;
}

const USUARIOS_DEMO: UsuarioDemo[] = [
  { nombreUsuario: 'admin', clave: 'admin123', nombre: 'Administrador', rol: 'admin' },
];

const normalizar = (texto: string): string => texto.trim().toLowerCase();
const esUsuarioDemo = (nombreUsuario: string): boolean =>
  USUARIOS_DEMO.some((u) => u.nombreUsuario === nombreUsuario);

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly usuarios = inject(UsuarioService);

  private readonly _usuario = signal<Usuario | null>(this.leerSesionGuardada());

  
  readonly usuario = this._usuario.asReadonly();
  readonly estaAutenticado = computed(() => this._usuario() !== null);
  readonly esAdmin = computed(() => this._usuario()?.rol === 'admin');

  

  
  iniciarSesion(nombreUsuario: string, clave: string): Observable<boolean> {
    return this.validarCredenciales(normalizar(nombreUsuario), clave).pipe(
      tap((usuario) => {
        if (usuario) {
          this.guardarSesion(usuario);
        }
      }),
      map((usuario) => usuario !== null),
    );
  }

  
  cerrarSesion(): void {
    localStorage.removeItem(CLAVE_SESION);
    this._usuario.set(null);
    this.router.navigate(['/videojuegos']);
  }

  cerrarAdminAlEntrarAlInicio(): void {
    if (!this.esAdmin()) {
      return;
    }
    localStorage.removeItem(CLAVE_SESION);
    this._usuario.set(null);
  }

  

  
  registrar(datos: DatosRegistro): Observable<void> {
    const nombreUsuario = normalizar(datos.nombreUsuario);
    if (esUsuarioDemo(nombreUsuario)) {
      return throwError(() => new Error('Ese nombre de usuario no está disponible.'));
    }

    return this.usuarios.buscarPorNombreUsuario(nombreUsuario).pipe(
      switchMap((existente) =>
        existente
          ? throwError(() => new Error('Ese nombre de usuario ya está en uso. Elegí otro.'))
          : from(this.armarRegistro(datos, nombreUsuario)),
      ),
      switchMap((nuevo) => this.usuarios.crear(nuevo)),
      map(() => undefined),
    );
  }

  

  
  obtenerPreguntaSecreta(nombreUsuario: string): Observable<string> {
    return this.buscarCuentaRecuperable(nombreUsuario).pipe(map((u) => u.preguntaSecreta));
  }

  
  restablecerClave(nombreUsuario: string, respuesta: string, nuevaClave: string): Observable<void> {
    return this.buscarCuentaRecuperable(nombreUsuario).pipe(
      switchMap((cuenta) =>
        from(hashear(normalizar(respuesta), cuenta.salRespuesta)).pipe(
          map((hash) => ({ cuenta, correcta: hash === cuenta.respuestaHash })),
        ),
      ),
      switchMap(({ cuenta, correcta }) => {
        if (!correcta) {
          return throwError(() => new Error('La respuesta no es correcta.'));
        }
        return from(this.generarClaveHasheada(nuevaClave)).pipe(
          switchMap((claveNueva) => this.usuarios.actualizar({ ...cuenta, ...claveNueva })),
        );
      }),
      map(() => undefined),
    );
  }

  

  private validarCredenciales(nombreUsuario: string, clave: string): Observable<Usuario | null> {
    const demo = USUARIOS_DEMO.find((u) => u.nombreUsuario === nombreUsuario);
    if (demo) {
      return of(
        demo.clave === clave
          ? { nombreUsuario: demo.nombreUsuario, nombre: demo.nombre, rol: demo.rol }
          : null,
      );
    }

    return this.usuarios.buscarPorNombreUsuario(nombreUsuario).pipe(
      switchMap((registrado) => {
        if (!registrado) {
          return of(null);
        }
        return from(hashear(clave, registrado.sal)).pipe(
          map((hash): Usuario | null =>
            hash === registrado.claveHash
              ? { nombreUsuario: registrado.nombreUsuario, nombre: registrado.nombre, rol: 'usuario' }
              : null,
          ),
        );
      }),
    );
  }

  private buscarCuentaRecuperable(nombreUsuario: string): Observable<UsuarioRegistrado> {
    const nombre = normalizar(nombreUsuario);
    if (esUsuarioDemo(nombre)) {
      return throwError(() => new Error('Las cuentas de demostración no se pueden recuperar.'));
    }
    return this.usuarios.buscarPorNombreUsuario(nombre).pipe(
      switchMap((cuenta) =>
        cuenta
          ? of(cuenta)
          : throwError(() => new Error('No encontramos una cuenta con ese nombre de usuario.')),
      ),
    );
  }

  private async generarClaveHasheada(clave: string): Promise<{ sal: string; claveHash: string }> {
    const sal = generarSal();
    return { sal, claveHash: await hashear(clave, sal) };
  }

  private async armarRegistro(datos: DatosRegistro, nombreUsuario: string): Promise<NuevoUsuario> {
    const salRespuesta = generarSal();
    return {
      nombreUsuario,
      nombre: datos.nombre.trim(),
      ...(await this.generarClaveHasheada(datos.clave)),
      preguntaSecreta: datos.preguntaSecreta,
      salRespuesta,
      respuestaHash: await hashear(normalizar(datos.respuesta), salRespuesta),
    };
  }

  private guardarSesion(usuario: Usuario): void {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
    this._usuario.set(usuario);
  }

  private leerSesionGuardada(): Usuario | null {
    try {
      const texto = localStorage.getItem(CLAVE_SESION);
      if (!texto) {
        return null;
      }
      const usuario = JSON.parse(texto) as Usuario;
      const rolValido = usuario.rol === 'admin' || usuario.rol === 'usuario';
      return rolValido && usuario.nombre ? usuario : null;
    } catch {
      return null;
    }
  }
}
