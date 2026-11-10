import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrearNotificacionRequest, NotificacionDto } from '../../core/models/notificacion.model';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private readonly apiUrl = '/api/notificaciones';

  constructor(private http: HttpClient) {}

  listar(idCliente?: number): Observable<NotificacionDto[]> {
    let params = new HttpParams();
    if (idCliente) params = params.set('idCliente', idCliente.toString());
    return this.http.get<NotificacionDto[]>(this.apiUrl, { params });
  }

  crear(request: CrearNotificacionRequest): Observable<NotificacionDto> {
    return this.http.post<NotificacionDto>(this.apiUrl, request);
  }

  marcarLeida(id: number): Observable<NotificacionDto> {
    return this.http.put<NotificacionDto>(`${this.apiUrl}/${id}/leida`, null);
  }
}
