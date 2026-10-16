import { Injectable, signal } from '@angular/core';

const CLAVE_VISITAS = 'gamevault-visitas';
const CLAVE_SESION_VISITA = 'gamevault-visita-registrada';

@Injectable({ providedIn: 'root' })
export class VisitasService {
  readonly total = signal(this.leerTotal());

  registrarVisita(): void {
    try {
      if (sessionStorage.getItem(CLAVE_SESION_VISITA)) return;
      const nuevoTotal = this.total() + 1;
      localStorage.setItem(CLAVE_VISITAS, String(nuevoTotal));
      sessionStorage.setItem(CLAVE_SESION_VISITA, '1');
      this.total.set(nuevoTotal);
    } catch {
      return;
    }
  }

  private leerTotal(): number {
    try {
      const total = Number(localStorage.getItem(CLAVE_VISITAS) ?? 0);
      return Number.isFinite(total) && total >= 0 ? total : 0;
    } catch {
      return 0;
    }
  }
}
