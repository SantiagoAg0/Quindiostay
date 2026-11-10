import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolDto, UsuarioSistemaDto } from '../../core/models/usuario.model';

export interface CrearUsuarioRequest {
  nombreUsuario: string;
  contrasena: string;
  idRol: number;
  estado?: 'ACTIVO' | 'BLOQUEADO';
  idPrestador?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly apiUrl = '/api/usuarios';

  constructor(private http: HttpClient) {}

  listar(): Observable<UsuarioSistemaDto[]> {
    return this.http.get<UsuarioSistemaDto[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<UsuarioSistemaDto> {
    return this.http.get<UsuarioSistemaDto>(`${this.apiUrl}/${id}`);
  }

  crear(request: CrearUsuarioRequest): Observable<UsuarioSistemaDto> {
    return this.http.post<UsuarioSistemaDto>(this.apiUrl, request);
  }

  cambiarEstado(id: number, nuevoEstado: 'ACTIVO' | 'BLOQUEADO'): Observable<UsuarioSistemaDto> {
    return this.http.put<UsuarioSistemaDto>(`${this.apiUrl}/${id}/estado`, null, {
      params: { nuevoEstado }
    });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarRoles(): Observable<RolDto[]> {
    return this.http.get<RolDto[]>(`${this.apiUrl}/roles`);
  }
}
