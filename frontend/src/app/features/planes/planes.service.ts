import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrearPlanRequest, PlanDto } from '../../core/models/plan.model';

@Injectable({
  providedIn: 'root'
})
export class PlanesService {
  private readonly apiUrl = '/api/planes';

  constructor(private http: HttpClient) {}

  listar(idPrestador?: number): Observable<PlanDto[]> {
    let params = new HttpParams();
    if (idPrestador) {
      params = params.set('idPrestador', idPrestador.toString());
    }
    return this.http.get<PlanDto[]>(this.apiUrl, { params });
  }

  obtenerPorId(id: number): Observable<PlanDto> {
    return this.http.get<PlanDto>(`${this.apiUrl}/${id}`);
  }

  crear(request: CrearPlanRequest): Observable<PlanDto> {
    return this.http.post<PlanDto>(this.apiUrl, request);
  }

  actualizar(id: number, request: CrearPlanRequest): Observable<PlanDto> {
    return this.http.put<PlanDto>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
