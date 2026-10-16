import { Injectable, computed, signal } from '@angular/core';
import { Videojuego } from '../models/videojuego.model';

export interface LineaCarrito {
  videojuego: Videojuego;
  cantidad: number;
}

const CLAVE_CARRITO = 'gamevault-carrito';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly _lineas = signal<LineaCarrito[]>(this.leerCarrito());
  readonly lineas = this._lineas.asReadonly();
  readonly cantidad = computed(() => this._lineas().reduce((total, linea) => total + linea.cantidad, 0));
  readonly total = computed(() =>
    this._lineas().reduce((total, linea) => total + linea.videojuego.precio * linea.cantidad, 0),
  );

  agregar(videojuego: Videojuego): void {
    const linea = this._lineas().find((item) => String(item.videojuego.id) === String(videojuego.id));
    this.guardar(
      linea
        ? this._lineas().map((item) =>
            String(item.videojuego.id) === String(videojuego.id)
              ? { ...item, cantidad: item.cantidad + 1 }
              : item,
          )
        : [...this._lineas(), { videojuego, cantidad: 1 }],
    );
  }

  cambiarCantidad(id: Videojuego['id'], cantidad: number): void {
    if (cantidad < 1) {
      this.quitar(id);
      return;
    }
    this.guardar(
      this._lineas().map((linea) =>
        String(linea.videojuego.id) === String(id) ? { ...linea, cantidad } : linea,
      ),
    );
  }

  quitar(id: Videojuego['id']): void {
    this.guardar(this._lineas().filter((linea) => String(linea.videojuego.id) !== String(id)));
  }

  vaciar(): void {
    this.guardar([]);
  }

  private guardar(lineas: LineaCarrito[]): void {
    this._lineas.set(lineas);
    try {
      localStorage.setItem(CLAVE_CARRITO, JSON.stringify(lineas));
    } catch {
      return;
    }
  }

  private leerCarrito(): LineaCarrito[] {
    try {
      const datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO) ?? '[]') as LineaCarrito[];
      return Array.isArray(datos)
        ? datos.filter((linea) => linea?.videojuego?.id !== undefined && linea.cantidad > 0)
        : [];
    } catch {
      return [];
    }
  }
}
