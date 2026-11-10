import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalidasService } from './salidas.service';
import { SalidaTour } from '../../core/models/salida-tour.model';
import { TourResumen } from '../../core/models/tour.model';
import { GuiaResumen } from '../../core/models/guia.model';
import { PillEstadoComponent } from '../../shared/pill-estado/pill-estado.component';
import { BarraOcupacionComponent } from '../../shared/barra-ocupacion/barra-ocupacion.component';
import { TablaVaciaComponent } from '../../shared/tabla-vacia/tabla-vacia.component';
import { SalidaFormComponent } from './salida-form.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-salidas-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PillEstadoComponent,
    BarraOcupacionComponent,
    TablaVaciaComponent,
    SalidaFormComponent,
    IconComponent
  ],
  template: `
    <div class="salidas-page animate-fade-in">
      <!-- Encabezado de página -->
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <app-icon name="compass" [size]="14"></app-icon>
            <span>Operaciones · Salidas y Fechas</span>
          </div>
          <h1 class="page-title">Programación de Salidas</h1>
          <p class="page-subtitle">Programa, administra y monitorea la ocupación y aforo de cada tour en el Quindío.</p>
        </div>
        <button class="btn btn-primary" (click)="abrirModalCrear()">
          <app-icon name="plus" [size]="16"></app-icon>
          <span>Nueva Salida</span>
        </button>
      </div>

      <!-- Barra de Filtros -->
      <div class="filters-card glass-card">
        <div class="filter-group search">
          <app-icon name="search" [size]="16" class="search-icon"></app-icon>
          <input
            type="text"
            placeholder="Buscar por tour o guía..."
            [(ngModel)]="filtroTexto"
            (keyup.enter)="aplicarFiltros()" />
        </div>

        <div class="filter-group">
          <select [(ngModel)]="filtroTour" (change)="aplicarFiltros()">
            <option [ngValue]="null">Todos los tours</option>
            <option *ngFor="let t of tours" [ngValue]="t.idTour">{{ t.nombre }}</option>
          </select>
        </div>

        <div class="filter-group">
          <select [(ngModel)]="filtroEstado" (change)="aplicarFiltros()">
            <option value="">Todos los estados</option>
            <option value="PROGRAMADA">Programada</option>
            <option value="REALIZADA">Realizada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>

        <div class="filter-group">
          <input
            type="date"
            [(ngModel)]="filtroFecha"
            (change)="aplicarFiltros()" />
        </div>

        <button class="btn btn-secondary" (click)="limpiarFiltros()">
          <app-icon name="refresh" [size]="14"></app-icon>
          <span>Limpiar</span>
        </button>
      </div>

      <!-- Tabla de Salidas -->
      <div class="table-card glass-card">
        <div *ngIf="cargando" class="loading-state">
          <div class="spinner"></div>
          <span>Cargando salidas programadas...</span>
        </div>

        <div class="table-responsive" *ngIf="!cargando && salidas.length">
          <table class="salidas-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tour y Horario</th>
                <th>Guía Turístico</th>
                <th>Idioma</th>
                <th>Ocupación</th>
                <th>Estado</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of salidas">
                <td class="id-cell">#{{ s.idSalida }}</td>
                <td>
                  <div class="tour-info">
                    <span class="tour-name">{{ s.tour.nombre }}</span>
                    <span class="tour-meta">
                      <app-icon name="calendar" [size]="12"></app-icon>
                      {{ s.fecha }} ·
                      <app-icon name="clock" [size]="12"></app-icon>
                      {{ formatoHora(s.horaInicio) }} - {{ formatoHora(s.horaFin) }} ({{ s.tour.duracionHoras }}h)
                    </span>
                  </div>
                </td>
                <td>
                  <div class="guia-info">
                    <app-icon name="user" [size]="14"></app-icon>
                    <span class="guia-name">{{ s.guia.nombre }}</span>
                  </div>
                </td>
                <td>
                  <span class="idioma-pill">{{ s.idioma.nombre }}</span>
                </td>
                <td>
                  <app-barra-ocupacion
                    [cuposOcupados]="s.cuposOcupados"
                    [totalCupos]="s.cupo">
                  </app-barra-ocupacion>
                </td>
                <td>
                  <app-pill-estado [estado]="s.estado"></app-pill-estado>
                </td>
                <td class="actions-col">
                  <div class="actions-group">
                    <button class="action-btn edit" (click)="abrirModalEditar(s)" title="Editar salida">
                      <app-icon name="edit" [size]="15"></app-icon>
                    </button>
                    <button
                      *ngIf="s.estado === 'PROGRAMADA'"
                      class="action-btn cancel"
                      (click)="confirmarCancelar(s)"
                      title="Cancelar salida">
                      <app-icon name="ban" [size]="15"></app-icon>
                    </button>
                    <button class="action-btn delete" (click)="confirmarEliminar(s)" title="Eliminar">
                      <app-icon name="trash" [size]="15"></app-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-tabla-vacia
          *ngIf="!cargando && !salidas.length"
          titulo="No hay salidas registradas"
          subtitulo="No se encontraron salidas con los criterios o filtros aplicados.">
        </app-tabla-vacia>

        <!-- Paginación -->
        <div *ngIf="totalPaginas > 1" class="pagination-footer">
          <span class="page-info">Página {{ paginaActual + 1 }} de {{ totalPaginas }} ({{ totalElementos }} salidas)</span>
          <div class="pagination-controls">
            <button
              class="page-btn"
              [disabled]="paginaActual === 0"
              (click)="cambiarPagina(paginaActual - 1)">
              Anterior
            </button>
            <button
              class="page-btn"
              [disabled]="paginaActual >= totalPaginas - 1"
              (click)="cambiarPagina(paginaActual + 1)">
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <!-- Modal / Drawer para crear / editar -->
      <app-salida-form
        *ngIf="mostrarModal"
        [salida]="salidaSeleccionada"
        [tours]="tours"
        [guias]="guias"
        (cerrar)="cerrarModal()"
        (guardado)="onSalidaGuardada()">
      </app-salida-form>
    </div>
  `,
  styles: [`
    .salidas-page {
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

    .filters-card {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 16px 20px;
      border-radius: 16px;
      align-items: center;
    }

    .filter-group {
      position: relative;
      display: flex;
      align-items: center;

      &.search {
        flex: 1;
        min-width: 220px;
      }

      .search-icon {
        position: absolute;
        left: 12px;
        color: var(--color-ink-muted);
        pointer-events: none;
      }

      input[type="text"] {
        width: 100%;
        padding: 9px 12px 9px 36px;
        border: 1px solid var(--color-border);
        border-radius: 10px;
        font-size: 0.875rem;
        background: #ffffff;
        color: var(--color-ink);
        transition: all 0.2s;

        &:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }
      }

      select, input[type="date"] {
        padding: 9px 14px;
        border: 1px solid var(--color-border);
        border-radius: 10px;
        font-size: 0.875rem;
        background: #ffffff;
        color: var(--color-ink);
        min-width: 160px;
        transition: all 0.2s;

        &:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }
      }
    }

    .table-card {
      border-radius: 16px;
      padding: 0;
      overflow: hidden;
    }

    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }

    .salidas-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;

      th {
        background: rgba(11, 45, 31, 0.04);
        padding: 14px 18px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-ink-muted);
        border-bottom: 1px solid var(--color-border);
      }

      td {
        padding: 14px 18px;
        border-bottom: 1px solid var(--color-border);
        vertical-align: middle;
      }

      tbody tr {
        transition: background-color 0.15s ease;

        &:hover {
          background: rgba(16, 185, 129, 0.03);
        }
      }
    }

    .id-cell {
      font-family: monospace;
      font-weight: 700;
      color: var(--color-ink-muted);
    }

    .tour-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .tour-name {
      font-weight: 700;
      color: var(--color-ink);
    }

    .tour-meta {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.75rem;
      color: var(--color-ink-muted);
    }

    .guia-info {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: var(--color-ink);
    }

    .idioma-pill {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(11, 45, 31, 0.06);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-primary-dark);
    }

    .actions-col {
      text-align: right;
    }

    .actions-group {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid var(--color-border);
      background: #ffffff;
      color: var(--color-ink-muted);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-1px);
      }

      &.edit:hover {
        background: rgba(16, 185, 129, 0.1);
        color: #059669;
        border-color: rgba(16, 185, 129, 0.3);
      }

      &.cancel:hover {
        background: rgba(245, 158, 11, 0.1);
        color: #d97706;
        border-color: rgba(245, 158, 11, 0.3);
      }

      &.delete:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
        border-color: rgba(239, 68, 68, 0.3);
      }
    }

    .pagination-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      border-top: 1px solid var(--color-border);
      background: rgba(255, 255, 255, 0.4);
    }

    .page-info {
      font-size: 0.8125rem;
      color: var(--color-ink-muted);
    }

    .pagination-controls {
      display: flex;
      gap: 8px;
    }

    .page-btn {
      padding: 6px 14px;
      border-radius: 8px;
      border: 1px solid var(--color-border);
      background: #ffffff;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-ink);
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .loading-state {
      padding: 48px 16px;
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
export class SalidasListaComponent implements OnInit {
  private salidasService = inject(SalidasService);

  salidas: SalidaTour[] = [];
  tours: TourResumen[] = [];
  guias: GuiaResumen[] = [];

  cargando = true;
  paginaActual = 0;
  totalPaginas = 0;
  totalElementos = 0;
  tamanoPagina = 10;

  filtroTexto = '';
  filtroTour: number | null = null;
  filtroEstado = '';
  filtroFecha = '';

  mostrarModal = false;
  salidaSeleccionada: SalidaTour | null = null;

  ngOnInit(): void {
    this.cargarSalidas();
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.salidasService.listarToursResumen().subscribe({
      next: (tours) => (this.tours = tours),
      error: (e) => console.error('Error al cargar tours resumen', e)
    });

    this.salidasService.listarGuiasResumen().subscribe({
      next: (guias) => (this.guias = guias),
      error: (e) => console.error('Error al cargar guías resumen', e)
    });
  }

  cargarSalidas(): void {
    this.cargando = true;
    const params: any = {
      page: this.paginaActual,
      size: this.tamanoPagina,
      sort: 'fecha,asc'
    };

    if (this.filtroTour) params.idTour = this.filtroTour;
    if (this.filtroEstado) params.estado = this.filtroEstado;
    if (this.filtroFecha) params.fecha = this.filtroFecha;

    this.salidasService.listar(params).subscribe({
      next: (pagina) => {
        let items = pagina.contenido;
        if (this.filtroTexto.trim()) {
          const txt = this.filtroTexto.toLowerCase();
          items = items.filter(
            (s: SalidaTour) =>
              s.tour.nombre.toLowerCase().includes(txt) ||
              s.guia.nombre.toLowerCase().includes(txt)
          );
        }
        this.salidas = items;
        this.totalPaginas = pagina.totalPaginas;
        this.totalElementos = pagina.totalElementos;
        this.cargando = false;
      },
      error: (e: any) => {
        console.error('Error al cargar salidas', e);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.paginaActual = 0;
    this.cargarSalidas();
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroTour = null;
    this.filtroEstado = '';
    this.filtroFecha = '';
    this.paginaActual = 0;
    this.cargarSalidas();
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.cargarSalidas();
  }

  formatoHora(hora: string): string {
    if (!hora) return '';
    return hora.substring(0, 5);
  }

  abrirModalCrear(): void {
    this.salidaSeleccionada = null;
    this.mostrarModal = true;
  }

  abrirModalEditar(salida: SalidaTour): void {
    this.salidaSeleccionada = salida;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.salidaSeleccionada = null;
  }

  onSalidaGuardada(): void {
    this.cerrarModal();
    this.cargarSalidas();
  }

  confirmarCancelar(salida: SalidaTour): void {
    if (confirm(`¿Deseas cancelar la salida #${salida.idSalida} del tour "${salida.tour.nombre}"?`)) {
      this.salidasService.cancelar(salida.idSalida).subscribe({
        next: () => this.cargarSalidas(),
        error: (err) => alert(err.error?.mensaje || 'Error al cancelar salida')
      });
    }
  }

  confirmarEliminar(salida: SalidaTour): void {
    if (confirm(`¿Estás seguro de eliminar permanentemente la salida #${salida.idSalida}?`)) {
      this.salidasService.eliminar(salida.idSalida).subscribe({
        next: () => this.cargarSalidas(),
        error: (err) => alert(err.error?.mensaje || 'Error al eliminar salida')
      });
    }
  }
}
