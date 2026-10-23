import { TourResumen } from './tour.model';
import { GuiaResumen } from './guia.model';
import { IdiomaResumen } from './idioma.model';

export type EstadoSalida = 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA';

export interface SalidaTour {
  idSalida: number;
  tour: TourResumen;
  guia: GuiaResumen;
  idioma: IdiomaResumen;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm:ss
  horaFin: string; // HH:mm:ss
  cupo: number;
  cuposOcupados: number;
  cuposDisponibles: number;
  estado: EstadoSalida;
}

export interface SalidaTourRequest {
  idTour: number;
  fecha: string;
  horaInicio: string;
  idGuia: number;
  idIdioma: number;
  cupo: number;
  estado?: EstadoSalida;
}
