import { Injectable, signal } from '@angular/core';
import { DiapositivaInicio, IdDiapositivaInicio } from '../models/diapositiva-inicio.model';

const CLAVE_CONTENIDO = 'gamevault-contenido-inicio';

const DIAPOSITIVAS_INICIALES: DiapositivaInicio[] = [
  {
    id: 'aventura',
    etiqueta: 'DESTACADO EN GAMEVAULT',
    titulo: 'Tu próxima gran aventura empieza acá.',
    descripcion: 'Explorá nuevos mundos, encontrá tus favoritos y sumalos a tu colección.',
    textoBoton: 'Explorar catálogo',
    visible: true,
  },
  {
    id: 'accion',
    etiqueta: 'PARA CADA ESTILO DE JUEGO',
    titulo: 'Acción, rol y mundos por descubrir.',
    descripcion: 'Filtrá por género o plataforma y encontrá el juego ideal para vos.',
    textoBoton: 'Ver todos los juegos',
    visible: true,
  },
  {
    id: 'ofertas',
    etiqueta: 'DESCUBRÍ MÁS OPCIONES',
    titulo: 'Grandes juegos. Nuevas oportunidades.',
    descripcion: 'Consultá ofertas para PC disponibles en un servicio externo.',
    textoBoton: 'Explorar ofertas',
    visible: true,
  },
];

@Injectable({ providedIn: 'root' })
export class ContenidoInicioService {
  private readonly _diapositivas = signal(this.leer());
  readonly diapositivas = this._diapositivas.asReadonly();
  readonly hayCambiosPendientes = signal(false);

  actualizar(id: IdDiapositivaInicio, cambios: Partial<DiapositivaInicio>): void {
    this._diapositivas.update((diapositivas) =>
      diapositivas.map((diapositiva) =>
        diapositiva.id === id ? { ...diapositiva, ...cambios, id } : diapositiva,
      ),
    );
    this.hayCambiosPendientes.set(true);
  }

  guardar(): boolean {
    try {
      localStorage.setItem(CLAVE_CONTENIDO, JSON.stringify(this._diapositivas()));
      this.hayCambiosPendientes.set(false);
      return true;
    } catch {
      return false;
    }
  }

  restaurar(): void {
    this._diapositivas.set(DIAPOSITIVAS_INICIALES.map((diapositiva) => ({ ...diapositiva })));
    this.hayCambiosPendientes.set(true);
  }

  private leer(): DiapositivaInicio[] {
    try {
      const contenido = localStorage.getItem(CLAVE_CONTENIDO);
      if (!contenido) {
        return DIAPOSITIVAS_INICIALES.map((diapositiva) => ({ ...diapositiva }));
      }

      const guardadas = JSON.parse(contenido) as Partial<DiapositivaInicio>[];
      if (!Array.isArray(guardadas)) {
        return DIAPOSITIVAS_INICIALES.map((diapositiva) => ({ ...diapositiva }));
      }

      return DIAPOSITIVAS_INICIALES.map((inicial) => {
        const guardada = guardadas.find((diapositiva) => diapositiva.id === inicial.id);
        return {
          ...inicial,
          ...(typeof guardada?.etiqueta === 'string' ? { etiqueta: guardada.etiqueta } : {}),
          ...(typeof guardada?.titulo === 'string' ? { titulo: guardada.titulo } : {}),
          ...(typeof guardada?.descripcion === 'string' ? { descripcion: guardada.descripcion } : {}),
          ...(typeof guardada?.textoBoton === 'string' ? { textoBoton: guardada.textoBoton } : {}),
          ...(typeof guardada?.visible === 'boolean' ? { visible: guardada.visible } : {}),
        };
      });
    } catch {
      return DIAPOSITIVAS_INICIALES.map((diapositiva) => ({ ...diapositiva }));
    }
  }
}
