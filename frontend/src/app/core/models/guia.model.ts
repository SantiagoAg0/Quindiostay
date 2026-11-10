export interface GuiaResumen {
  idGuia: number;
  nombre: string;
}

export interface GuiaDetalleDto {
  idGuia: number;
  nombre: string;
  documento: string;
  tarjetaProfesional: string;
  idiomasIds: number[];
  idiomasNombres: string[];
}

export interface CrearGuiaRequest {
  nombre: string;
  documento: string;
  tarjetaProfesional: string;
  idiomasIds: number[];
}
