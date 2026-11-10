import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrearReservaRequest, EstadoReserva, ReservaDetalleDto } from '../../core/models/reserva.model';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private readonly apiUrl = '/api/reservas';

  constructor(private http: HttpClient) {}

  listar(idCliente?: number): Observable<ReservaDetalleDto[]> {
    let params = new HttpParams();
    if (idCliente) params = params.set('idCliente', idCliente.toString());
    return this.http.get<ReservaDetalleDto[]>(this.apiUrl, { params });
  }

  obtenerPorId(id: number): Observable<ReservaDetalleDto> {
    return this.http.get<ReservaDetalleDto>(`${this.apiUrl}/${id}`);
  }

  crear(request: CrearReservaRequest): Observable<ReservaDetalleDto> {
    return this.http.post<ReservaDetalleDto>(this.apiUrl, request);
  }

  cambiarEstado(id: number, nuevoEstado: EstadoReserva): Observable<ReservaDetalleDto> {
    return this.http.put<ReservaDetalleDto>(`${this.apiUrl}/${id}/estado`, null, {
      params: { nuevoEstado }
    });
  }

  cancelar(id: number, motivo?: string): Observable<ReservaDetalleDto> {
    return this.http.post<ReservaDetalleDto>(`${this.apiUrl}/${id}/cancelar`, null, {
      params: { motivo: motivo || 'Cancelación solicitada por el usuario' }
    });
  }
}
