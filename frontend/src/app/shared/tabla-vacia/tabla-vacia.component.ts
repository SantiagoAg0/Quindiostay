import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabla-vacia',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vacio-contenedor">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <p class="titulo">{{ titulo }}</p>
      <p class="subtitulo">{{ subtitulo }}</p>
    </div>
  `,
  styles: [`
    .vacio-contenedor {
      text-align: center;
      padding: 48px 16px;
      color: var(--mute);
      svg { stroke: #9CA3AF; margin-bottom: 12px; }
      .titulo { font-size: 1rem; font-weight: 600; color: var(--ink); margin: 0 0 4px; }
      .subtitulo { font-size: 0.875rem; margin: 0; }
    }
  `]
})
export class TablaVaciaComponent {
  @Input() titulo: string = 'No se encontraron resultados';
  @Input() subtitulo: string = 'Intenta ajustar los filtros de búsqueda';
}
