import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActualizarPerfilRequest, ClienteDto } from '../../core/models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private readonly apiUrl = '/api/clientes';

  constructor(private http: HttpClient) {}

  listar(): Observable<ClienteDto[]> {
    return this.http.get<ClienteDto[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<ClienteDto> {
    return this.http.get<ClienteDto>(`${this.apiUrl}/${id}`);
  }

  obtenerMiPerfil(): Observable<ClienteDto> {
    return this.http.get<ClienteDto>(`${this.apiUrl}/mi-perfil`);
  }

  actualizarMiPerfil(request: ActualizarPerfilRequest): Observable<ClienteDto> {
    return this.http.put<ClienteDto>(`${this.apiUrl}/mi-perfil`, request);
  }

  actualizarPerfilPorId(id: number, request: ActualizarPerfilRequest): Observable<ClienteDto> {
    return this.http.put<ClienteDto>(`${this.apiUrl}/${id}/perfil`, request);
  }
}
