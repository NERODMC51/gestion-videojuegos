import { Observable, catchError, throwError } from 'rxjs';
import { traducirErrorHttp } from './errores-http';


export function ejecutarPeticion<T>(
  url: string,
  mensajeSinConfigurar: string,
  peticion: () => Observable<T>,
): Observable<T> {
  if (!url) {
    return throwError(() => new Error(mensajeSinConfigurar));
  }
  return peticion().pipe(
    catchError((error) => throwError(() => new Error(traducirErrorHttp(error)))),
  );
}
