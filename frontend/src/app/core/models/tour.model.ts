export interface TourResumen {
  idTour: number;
  nombre: string;
  duracionHoras: number;
  dificultad: 'BAJA' | 'MEDIA' | 'ALTA';
  precioPersona: number;
}
