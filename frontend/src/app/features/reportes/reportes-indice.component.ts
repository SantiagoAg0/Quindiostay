import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reportes-indice',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="reportes-indice">
      <div class="header">
        <h1>Centro de Reportes</h1>
        <p>Estadísticas e informes operativos de la plataforma de turismo.</p>
      </div>

      <div class="reports-grid">
        <!-- R5 Activo -->
        <a routerLink="/reportes/guias-mas-salidas" class="report-card active">
          <div class="card-badge disponible">Disponible · R5</div>
          <h3>Guías con más salidas realizadas</h3>
          <p>Ranking de guías por volumen de tours completados, horas guiadas e idiomas habilitados.</p>
          <span class="card-action">Ver reporte →</span>
        </a>

        <!-- R1 - R4, R6 - R10 Placeholders -->
        <div class="report-card disabled" *ngFor="let r of placeholders">
          <div class="card-badge prox">Entrega 3 · {{ r.codigo }}</div>
          <h3>{{ r.titulo }}</h3>
          <p>{{ r.desc }}</p>
          <span class="card-action dim">Próximamente</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reportes-indice { max-width: 1200px; margin: 0 auto; }
    .header {
      margin-bottom: 28px;
      h1 { font-size: 1.75rem; font-weight: 700; color: var(--ink); margin: 0 0 6px; }
      p { color: var(--mute); margin: 0; }
    }
    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }
    .report-card {
      background: var(--white);
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      text-decoration: none;
      transition: all 0.2s ease;
      &.active {
        border-color: var(--leaf);
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(27, 127, 71, 0.08);
        }
      }
      &.disabled {
        opacity: 0.75;
        background: #FAFAFA;
      }
      h3 { font-size: 1.125rem; font-weight: 700; color: var(--ink); margin: 12px 0 8px; }
      p { font-size: 0.875rem; color: var(--mute); margin: 0 0 16px; flex: 1; line-height: 1.4; }
      .card-badge {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 999px;
        align-self: flex-start;
        &.disponible { background: var(--mint); color: var(--pine); }
        &.prox { background: #F3F4F6; color: #6B7280; }
      }
      .card-action {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--green);
        &.dim { color: #9CA3AF; }
      }
    }
  `]
})
export class ReportesIndiceComponent {
  placeholders = [
    { codigo: 'R1', titulo: 'Catálogo de tours por prestador', desc: 'Listado completo con duraciones, dificultad y tarifas vigentes.' },
    { codigo: 'R2', titulo: 'Salidas próximas a realizar', desc: 'Agenda de salidas en los siguientes 7 días con guías asignados.' },
    { codigo: 'R3', titulo: 'Pagos pendientes de confirmación', desc: 'Monitoreo de transacciones PSE y consignaciones bancarias.' },
    { codigo: 'R4', titulo: 'Participantes por mes y tour', desc: 'Consolidado mensual de afluencia turística en atractivos locales.' },
    { codigo: 'R6', titulo: 'Ocupación por categoría de tour', desc: 'Porcentaje de cupos vendidos sobre cupo ofertado por tipología.' },
    { codigo: 'R7', titulo: 'Ingresos mensuales por método de pago', desc: 'Flujo de caja desglosado por tarjetas, PSE y efectivo.' },
    { codigo: 'R8', titulo: 'Cancelaciones por prestador', desc: 'Tasa de reembolso y volumen de cancelaciones por municipio.' },
    { codigo: 'R9', titulo: 'Guías sin salidas en el período', desc: 'Identificación de personal activo sin asignación operativa.' },
    { codigo: 'R10', titulo: 'Clientes con mayor gasto acumulado', desc: 'Top de compradores frecuentes para programas de fidelización.' }
  ];
}
