export interface ApiError {
  fecha: string;
  estado: number;
  mensaje: string;
  ruta: string;
  detalles?: string[];
}
