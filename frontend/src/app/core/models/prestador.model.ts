export type EstadoPrestador = 'ACTIVO' | 'SUSPENDIDO' | 'RETIRADO';

export interface PrestadorDto {
  idPrestador: number;
  nombreComercial: string;
  nitDocumento: string;
  rnt: string;
  direccion: string;
  telefono: string;
  correo: string;
  estado: EstadoPrestador;
  idMunicipio: number;
  municipioNombre: string;
  idTipoPrestador: number;
  tipoPrestadorNombre: string;
}

export interface MunicipioDto {
  idMunicipio: number;
  nombre: string;
  codigoDane: string;
}

export interface TipoPrestadorDto {
  idTipoPrestador: number;
  nombre: string;
}

export interface CrearPrestadorRequest {
  nombreComercial: string;
  nitDocumento: string;
  rnt?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  estado: EstadoPrestador;
  idMunicipio: number;
  idTipoPrestador: number;
}
