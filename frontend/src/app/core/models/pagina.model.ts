export interface PaginaResponse<T> {
  contenido: T[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  tamano: number;
}
