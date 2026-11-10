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
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      line-height: 1;
      white-space: nowrap;
      transition: all 0.2s ease;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      /* Verdes / Activo / Confirmada / Aprobado */
      &.activo, &.programada, &.confirmada, &.aprobado, &.completada, &.realizada, &.leida {
        background: rgba(16, 185, 129, 0.15);
        color: #047857;
        border: 1px solid rgba(16, 185, 129, 0.25);
        .dot { background: #10B981; box-shadow: 0 0 6px rgba(16, 185, 129, 0.6); }
      }

      /* Amarillos / Pendiente / En curso / Enviada */
      &.pendiente, &.en_curso, &.enviada {
        background: rgba(245, 158, 11, 0.15);
        color: #B45309;
        border: 1px solid rgba(245, 158, 11, 0.25);
        .dot { background: #F59E0B; }
      }

      /* Rojos / Cancelada / Rechazado / Bloqueado / Inactivo / Fallida */
      &.cancelada, &.rechazado, &.bloqueado, &.inactivo, &.fallida {
        background: rgba(239, 68, 68, 0.12);
        color: #B91C1C;
        border: 1px solid rgba(239, 68, 68, 0.25);
        .dot { background: #EF4444; }
      }

      /* Azules / Reembolsado / Finalizada */
      &.reembolsado, &.finalizada {
        background: rgba(59, 130, 246, 0.12);
        color: #1D4ED8;
        border: 1px solid rgba(59, 130, 246, 0.25);
        .dot { background: #3B82F6; }
      }
    }
  `]
})
export class PillEstadoComponent {
  @Input({ required: true }) estado: string = 'PROGRAMADA';

  get claseEstado(): string {
    return (this.estado || '').toLowerCase().replace(/[\s-]/g, '_');
  }

  get textoEstado(): string {
    switch ((this.estado || '').toUpperCase()) {
      case 'PROGRAMADA': return 'Programada';
      case 'EN_CURSO': return 'En curso';
      case 'REALIZADA': return 'Realizada';
      case 'COMPLETADA': return 'Completada';
      case 'CANCELADA': return 'Cancelada';
      case 'PENDIENTE': return 'Pendiente';
      case 'CONFIRMADA': return 'Confirmada';
      case 'FINALIZADA': return 'Finalizada';
      case 'APROBADO': return 'Aprobado';
      case 'RECHAZADO': return 'Rechazado';
      case 'REEMBOLSADO': return 'Reembolsado';
      case 'ACTIVO': return 'Activo';
      case 'INACTIVO': return 'Inactivo';
      case 'BLOQUEADO': return 'Bloqueado';
      case 'ENVIADA': return 'Enviada';
      case 'LEIDA': return 'Leída';
      case 'FALLIDA': return 'Fallida';
      default: return this.estado;
    }
  }
}
