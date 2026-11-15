import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrearPagoRequest, EstadoPago, PagoDetalleDto } from '../../core/models/pago.model';

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  private readonly apiUrl = '/api/pagos';

  constructor(private http: HttpClient) {}

  listar(idReserva?: number, estado?: EstadoPago): Observable<PagoDetalleDto[]> {
    let params = new HttpParams();
    if (idReserva) params = params.set('idReserva', idReserva.toString());
    if (estado) params = params.set('estado', estado);
    return this.http.get<PagoDetalleDto[]>(this.apiUrl, { params });
  }

  registrarPago(request: CrearPagoRequest): Observable<PagoDetalleDto> {
    return this.http.post<PagoDetalleDto>(this.apiUrl, request);
  }

  reembolsar(idPago: number): Observable<PagoDetalleDto> {
    return this.http.post<PagoDetalleDto>(`${this.apiUrl}/${idPago}/reembolsar`, null);
  }

  modificar(idPago: number, estado?: EstadoPago, observacion?: string): Observable<PagoDetalleDto> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    if (observacion) params = params.set('observacion', observacion);
    return this.http.put<PagoDetalleDto>(`${this.apiUrl}/${idPago}`, null, { params });
  }

  eliminar(idPago: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idPago}`);
  }
}
