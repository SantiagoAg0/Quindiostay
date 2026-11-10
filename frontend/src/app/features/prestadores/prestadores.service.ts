import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrearPrestadorRequest, MunicipioDto, PrestadorDto, TipoPrestadorDto } from '../../core/models/prestador.model';

@Injectable({
  providedIn: 'root'
})
export class PrestadoresService {
  private readonly apiUrl = '/api/prestadores';

  constructor(private http: HttpClient) {}

  listar(): Observable<PrestadorDto[]> {
    return this.http.get<PrestadorDto[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<PrestadorDto> {
    return this.http.get<PrestadorDto>(`${this.apiUrl}/${id}`);
  }

  crear(request: CrearPrestadorRequest): Observable<PrestadorDto> {
    return this.http.post<PrestadorDto>(this.apiUrl, request);
  }

  actualizar(id: number, request: CrearPrestadorRequest): Observable<PrestadorDto> {
    return this.http.put<PrestadorDto>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarMunicipios(): Observable<MunicipioDto[]> {
    return this.http.get<MunicipioDto[]>(`${this.apiUrl}/municipios`);
  }

  listarTipos(): Observable<TipoPrestadorDto[]> {
    return this.http.get<TipoPrestadorDto[]>(`${this.apiUrl}/tipos`);
  }
}
