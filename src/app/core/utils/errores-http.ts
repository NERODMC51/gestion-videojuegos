import { HttpErrorResponse } from '@angular/common/http';


export function traducirErrorHttp(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Revisá tu conexión a internet y que la URL configurada sea correcta.';
    }
    if (error.status === 404) {
      return 'No se encontró lo que buscabas (error 404). Verificá la URL de la API y que el registro exista.';
    }
    if (error.status >= 500) {
      return `El servidor tuvo un problema (error ${error.status}). Probá de nuevo en unos minutos.`;
    }
    return `El servidor rechazó la solicitud (error ${error.status}).`;
  }
  return 'Ocurrió un error inesperado.';
}
