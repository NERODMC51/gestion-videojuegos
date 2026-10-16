import { Observable, catchError, map, of, startWith } from 'rxjs';


export interface EstadoCarga<T> {
  cargando: boolean;
  datos: T | null;
  error: string | null;
}


export function conEstado<T>(origen$: Observable<T>): Observable<EstadoCarga<T>> {
  const inicial: EstadoCarga<T> = { cargando: true, datos: null, error: null };
  return origen$.pipe(
    map((datos): EstadoCarga<T> => ({ cargando: false, datos, error: null })),
    startWith(inicial),
    catchError((error: Error) =>
      of<EstadoCarga<T>>({ cargando: false, datos: null, error: error.message }),
    ),
  );
}
