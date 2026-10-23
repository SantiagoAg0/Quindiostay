import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReportesService } from './reportes.service';
import { GuiaSalidasFila } from '../../core/models/reporte-guias.model';
import { BotonComponent } from '../../shared/boton/boton.component';

@Component({
  selector: 'app-reporte-guias-salidas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BotonComponent],
  template: `
    <div class="reporte-page">
      <div class="report-header">
        <div>
          <a routerLink="/reportes" class="back-link">← Volver a reportes</a>
          <h1 class="title">R5: Guías con más salidas realizadas</h1>
          <p class="subtitle">Ranking de guías por volumen de tours finalizados y acumulación de horas guiadas.</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-card">
        <div class="filter-group">
          <label>Desde:</label>
          <input type="date" [(ngModel)]="fechaDesde" />
        </div>
        <div class="filter-group">
          <label>Hasta:</label>
          <input type="date" [(ngModel)]="fechaHasta" />
        </div>
        <div class="filter-group">
          <label>Mínimo salidas:</label>
          <input type="number" min="1" [(ngModel)]="minimoSalidas" style="width: 80px;" />
        </div>

        <app-boton variant="primary" (click)="generarReporte()">
          Generar reporte
        </app-boton>

        <button class="btn-pdf-disabled" title="Disponible en la Entrega 3" disabled>
          📄 Exportar a PDF (Próximamente)
        </button>
      </div>

      <!-- Indicadores KPI -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Guías activos en el ranking</span>
          <span class="kpi-val">{{ filas.length }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Total salidas realizadas</span>
          <span class="kpi-val">{{ totalSalidas }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Total horas guiadas</span>
          <span class="kpi-val">{{ totalHoras | number:'1.1-1' }} h</span>
        </div>
      </div>

      <!-- Tabla de Datos -->
      <div class="table-card">
        <div *ngIf="cargando" class="loading">Consultando datos del reporte...</div>

        <table *ngIf="!cargando && filas.length" class="report-table">
          <thead>
            <tr>
              <th style="width: 60px;">Puesto</th>
              <th>Guía</th>
              <th>Idiomas Habilitados</th>
              <th style="width: 220px;">Salidas Realizadas</th>
              <th style="text-align: right;">Horas Guiadas</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let f of filas; let idx = index">
              <td class="rank-cell">
                <span class="rank-badge" [class.top]="idx === 0">#{{ idx + 1 }}</span>
              </td>
              <td class="guia-cell">
                <strong>{{ f.guia }}</strong>
              </td>
              <td>
                <span *ngFor="let idm of f.idiomas" class="tag">{{ idm }}</span>
              </td>
              <td>
                <div class="salidas-bar-wrapper">
                  <span class="num">{{ f.totalSalidas }}</span>
                  <div class="bar-bg">
                    <div class="bar-fill" [style.width.%]="calcularPorcentaje(f.totalSalidas)"></div>
                  </div>
                </div>
              </td>
              <td class="horas-cell">
                {{ f.horasGuiadas | number:'1.1-1' }} hrs
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3"><strong>Total acumulado</strong></td>
              <td><strong>{{ totalSalidas }} salidas</strong></td>
              <td style="text-align: right;"><strong>{{ totalHoras | number:'1.1-1' }} hrs</strong></td>
            </tr>
          </tfoot>
        </table>

        <div *ngIf="!cargando && !filas.length" class="empty">
          No se encontraron salidas con los criterios de fecha seleccionados.
        </div>

        <div class="report-footer">
          <span>Generado el: {{ fechaGeneracion | date:'dd/MM/yyyy HH:mm' }}</span>
          <span>QuindíoStay · Dominio Tours y Actividades</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reporte-page { max-width: 1100px; margin: 0 auto; }
    .back-link {
      font-size: 0.8125rem;
      color: var(--green);
      text-decoration: none;
      font-weight: 600;
      display: inline-block;
      margin-bottom: 8px;
    }
    .title { font-size: 1.75rem; font-weight: 700; color: var(--ink); margin: 0 0 4px; }
    .subtitle { color: var(--mute); margin: 0 0 24px; font-size: 0.9375rem; }
    .filters-card {
      background: var(--white);
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      .filter-group {
        display: flex;
        align-items: center;
        gap: 8px;
        label { font-size: 0.875rem; font-weight: 600; color: var(--ink); }
        input {
          padding: 8px 10px;
          border: 1px solid var(--line);
          border-radius: 8px;
          font-size: 0.875rem;
        }
      }
    }
    .btn-pdf-disabled {
      padding: 10px 16px;
      border: 1px solid var(--line);
      background: var(--mist);
      color: var(--mute);
      border-radius: 10px;
      font-size: 0.875rem;
      cursor: not-allowed;
      font-family: inherit;
      font-weight: 500;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: var(--white);
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 20px;
      .kpi-label { font-size: 0.8125rem; font-weight: 500; color: var(--mute); display: block; margin-bottom: 6px; }
      .kpi-val { font-size: 1.75rem; font-weight: 700; color: var(--pine); }
    }
    .table-card {
      background: var(--white);
      border: 1px solid var(--line);
      border-radius: 16px;
      overflow: hidden;
    }
    .report-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
      th {
        background: var(--mist);
        color: var(--mute);
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        padding: 14px 20px;
        border-bottom: 1px solid var(--line);
      }
      td { padding: 14px 20px; border-bottom: 1px solid var(--line); }
      tfoot td { background: var(--mist); font-size: 0.875rem; border-bottom: none; }
    }
    .rank-badge {
      font-weight: 700;
      color: var(--mute);
      &.top { color: var(--green); font-size: 1rem; }
    }
    .tag {
      background: var(--mint);
      color: var(--pine);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-right: 4px;
    }
    .salidas-bar-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      .num { font-weight: 700; min-width: 20px; }
      .bar-bg {
        flex: 1;
        height: 8px;
        background: var(--line);
        border-radius: 999px;
        overflow: hidden;
      }
      .bar-fill {
        height: 100%;
        background: var(--leaf);
        border-radius: 999px;
      }
    }
    .horas-cell { font-weight: 600; text-align: right; }
    .loading, .empty { padding: 48px; text-align: center; color: var(--mute); }
    .report-footer {
      padding: 12px 20px;
      background: var(--white);
      border-top: 1px solid var(--line);
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--mute);
    }
  `]
})
export class ReporteGuiasSalidasComponent implements OnInit {
  private reportesService = inject(ReportesService);

  fechaDesde = '';
  fechaHasta = '';
  minimoSalidas = 1;

  filas: GuiaSalidasFila[] = [];
  cargando = false;
  fechaGeneracion = new Date();

  ngOnInit(): void {
    this.generarReporte();
  }

  generarReporte(): void {
    this.cargando = true;
    this.reportesService.obtenerGuiasMasSalidas(
      this.fechaDesde || undefined,
      this.fechaHasta || undefined,
      this.minimoSalidas || 1
    ).subscribe({
      next: (data) => {
        this.filas = data;
        this.cargando = false;
        this.fechaGeneracion = new Date();
      },
      error: () => this.cargando = false
    });
  }

  get totalSalidas(): number {
    return this.filas.reduce((acc, f) => acc + f.totalSalidas, 0);
  }

  get totalHoras(): number {
    return this.filas.reduce((acc, f) => acc + f.horasGuiadas, 0);
  }

  get maxSalidas(): number {
    if (!this.filas.length) return 1;
    return Math.max(...this.filas.map(f => f.totalSalidas));
  }

  calcularPorcentaje(salidas: number): number {
    return Math.round((salidas / this.maxSalidas) * 100);
  }
}
