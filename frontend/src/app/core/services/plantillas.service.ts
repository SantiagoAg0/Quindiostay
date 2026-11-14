import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlantillasService {
  private http = inject(HttpClient);

  descargar(ruta: string, nombreArchivo?: string): void {
    this.http.get(ruta, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        const fileUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = fileUrl;
        if (nombreArchivo) {
          link.download = nombreArchivo;
        } else {
          link.target = '_blank';
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(fileUrl), 2000);
      },
      error: (err) => {
        console.error('Error al descargar plantilla PDF:', err);
        if (err.status === 401) {
          alert('No autorizado. Por favor inicie sesión nuevamente para descargar este documento.');
        } else if (err.status === 403) {
          alert('No tiene permisos para acceder a este documento.');
        } else if (err.status === 404) {
          alert('El documento PDF solicitado no fue encontrado.');
        } else {
          alert('Error al generar o descargar el documento PDF. Intente nuevamente.');
        }
      }
    });
  }
}
