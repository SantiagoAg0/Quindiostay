import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriaTourDto, CrearTourRequest, TourDetalleDto } from '../../core/models/tour.model';

@Injectable({
  providedIn: 'root'
})
export class ToursService {
  private readonly apiUrl = '/api/tours-gestion';

  constructor(private http: HttpClient) {}

  listar(): Observable<TourDetalleDto[]> {
    return this.http.get<TourDetalleDto[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<TourDetalleDto> {
    return this.http.get<TourDetalleDto>(`${this.apiUrl}/${id}`);
  }

  crear(request: CrearTourRequest): Observable<TourDetalleDto> {
    return this.http.post<TourDetalleDto>(this.apiUrl, request);
  }

  actualizar(id: number, request: CrearTourRequest): Observable<TourDetalleDto> {
    return this.http.put<TourDetalleDto>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarCategorias(): Observable<CategoriaTourDto[]> {
    return this.http.get<CategoriaTourDto[]>(`${this.apiUrl}/categorias`);
  }
}
