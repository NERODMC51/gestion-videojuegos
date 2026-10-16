export type Rol = 'admin' | 'usuario';


export interface Usuario {
  nombreUsuario: string;
  nombre: string;
  rol: Rol;
}

export const PREGUNTAS_SECRETAS = [
  '¿Cómo se llamaba tu primera mascota?',
  '¿En qué ciudad naciste?',
  '¿Cuál fue el primer videojuego que jugaste?',
  '¿Cómo se llamaba tu escuela primaria?',
] as const;


export interface DatosRegistro {
  nombre: string;
  nombreUsuario: string;
  clave: string;
  preguntaSecreta: string;
  respuesta: string;
}


export interface UsuarioRegistrado {
  id: string | number;
  nombreUsuario: string;
  nombre: string;
  sal: string;
  claveHash: string;
  preguntaSecreta: string;
  salRespuesta: string;
  respuestaHash: string;
}

export type NuevoUsuario = Omit<UsuarioRegistrado, 'id'>;
