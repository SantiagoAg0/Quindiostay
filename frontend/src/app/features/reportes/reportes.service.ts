import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GuiaSalidasFila } from '../../core/models/reporte-guias.model';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private http = inject(HttpClient);
  private apiUrl = '/api/reportes';

  obtenerGuiasMasSalidas(desde?: string, hasta?: string, minimo?: number): Observable<GuiaSalidasFila[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    if (minimo) params = params.set('minimo', minimo.toString());

    return this.http.get<GuiaSalidasFila[]>(`${this.apiUrl}/guias-mas-salidas`, { params });
  }
}
