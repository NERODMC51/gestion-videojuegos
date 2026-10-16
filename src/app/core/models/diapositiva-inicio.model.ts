export type IdDiapositivaInicio = 'aventura' | 'accion' | 'ofertas';

export interface DiapositivaInicio {
  id: IdDiapositivaInicio;
  etiqueta: string;
  titulo: string;
  descripcion: string;
  textoBoton: string;
  visible: boolean;
}
