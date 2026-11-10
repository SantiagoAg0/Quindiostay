import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  R1TourCatalogoFila,
  R2SalidaProximaFila,
  R3PagoPendienteFila,
  R4TourParticipantesMesFila,
  R5GuiaSalidasFila,
  R6OcupacionCategoriaFila,
  R7IngresoMensualFila,
  R8PrestadorCancelacionesFila,
  R9GuiaSinSalidasFila,
  R10ClienteAltoGastoFila
} from '../../core/models/reportes.model';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private http = inject(HttpClient);
  private apiUrl = '/api/reportes';

  getR1(dificultad?: string, precioMax?: number): Observable<R1TourCatalogoFila[]> {
    let params = new HttpParams();
    if (dificultad) params = params.set('dificultad', dificultad);
    if (precioMax) params = params.set('precioMax', precioMax.toString());
    return this.http.get<R1TourCatalogoFila[]>(`${this.apiUrl}/catalogo-tours`, { params });
  }

  getR2(desde?: string, hasta?: string): Observable<R2SalidaProximaFila[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<R2SalidaProximaFila[]>(`${this.apiUrl}/salidas-proximas`, { params });
  }

  getR3(): Observable<R3PagoPendienteFila[]> {
    return this.http.get<R3PagoPendienteFila[]>(`${this.apiUrl}/pagos-pendientes`);
  }

  getR4(): Observable<R4TourParticipantesMesFila[]> {
    return this.http.get<R4TourParticipantesMesFila[]>(`${this.apiUrl}/participantes-mes`);
  }

  obtenerGuiasMasSalidas(desde?: string, hasta?: string, minimo?: number): Observable<R5GuiaSalidasFila[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    if (minimo) params = params.set('minimo', minimo.toString());
    return this.http.get<R5GuiaSalidasFila[]>(`${this.apiUrl}/guias-mas-salidas`, { params });
  }

  getR6(): Observable<R6OcupacionCategoriaFila[]> {
    return this.http.get<R6OcupacionCategoriaFila[]>(`${this.apiUrl}/ocupacion-categoria`);
  }

  getR7(): Observable<R7IngresoMensualFila[]> {
    return this.http.get<R7IngresoMensualFila[]>(`${this.apiUrl}/ingreso-mensual`);
  }

  getR8(): Observable<R8PrestadorCancelacionesFila[]> {
    return this.http.get<R8PrestadorCancelacionesFila[]>(`${this.apiUrl}/prestador-cancelaciones`);
  }

  getR9(desde?: string, hasta?: string): Observable<R9GuiaSinSalidasFila[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<R9GuiaSinSalidasFila[]>(`${this.apiUrl}/guias-sin-salidas`, { params });
  }

  getR10(): Observable<R10ClienteAltoGastoFila[]> {
    return this.http.get<R10ClienteAltoGastoFila[]>(`${this.apiUrl}/clientes-alto-gasto`);
  }

  descargarPdf(codigo: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${codigo}/pdf`, { responseType: 'blob' });
  }
}
