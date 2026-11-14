export type Dificultad = 'BAJA' | 'MEDIA' | 'ALTA';

export interface TourResumen {
  idTour: number;
  nombre: string;
  duracionHoras: number;
  dificultad: Dificultad;
  precioPersona: number;
}

export interface TourDetalleDto {
  idTour: number;
  nombre: string;
  descripcion: string;
  duracionHoras: number;
  dificultad: Dificultad;
  edadMinima: number;
  precioPersona: number;
  idCategoria: number;
  categoriaNombre: string;
  idPrestador: number;
  prestadorNombre: string;
}

export interface CategoriaTourDto {
  idCategoria: number;
  nombre: string;
  descripcion: string;
}

export interface CrearTourRequest {
  nombre: string;
  descripcion: string;
  duracionHoras: number;
  dificultad: Dificultad;
  edadMinima: number;
  precioPersona: number;
  idCategoria: number;
  idPrestador: number;
}
