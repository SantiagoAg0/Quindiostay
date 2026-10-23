import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalidaTour, SalidaTourRequest } from '../../core/models/salida-tour.model';
import { PaginaResponse } from '../../core/models/pagina.model';
import { TourResumen } from '../../core/models/tour.model';
import { GuiaResumen } from '../../core/models/guia.model';
import { IdiomaResumen } from '../../core/models/idioma.model';

@Injectable({
  providedIn: 'root'
})
export class SalidasService {
  private http = inject(HttpClient);
  private apiUrl = '/api/salidas';

  buscar(filtros: {
    idTour?: number;
    estado?: string;
    fecha?: string;
    texto?: string;
    page?: number;
    size?: number;
  }): Observable<PaginaResponse<SalidaTour>> {
    let params = new HttpParams();
    if (filtros.idTour) params = params.set('idTour', filtros.idTour.toString());
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.fecha) params = params.set('fecha', filtros.fecha);
    if (filtros.texto) params = params.set('texto', filtros.texto);
    if (filtros.page !== undefined) params = params.set('page', filtros.page.toString());
    if (filtros.size !== undefined) params = params.set('size', filtros.size.toString());

    return this.http.get<PaginaResponse<SalidaTour>>(this.apiUrl, { params });
  }

  obtenerPorId(id: number): Observable<SalidaTour> {
    return this.http.get<SalidaTour>(`${this.apiUrl}/${id}`);
  }

  crear(request: SalidaTourRequest): Observable<SalidaTour> {
    return this.http.post<SalidaTour>(this.apiUrl, request);
  }

  modificar(id: number, request: SalidaTourRequest): Observable<SalidaTour> {
    return this.http.put<SalidaTour>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  cancelar(id: number): Observable<SalidaTour> {
    return this.http.post<SalidaTour>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  // Catálogos
  listarTours(): Observable<TourResumen[]> {
    return this.http.get<TourResumen[]>('/api/tours');
  }

  listarGuias(): Observable<GuiaResumen[]> {
    return this.http.get<GuiaResumen[]>('/api/guias');
  }

  listarIdiomas(): Observable<IdiomaResumen[]> {
    return this.http.get<IdiomaResumen[]>('/api/idiomas');
  }

  listarIdiomasPorGuia(idGuia: number): Observable<IdiomaResumen[]> {
    return this.http.get<IdiomaResumen[]>(`/api/guias/${idGuia}/idiomas`);
  }
}
