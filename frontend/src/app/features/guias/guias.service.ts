import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrearGuiaRequest, GuiaDetalleDto } from '../../core/models/guia.model';
import { IdiomaResumen } from '../../core/models/idioma.model';

@Injectable({
  providedIn: 'root'
})
export class GuiasService {
  private readonly apiUrl = '/api/guias-gestion';

  constructor(private http: HttpClient) {}

  listar(): Observable<GuiaDetalleDto[]> {
    return this.http.get<GuiaDetalleDto[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<GuiaDetalleDto> {
    return this.http.get<GuiaDetalleDto>(`${this.apiUrl}/${id}`);
  }

  crear(request: CrearGuiaRequest): Observable<GuiaDetalleDto> {
    return this.http.post<GuiaDetalleDto>(this.apiUrl, request);
  }

  actualizar(id: number, request: CrearGuiaRequest): Observable<GuiaDetalleDto> {
    return this.http.put<GuiaDetalleDto>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarIdiomas(): Observable<IdiomaResumen[]> {
    return this.http.get<IdiomaResumen[]>('/api/idiomas');
  }
}
