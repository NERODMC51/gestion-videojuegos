
export type IdVideojuego = string | number;

export const PLATAFORMAS = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'] as const;
export type Plataforma = (typeof PLATAFORMAS)[number];

export const GENEROS = [
  'Acción',
  'Aventura',
  'RPG',
  'Estrategia',
  'Deportes',
  'Carreras',
  'Simulación',
  'Plataformas',
  'Terror',
  'Indie',
] as const;


export interface Videojuego {
  id: IdVideojuego;
  nombre: string;
  genero: string;
  plataforma: Plataforma;
  precio: number;
  imagen: string;
  descripcion: string;
  fechaLanzamiento: string; 
}


export type DatosVideojuego = Omit<Videojuego, 'id'>;
