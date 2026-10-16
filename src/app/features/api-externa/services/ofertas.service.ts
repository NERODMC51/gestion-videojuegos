import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Oferta } from '../models/oferta.model';


interface OfertaCheapShark {
  dealID: string;
  title: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  thumb: string;
}


@Injectable({ providedIn: 'root' })
export class OfertasService {
  private readonly http = inject(HttpClient);

  buscarOfertas(titulo: string): Observable<Oferta[]> {
    let parametros = new HttpParams().set('pageSize', '12');
    if (titulo) {
      parametros = parametros.set('title', titulo);
    }

    return this.http
      .get<OfertaCheapShark[]>(`${environment.ofertasApiUrl}/deals`, { params: parametros })
      .pipe(
        map((ofertas) =>
          ofertas.map((o) => ({
            id: o.dealID,
            titulo: o.title,
            precioOferta: Number(o.salePrice),
            precioNormal: Number(o.normalPrice),
            ahorroPorcentaje: Math.round(Number(o.savings)),
            imagen: o.thumb,
            enlace: `https://www.cheapshark.com/redirect?dealID=${o.dealID}`,
          })),
        ),
        catchError(() =>
          throwError(
            () =>
              new Error(
                'No se pudo consultar el servicio de ofertas (CheapShark). Es independiente de tu catálogo; probá de nuevo más tarde.',
              ),
          ),
        ),
      );
  }
}
