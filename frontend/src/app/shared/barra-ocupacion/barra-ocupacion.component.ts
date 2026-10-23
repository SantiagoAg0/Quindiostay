import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-barra-ocupacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="barra-contenedor">
      <div class="barra-texto">
        <span class="ocupados">{{ cuposOcupados }}</span>
        <span class="total">/ {{ totalCupos }}</span>
      </div>
      <div class="barra-fondo">
        <div class="barra-progreso" [style.width.%]="porcentaje" [ngClass]="colorClase"></div>
      </div>
    </div>
  `,
  styles: [`
    .barra-contenedor {
      min-width: 90px;
      .barra-texto {
        font-size: 0.8125rem;
        font-weight: 500;
        margin-bottom: 4px;
        .ocupados { font-weight: 600; color: var(--ink); }
        .total { color: var(--mute); }
      }
      .barra-fondo {
        height: 6px;
        background: var(--line);
        border-radius: 999px;
        overflow: hidden;
      }
      .barra-progreso {
        height: 100%;
        border-radius: 999px;
        transition: width 0.3s ease;
        &.normal { background: var(--leaf); }
        &.alta { background: #F59E0B; }
        &.llena { background: #EF4444; }
      }
    }
  `]
})
export class BarraOcupacionComponent {
  @Input() cuposOcupados: number = 0;
  @Input() totalCupos: number = 1;

  get porcentaje(): number {
    if (!this.totalCupos || this.totalCupos <= 0) return 0;
    return Math.min(100, Math.round((this.cuposOcupados / this.totalCupos) * 100));
  }

  get colorClase(): string {
    const p = this.porcentaje;
    if (p >= 100) return 'llena';
    if (p >= 75) return 'alta';
    return 'normal';
  }
}
