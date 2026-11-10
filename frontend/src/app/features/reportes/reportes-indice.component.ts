import { Component, OnInit, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService } from './reportes.service';
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
import { IconComponent } from '../../shared/icon/icon.component';
import { TablaVaciaComponent } from '../../shared/tabla-vacia/tabla-vacia.component';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ReportMeta {
  codigo: string;
  nombre: string;
  descripcion: string;
  tieneGrafico: boolean;
}

@Component({
  selector: 'app-reportes-indice',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    TablaVaciaComponent
  ],
  template: `
    <div class="reportes-hub-page animate-fade-in">
      <!-- Encabezado de página -->
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <app-icon name="chart" [size]="14"></app-icon>
            <span>Analítica Departamental · Informes Oficiales</span>
          </div>
          <h1 class="page-title">Centro de Reportes Estadísticos (R1 - R10)</h1>
          <p class="page-subtitle">Informes gerenciales con filtros dinámicos, visualizaciones interactivas y exportación a PDF oficial.</p>
        </div>
        <button class="btn btn-primary" (click)="exportarPdfActual()" [disabled]="descargandoPdf">
          <app-icon name="download" [size]="16"></app-icon>
          <span>{{ descargandoPdf ? 'Generando PDF...' : 'Exportar PDF Oficial (' + reporteActivo + ')' }}</span>
        </button>
      </div>

      <!-- Barra de Navegación de Reportes (R1 - R10) -->
      <div class="report-tabs-card glass-card">
        <div class="report-tabs-scroll">
          <button
            *ngFor="let r of catalogoReportes"
            class="tab-btn"
            [class.active]="reporteActivo === r.codigo"
            (click)="seleccionarReporte(r.codigo)">
            <span class="tab-code">{{ r.codigo }}</span>
            <span class="tab-title">{{ r.nombre }}</span>
          </button>
        </div>
      </div>

      <!-- Detalle del Reporte Seleccionado -->
      <div class="report-content-panel glass-card">
        <div class="panel-header">
          <div>
            <div class="report-badge">{{ metaActual.codigo }} · Universidad del Quindío</div>
            <h2 class="report-title">{{ metaActual.nombre }}</h2>
            <p class="report-desc">{{ metaActual.descripcion }}</p>
          </div>

          <!-- Filtros Específicos -->
          <div class="filter-controls">
            <!-- R1 Filtro Dificultad -->
            <div *ngIf="reporteActivo === 'R1'" class="filter-item">
              <label>Dificultad:</label>
              <select [(ngModel)]="r1Dificultad" (change)="cargarDatosReporte()">
                <option value="">Todas</option>
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
              </select>
            </div>

            <!-- R2 Fechas -->
            <div *ngIf="reporteActivo === 'R2'" class="filter-dates">
              <div class="filter-item">
                <label>Desde:</label>
                <input type="date" [(ngModel)]="fechaDesde" (change)="cargarDatosReporte()" />
              </div>
              <div class="filter-item">
                <label>Hasta:</label>
                <input type="date" [(ngModel)]="fechaHasta" (change)="cargarDatosReporte()" />
              </div>
            </div>

            <!-- R5 Mínimo de salidas -->
            <div *ngIf="reporteActivo === 'R5'" class="filter-item">
              <label>Mínimo de salidas:</label>
              <input type="number" [(ngModel)]="r5Minimo" min="1" (change)="cargarDatosReporte()" style="width: 70px" />
            </div>

            <button class="btn btn-secondary btn-sm" (click)="cargarDatosReporte()">
              <app-icon name="refresh" [size]="14"></app-icon>
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        <!-- Visualización Gráfica (R4, R6, R7) -->
        <div *ngIf="metaActual.tieneGrafico && !cargando" class="chart-container-box">
          <div class="chart-header">
            <app-icon name="chart" [size]="16"></app-icon>
            <span>Visualización Gráfica Estadística</span>
          </div>
          <div class="chart-canvas-wrap">
            <canvas #chartCanvas></canvas>
          </div>
        </div>

        <!-- Estado de Carga -->
        <div *ngIf="cargando" class="loading-state">
          <div class="spinner"></div>
          <span>Ejecutando consulta analítica en base de datos...</span>
        </div>

        <!-- TABLAS DE DATOS SEGÚN EL REPORTE ACTIVO -->
        <div class="table-responsive" *ngIf="!cargando">

          <!-- R1: Catálogo de Tours -->
          <table *ngIf="reporteActivo === 'R1' && datosR1.length" class="data-table">
            <thead>
              <tr>
                <th>Tour</th>
                <th>Dificultad</th>
                <th>Duración</th>
                <th>Edad Mínima</th>
                <th>Tarifa por Persona</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let f of datosR1">
                <td><strong>{{ f.nombre }}</strong></td>
                <td><span class="badge diff">{{ f.dificultad }}</span></td>
                <td>{{ f.duracionHoras }} horas</td>
                <td>{{ f.edadMinima }} años</td>
                <td class="amount">$ {{ f.precioPersona | number }}</td>
              </tr>
            </tbody>
          </table>

          <!-- R2: Salidas Próximas -->
          <table *ngIf="reporteActivo === 'R2' && datosR2.length" class="data-table">
            <thead>
              <tr>
                <th>Salida #</th>
                <th>Fecha Programada</th>
                <th>Hora Inicio</th>
                <th>Cupo Total</th>
                <th>ID Tour</th>
                <th>ID Guía</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let f of datosR2">
                <td class="code-cell">#SAL-{{ f.idSalida }}</td>
                <td>{{ f.fecha }}</td>
                <td>{{ f.horaInicio }}</td>
                <td>{{ f.cupo }} personas</td>
                <td>Tour #{{ f.idTour }}</td>
                <td>Guía #{{ f.idGuia }}</td>
              </tr>
            </tbody>
          </table>

          <!-- R3: Pagos Pendientes -->
          <table *ngIf="reporteActivo === 'R3' && datosR3.length" class="data-table">
            <thead>
              <tr>
                <th>Pago #</th>
                <th>Reserva #</th>
                <th>Fecha Transacción</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let f of datosR3">
                <td class="code-cell">#PAG-{{ f.idPago }}</td>
                <td>#RES-{{ f.idReserva }}</td>
                <td>{{ f.fechaPago | date:'short' }}</td>
                <td class="amount">$ {{ f.monto | number }}</td>
                <td>{{ f.metodo }}</td>
                <td><span class="badge warn">{{ f.estado }}</span></td>
              </tr>
            </tbody>
          </table>

          <!-- R4: Participantes Mes -->
          <table *ngIf="reporteActivo === 'R4' && datosR4.length" class="data-table">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Tour</th>
                <th>Total Participantes</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let f of datosR4">
                <td><strong>{{ f.mes }}</strong></td>
                <td>{{ f.tour }}</td>
                <td class="amount">{{ f.totalParticipantes }} viajeros</td>
              </tr>
            </tbody>
          </table>

          <!-- R5: Guías Más Salidas -->
          <table *ngIf="reporteActivo === 'R5' && datosR5.length" class="data-table">
            <thead>
              <tr>
                <th>Guía Turístico</th>
                <th>Idiomas Certificados</th>
                <th>Total Salidas</th>
                <th>Horas Guiadas Acumuladas</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let f of datosR5">
                <td><strong>{{ f.guia }}</strong></td>
                <td>
                  <span *ngFor="let i of f.idiomas" class="tag-idioma">{{ i }}</span>
                </td>
                <td class="amount">{{ f.totalSalidas }} salidas</td>
                <td>{{ f.horasGuiadas }} horas</td>
              </tr>
            </tbody>
          </table>

          <!-- R6: Ocupación por Categoría -->
          <table *ngIf="reporteActivo === 'R6' && datosR6.length" class="data-table">
            <thead>
              <tr>
                <th>Categoría de Tour</th>
                <th>Salidas Realizadas</th>
                <th>Ocupación Promedio</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let f of datosR6">
                <td><strong>{{ f.categoria }}</strong></td>
                <td>{{ f.salidasRealizadas }} salidas</td>
                <td class="amount">{{ f.ocupacionPromedio | number:'1.1-2' }}%</td>
              </tr>
            </tbody>
          </table>

          <!-- R7: Ingresos Mensuales -->
          <table *ngIf="reporteActivo === 'R7' && datosR7.length" class="data-table">
            <thead>
              <tr>
                <th>Período / Mes</th>
                <th>Método de Pago</th>
                <th>Total Recaudado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let f of datosR7">
                <td><strong>{{ f.mes }}</strong></td>
                <td>{{ f.metodo }}</td>
                <td class="amount text-emerald">$ {{ f.totalIngresos | number }}</td>
              </tr>
            </tbody>
          </table>

          <!-- R8: Prestador Cancelaciones -->
          <table *ngIf="reporteActivo === 'R8' && datosR8.length" class="data-table">
            <thead>
              <tr>
                <th>Prestador Aliado</th>
                <th>Municipio</th>
                <th>Reservas Canceladas</th>
                <th>Monto Cancelado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let f of datosR8">
                <td><strong>{{ f.prestador }}</strong></td>
                <td>{{ f.municipio }}</td>
                <td>{{ f.reservasCanceladas }}</td>
                <td class="amount text-amber">$ {{ f.valorCancelado | number }}</td>
              </tr>
            </tbody>
          </table>

          <!-- R9: Guías Sin Salidas -->
          <table *ngIf="reporteActivo === 'R9' && datosR9.length" class="data-table">
            <thead>
              <tr>
                <th>Nombre del Guía</th>
                <th>Documento</th>
                <th>Tarjeta Profesional</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let f of datosR9">
                <td><strong>{{ f.nombre }}</strong></td>
                <td>{{ f.documento }}</td>
                <td>{{ f.tarjetaProfesional }}</td>
              </tr>
            </tbody>
          </table>

          <!-- R10: Clientes de Alto Gasto -->
          <table *ngIf="reporteActivo === 'R10' && datosR10.length" class="data-table">
            <thead>
              <tr>
                <th>Cliente Titular</th>
                <th>Ciudad de Origen</th>
                <th>Canal Preferido</th>
                <th>Reservas Hechas</th>
                <th>Total Invertido</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let f of datosR10">
                <td><strong>{{ f.cliente }}</strong></td>
                <td>{{ f.ciudadOrigen || 'N/A' }}</td>
                <td><span class="badge info">{{ f.canalPreferido || 'EMAIL' }}</span></td>
                <td>{{ f.numeroReservas }} reservas</td>
                <td class="amount text-emerald">$ {{ f.totalGastado | number }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Estado Vacío -->
          <app-tabla-vacia
            *ngIf="esTablaVacia()"
            titulo="Sin registros para este reporte"
            subtitulo="No hay registros en base de datos que cumplan los criterios.">
          </app-tabla-vacia>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reportes-hub-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .breadcrumb {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-primary-dark);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }

    .page-title {
      font-family: var(--font-heading);
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--color-ink);
      margin: 0 0 6px;
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      font-size: 0.9375rem;
      color: var(--color-ink-muted);
      margin: 0;
    }

    /* Tabs Bar */
    .report-tabs-card {
      padding: 10px;
      border-radius: 16px;
    }

    .report-tabs-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;

      &::-webkit-scrollbar {
        height: 4px;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(16, 185, 129, 0.3);
        border-radius: 4px;
      }
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 10px;
      border: 1px solid transparent;
      background: rgba(255, 255, 255, 0.6);
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-ink-muted);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;

      &:hover {
        background: #ffffff;
        color: var(--color-ink);
      }

      &.active {
        background: var(--color-primary-dark);
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(11, 45, 31, 0.25);

        .tab-code {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
      }
    }

    .tab-code {
      font-family: monospace;
      font-weight: 800;
      font-size: 0.75rem;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(11, 45, 31, 0.08);
      color: var(--color-primary-dark);
    }

    /* Panel Content */
    .report-content-panel {
      padding: 28px;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      flex-wrap: wrap;
    }

    .report-badge {
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-primary);
      margin-bottom: 4px;
    }

    .report-title {
      font-family: var(--font-heading);
      font-size: 1.375rem;
      font-weight: 800;
      color: var(--color-ink);
      margin: 0 0 6px;
    }

    .report-desc {
      font-size: 0.875rem;
      color: var(--color-ink-muted);
      margin: 0;
      max-width: 680px;
    }

    .filter-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .filter-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-ink-muted);

      select, input {
        padding: 6px 10px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        font-size: 0.8125rem;
        background: #ffffff;
      }
    }

    .filter-dates {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Chart */
    .chart-container-box {
      border: 1px solid var(--color-border);
      background: rgba(255, 255, 255, 0.8);
      border-radius: 16px;
      padding: 20px;
    }

    .chart-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-heading);
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--color-ink);
      margin-bottom: 16px;
    }

    .chart-canvas-wrap {
      position: relative;
      height: 280px;
      width: 100%;
    }

    /* Data Table */
    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;

      th {
        background: rgba(11, 45, 31, 0.04);
        padding: 12px 16px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-ink-muted);
        border-bottom: 1px solid var(--color-border);
      }

      td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--color-border);
        vertical-align: middle;
      }

      tbody tr:hover {
        background: rgba(16, 185, 129, 0.03);
      }
    }

    .code-cell {
      font-family: monospace;
      font-weight: 700;
      color: var(--color-primary-dark);
    }

    .amount {
      font-weight: 700;
    }

    .text-emerald { color: #047857; }
    .text-amber { color: #b45309; }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;

      &.diff { background: rgba(11, 45, 31, 0.06); color: var(--color-primary-dark); }
      &.warn { background: rgba(245, 158, 11, 0.12); color: #b45309; }
      &.info { background: rgba(59, 130, 246, 0.12); color: #2563eb; }
    }

    .tag-idioma {
      display: inline-block;
      padding: 2px 6px;
      margin-right: 4px;
      border-radius: 4px;
      background: rgba(16, 185, 129, 0.1);
      color: #047857;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .loading-state {
      padding: 48px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--color-ink-muted);
    }

    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid rgba(16, 185, 129, 0.2);
      border-top-color: #10b981;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ReportesIndiceComponent implements OnInit, AfterViewInit {
  private reportesService = inject(ReportesService);

  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;
  chartInstance?: Chart;

  catalogoReportes: ReportMeta[] = [
    { codigo: 'R1', nombre: 'Catálogo de Tours', descripcion: 'Inventario completo de rutas con duración, edad mínima y precios vigentes.', tieneGrafico: false },
    { codigo: 'R2', nombre: 'Próximas Salidas', descripcion: 'Agenda programada de expediciones turísticas en el departamento.', tieneGrafico: false },
    { codigo: 'R3', nombre: 'Pagos Pendientes', descripcion: 'Transacciones y reservas a la espera de confirmación y recaudo.', tieneGrafico: false },
    { codigo: 'R4', nombre: 'Participantes por Mes', descripcion: 'Consolidado mensual de afluencia de viajeros por ruta turística.', tieneGrafico: true },
    { codigo: 'R5', nombre: 'Salidas por Guía', descripcion: 'Ranking de guías certificados por volumen de salidas y horas acumuladas.', tieneGrafico: false },
    { codigo: 'R6', nombre: 'Ocupación por Categoría', descripcion: 'Tasa de ocupación promedio de cupos por tipología de tour.', tieneGrafico: true },
    { codigo: 'R7', nombre: 'Ingresos Mensuales', descripcion: 'Flujo de caja y recaudo discriminado por medio de pago.', tieneGrafico: true },
    { codigo: 'R8', nombre: 'Cancelaciones Prestador', descripcion: 'Tasa de cancelaciones y valor reembolsado por prestador y municipio.', tieneGrafico: false },
    { codigo: 'R9', nombre: 'Guías Sin Salidas', descripcion: 'Monitoreo de guías certificados que aún no registran salidas asignadas.', tieneGrafico: false },
    { codigo: 'R10', nombre: 'Clientes Alto Gasto', descripcion: 'Padrón de viajeros frecuentes con mayor inversión acumulada en la región.', tieneGrafico: false }
  ];

  reporteActivo = 'R1';
  cargando = false;
  descargandoPdf = false;

  // Filtros
  r1Dificultad = '';
  fechaDesde = '';
  fechaHasta = '';
  r5Minimo = 1;

  // Datos
  datosR1: R1TourCatalogoFila[] = [];
  datosR2: R2SalidaProximaFila[] = [];
  datosR3: R3PagoPendienteFila[] = [];
  datosR4: R4TourParticipantesMesFila[] = [];
  datosR5: R5GuiaSalidasFila[] = [];
  datosR6: R6OcupacionCategoriaFila[] = [];
  datosR7: R7IngresoMensualFila[] = [];
  datosR8: R8PrestadorCancelacionesFila[] = [];
  datosR9: R9GuiaSinSalidasFila[] = [];
  datosR10: R10ClienteAltoGastoFila[] = [];

  get metaActual(): ReportMeta {
    return this.catalogoReportes.find((r) => r.codigo === this.reporteActivo)!;
  }

  ngOnInit(): void {
    this.cargarDatosReporte();
  }

  ngAfterViewInit(): void {
    if (this.metaActual.tieneGrafico) {
      this.actualizarGrafico();
    }
  }

  seleccionarReporte(codigo: string): void {
    this.reporteActivo = codigo;
    this.cargarDatosReporte();
  }

  cargarDatosReporte(): void {
    this.cargando = true;

    switch (this.reporteActivo) {
      case 'R1':
        this.reportesService.getR1(this.r1Dificultad || undefined).subscribe({
          next: (d) => { this.datosR1 = d || []; this.cargando = false; },
          error: () => { this.cargando = false; }
        });
        break;

      case 'R2':
        this.reportesService.getR2(this.fechaDesde || undefined, this.fechaHasta || undefined).subscribe({
          next: (d) => { this.datosR2 = d || []; this.cargando = false; },
          error: () => { this.cargando = false; }
        });
        break;

      case 'R3':
        this.reportesService.getR3().subscribe({
          next: (d) => { this.datosR3 = d || []; this.cargando = false; },
          error: () => { this.cargando = false; }
        });
        break;

      case 'R4':
        this.reportesService.getR4().subscribe({
          next: (d) => {
            this.datosR4 = d || [];
            this.cargando = false;
            setTimeout(() => this.actualizarGrafico(), 100);
          },
          error: () => { this.cargando = false; }
        });
        break;

      case 'R5':
        this.reportesService.obtenerGuiasMasSalidas(undefined, undefined, this.r5Minimo).subscribe({
          next: (d) => { this.datosR5 = d || []; this.cargando = false; },
          error: () => { this.cargando = false; }
        });
        break;

      case 'R6':
        this.reportesService.getR6().subscribe({
          next: (d) => {
            this.datosR6 = d || [];
            this.cargando = false;
            setTimeout(() => this.actualizarGrafico(), 100);
          },
          error: () => { this.cargando = false; }
        });
        break;

      case 'R7':
        this.reportesService.getR7().subscribe({
          next: (d) => {
            this.datosR7 = d || [];
            this.cargando = false;
            setTimeout(() => this.actualizarGrafico(), 100);
          },
          error: () => { this.cargando = false; }
        });
        break;

      case 'R8':
        this.reportesService.getR8().subscribe({
          next: (d) => { this.datosR8 = d || []; this.cargando = false; },
          error: () => { this.cargando = false; }
        });
        break;

      case 'R9':
        this.reportesService.getR9().subscribe({
          next: (d) => { this.datosR9 = d || []; this.cargando = false; },
          error: () => { this.cargando = false; }
        });
        break;

      case 'R10':
        this.reportesService.getR10().subscribe({
          next: (d) => { this.datosR10 = d || []; this.cargando = false; },
          error: () => { this.cargando = false; }
        });
        break;
    }
  }

  actualizarGrafico(): void {
    if (!this.chartCanvas?.nativeElement) return;
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.reporteActivo === 'R4' && this.datosR4.length) {
      const labels = this.datosR4.map((f) => `${f.tour} (${f.mes})`);
      const data = this.datosR4.map((f) => f.totalParticipantes);

      this.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Participantes / Viajeros',
            data,
            backgroundColor: 'rgba(16, 185, 129, 0.75)',
            borderColor: '#10b981',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          }
        }
      });
    } else if (this.reporteActivo === 'R6' && this.datosR6.length) {
      const labels = this.datosR6.map((f) => f.categoria);
      const data = this.datosR6.map((f) => f.ocupacionPromedio);

      this.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: '% Ocupación Promedio',
            data,
            backgroundColor: 'rgba(20, 184, 166, 0.75)',
            borderColor: '#14b8a6',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          }
        }
      });
    } else if (this.reporteActivo === 'R7' && this.datosR7.length) {
      const labels = this.datosR7.map((f) => `${f.metodo} (${f.mes})`);
      const data = this.datosR7.map((f) => f.totalIngresos);

      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Ingresos ($ COP)',
            data,
            borderColor: '#059669',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }

  esTablaVacia(): boolean {
    switch (this.reporteActivo) {
      case 'R1': return !this.datosR1.length;
      case 'R2': return !this.datosR2.length;
      case 'R3': return !this.datosR3.length;
      case 'R4': return !this.datosR4.length;
      case 'R5': return !this.datosR5.length;
      case 'R6': return !this.datosR6.length;
      case 'R7': return !this.datosR7.length;
      case 'R8': return !this.datosR8.length;
      case 'R9': return !this.datosR9.length;
      case 'R10': return !this.datosR10.length;
      default: return true;
    }
  }

  exportarPdfActual(): void {
    this.descargandoPdf = true;
    this.reportesService.descargarPdf(this.reporteActivo).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_${this.reporteActivo}_QuindioStay.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.descargandoPdf = false;
      },
      error: (err) => {
        this.descargandoPdf = false;
        alert('Error al descargar el PDF oficial del reporte.');
      }
    });
  }
}
