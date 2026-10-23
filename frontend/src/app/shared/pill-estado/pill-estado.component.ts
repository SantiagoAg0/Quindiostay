import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pill-estado',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="pill" [ngClass]="claseEstado">
      <span class="dot"></span>
      {{ textoEstado }}
    </span>
  `,
  styles: [`
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 600;
      line-height: 1;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      &.programada {
        background: var(--mint);
        color: var(--pine);
        .dot { background: var(--green); }
      }
      &.realizada {
        background: #E8F5E9;
        color: #1B5E20;
        .dot { background: #2E7D32; }
      }
      &.cancelada {
        background: #FFEBEE;
        color: #C62828;
        .dot { background: #D32F2F; }
      }
    }
  `]
})
export class PillEstadoComponent {
  @Input({ required: true }) estado: string = 'PROGRAMADA';

  get claseEstado(): string {
    return this.estado.toLowerCase();
  }

  get textoEstado(): string {
    switch (this.estado) {
      case 'PROGRAMADA': return 'Programada';
      case 'REALIZADA': return 'Realizada';
      case 'CANCELADA': return 'Cancelada';
      default: return this.estado;
    }
  }
}
