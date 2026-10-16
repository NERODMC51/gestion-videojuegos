import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'resumen' })
export class ResumenPipe implements PipeTransform {
  transform(texto: string | null | undefined, maximo = 80): string {
    if (!texto) {
      return '';
    }
    return texto.length <= maximo ? texto : texto.slice(0, maximo).trimEnd() + '…';
  }
}
