import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MunicipioItem {
  idMunicipio: number;
  nombre: string;
  codigoDane: string;
}

export interface TipoPrestadorItem {
  idTipoPrestador: number;
  nombre: string;
}

export interface RolItem {
  idRol: number;
  nombre: string;
}

export interface CategoriaTourItem {
  idCategoria: number;
  nombre: string;
  descripcion?: string;
}

export interface IdiomaItem {
  idIdioma: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {
  private http = inject(HttpClient);
  private baseUrl = '/api/catalogos';

  // Municipios
  listarMunicipios(): Observable<MunicipioItem[]> {
    return this.http.get<MunicipioItem[]>(`${this.baseUrl}/municipios`);
  }
  crearMunicipio(data: { nombre: string; codigoDane: string }): Observable<MunicipioItem> {
    return this.http.post<MunicipioItem>(`${this.baseUrl}/municipios`, data);
  }
  modificarMunicipio(id: number, data: { nombre: string; codigoDane: string }): Observable<MunicipioItem> {
    return this.http.put<MunicipioItem>(`${this.baseUrl}/municipios/${id}`, data);
  }
  eliminarMunicipio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/municipios/${id}`);
  }

  // Tipos Prestador
  listarTiposPrestador(): Observable<TipoPrestadorItem[]> {
    return this.http.get<TipoPrestadorItem[]>(`${this.baseUrl}/tipos-prestador`);
  }
  crearTipoPrestador(data: { nombre: string }): Observable<TipoPrestadorItem> {
    return this.http.post<TipoPrestadorItem>(`${this.baseUrl}/tipos-prestador`, data);
  }
  modificarTipoPrestador(id: number, data: { nombre: string }): Observable<TipoPrestadorItem> {
    return this.http.put<TipoPrestadorItem>(`${this.baseUrl}/tipos-prestador/${id}`, data);
  }
  eliminarTipoPrestador(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tipos-prestador/${id}`);
  }

  // Roles
  listarRoles(): Observable<RolItem[]> {
    return this.http.get<RolItem[]>(`${this.baseUrl}/roles`);
  }
  crearRol(data: { nombre: string }): Observable<RolItem> {
    return this.http.post<RolItem>(`${this.baseUrl}/roles`, data);
  }
  modificarRol(id: number, data: { nombre: string }): Observable<RolItem> {
    return this.http.put<RolItem>(`${this.baseUrl}/roles/${id}`, data);
  }
  eliminarRol(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/roles/${id}`);
  }

  // Categorías Tour
  listarCategoriasTour(): Observable<CategoriaTourItem[]> {
    return this.http.get<CategoriaTourItem[]>(`${this.baseUrl}/categorias-tour`);
  }
  crearCategoriaTour(data: { nombre: string; descripcion?: string }): Observable<CategoriaTourItem> {
    return this.http.post<CategoriaTourItem>(`${this.baseUrl}/categorias-tour`, data);
  }
  modificarCategoriaTour(id: number, data: { nombre: string; descripcion?: string }): Observable<CategoriaTourItem> {
    return this.http.put<CategoriaTourItem>(`${this.baseUrl}/categorias-tour/${id}`, data);
  }
  eliminarCategoriaTour(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categorias-tour/${id}`);
  }

  // Idiomas
  listarIdiomas(): Observable<IdiomaItem[]> {
    return this.http.get<IdiomaItem[]>(`${this.baseUrl}/idiomas`);
  }
  crearIdioma(data: { nombre: string }): Observable<IdiomaItem> {
    return this.http.post<IdiomaItem>(`${this.baseUrl}/idiomas`, data);
  }
  modificarIdioma(id: number, data: { nombre: string }): Observable<IdiomaItem> {
    return this.http.put<IdiomaItem>(`${this.baseUrl}/idiomas/${id}`, data);
  }
  eliminarIdioma(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/idiomas/${id}`);
  }
}
