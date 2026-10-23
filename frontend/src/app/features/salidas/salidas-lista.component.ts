import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalidasService } from './salidas.service';
import { SalidaTour } from '../../core/models/salida-tour.model';
import { TourResumen } from '../../core/models/tour.model';
import { PillEstadoComponent } from '../../shared/pill-estado/pill-estado.component';
import { BarraOcupacionComponent } from '../../shared/barra-ocupacion/barra-ocupacion.component';
import { BotonComponent } from '../../shared/boton/boton.component';
import { TablaVaciaComponent } from '../../shared/tabla-vacia/tabla-vacia.component';
import { SalidaFormComponent } from './salida-form.component';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-salidas-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PillEstadoComponent,
    BarraOcupacionComponent,
    BotonComponent,
    TablaVaciaComponent,
    SalidaFormComponent
  ],
  template: `
    <div class="salidas-page">
      <!-- Encabezado de página -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Salidas de Tour</h1>
          <p class="page-subtitle">Programa, administra y monitorea la ocupación de cada salida.</p>
        </div>
        <app-boton variant="primary" (click)="abrirModalCrear()">
          + Nueva salida
        </app-boton>
      </div>

      <!-- Barra de Filtros -->
      <div class="filters-card">
        <div class="filter-group search">
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

        <app-boton variant="secondary" (click)="limpiarFiltros()">
          Limpiar
        </app-boton>
      </div>

      <!-- Tabla de Salidas -->
      <div class="table-card">
        <div *ngIf="cargando" class="loading-state">
          Cargando salidas de tour...
        </div>

        <table *ngIf="!cargando && salidas.length" class="salidas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tour y Horario</th>
              <th>Guía</th>
              <th>Idioma</th>
              <th>Cupos</th>
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
                    📅 {{ s.fecha }} · ⏰ {{ formatoHora(s.horaInicio) }} - {{ formatoHora(s.horaFin) }} ({{ s.tour.duracionHoras }}h)
                  </span>
                </div>
              </td>
              <td>
                <span class="guia-name">🧭 {{ s.guia.nombre }}</span>
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
                  <button class="action-btn edit" (click)="abrirModalEditar(s)" title="Editar">
                    ✏️
                  </button>
                  <button
                    *ngIf="s.estado === 'PROGRAMADA'"
                    class="action-btn cancel"
                    (click)="confirmarCancelar(s)"
                    title="Cancelar salida">
                    🚫
                  </button>
                  <button class="action-btn delete" (click)="confirmarEliminar(s)" title="Eliminar">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <app-tabla-vacia
          *ngIf="!cargando && !salidas.length"
          titulo="No hay salidas registradas"
          subtitulo="No se encontraron salidas con los filtros aplicados.">
        </app-tabla-vacia>

        <!-- Paginación -->
        <div *ngIf="totalPaginas > 1" class="pagination-footer">
          <span class="page-info">Página {{ paginaActual + 1 }} de {{ totalPaginas }} ({{ totalElementos }} salidas)</span>
          <div class="page-buttons">
            <button [disabled]="paginaActual === 0" (click)="cambiarPagina(paginaActual - 1)">Anterior</button>
            <button [disabled]="paginaActual >= totalPaginas - 1" (click)="cambiarPagina(paginaActual + 1)">Siguiente</button>
          </div>
        </div>
      </div>

      <!-- Panel lateral de Crear/Editar -->
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
      max-width: 1200px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      .page-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--ink);
        letter-spacing: -0.02em;
        margin: 0 0 4px;
      }
      .page-subtitle {
        font-size: 0.9375rem;
        color: var(--mute);
        margin: 0;
      }
    }
    .filters-card {
      background: var(--white);
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      .filter-group {
        input, select {
          padding: 8px 12px;
          border: 1px solid var(--line);
          border-radius: 10px;
          font-size: 0.875rem;
          font-family: inherit;
          color: var(--ink);
          &:focus { outline: none; border-color: var(--green); }
        }
        &.search input { min-width: 240px; }
      }
    }
    .table-card {
      background: var(--white);
      border: 1px solid var(--line);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    }
    .loading-state {
      padding: 48px;
      text-align: center;
      color: var(--mute);
      font-size: 0.9375rem;
    }
    .salidas-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;
      th {
        background: var(--mist);
        color: var(--mute);
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 14px 20px;
        border-bottom: 1px solid var(--line);
      }
      td {
        padding: 16px 20px;
        border-bottom: 1px solid var(--line);
        color: var(--ink);
        vertical-align: middle;
      }
      tr:last-child td { border-bottom: none; }
      tr:hover td { background: rgba(243, 248, 244, 0.5); }
    }
    .id-cell { font-weight: 600; color: var(--mute); }
    .tour-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
      .tour-name { font-weight: 600; color: var(--ink); font-size: 0.9375rem; }
      .tour-meta { font-size: 0.75rem; color: var(--mute); }
    }
    .guia-name { font-weight: 500; }
    .idioma-pill {
      background: var(--mist);
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--pine);
    }
    .actions-col { text-align: right; }
    .actions-group {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
      .action-btn {
        background: none;
        border: 1px solid var(--line);
        border-radius: 6px;
        padding: 4px 8px;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s;
        &:hover { background: var(--mist); border-color: #CBD5E1; }
        &.cancel:hover { background: #FEF3C7; border-color: #FCD34D; }
        &.delete:hover { background: #FEE2E2; border-color: #FCA5A5; }
      }
    }
    .pagination-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      border-top: 1px solid var(--line);
      background: var(--mist);
      .page-info { font-size: 0.8125rem; color: var(--mute); }
      .page-buttons button {
        padding: 6px 12px;
        border: 1px solid var(--line);
        background: var(--white);
        border-radius: 6px;
        font-size: 0.8125rem;
        cursor: pointer;
        margin-left: 8px;
        &:disabled { opacity: 0.5; cursor: not-allowed; }
      }
    }
  `]
})
export class SalidasListaComponent implements OnInit {
  private salidasService = inject(SalidasService);

  salidas: SalidaTour[] = [];
  tours: TourResumen[] = [];
  guias: any[] = [];
  cargando = true;

  filtroTexto = '';
  filtroTour: number | null = null;
  filtroEstado = '';
  filtroFecha = '';

  paginaActual = 0;
  totalPaginas = 0;
  totalElementos = 0;

  mostrarModal = false;
  salidaSeleccionada: SalidaTour | null = null;

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarSalidas();
  }

  cargarCatalogos(): void {
    this.salidasService.listarTours().subscribe(tours => this.tours = tours);
    this.salidasService.listarGuias().subscribe(guias => this.guias = guias);
  }

  cargarSalidas(): void {
    this.cargando = true;
    this.salidasService.buscar({
      texto: this.filtroTexto || undefined,
      idTour: this.filtroTour || undefined,
      estado: this.filtroEstado || undefined,
      fecha: this.filtroFecha || undefined,
      page: this.paginaActual,
      size: 10
    }).subscribe({
      next: (res) => {
        this.salidas = res.contenido;
        this.paginaActual = res.paginaActual;
        this.totalPaginas = res.totalPaginas;
        this.totalElementos = res.totalElementos;
        this.cargando = false;
      },
      error: () => {
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
    this.aplicarFiltros();
  }

  cambiarPagina(page: number): void {
    this.paginaActual = page;
    this.cargarSalidas();
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
    if (confirm(`¿Seguro que deseas cancelar la salida #${salida.idSalida} de "${salida.tour.nombre}"?`)) {
      this.salidasService.cancelar(salida.idSalida).subscribe({
        next: () => this.cargarSalidas(),
        error: (err) => alert(err.error?.mensaje || 'Error al cancelar la salida')
      });
    }
  }

  confirmarEliminar(salida: SalidaTour): void {
    if (confirm(`¿Seguro que deseas eliminar la salida #${salida.idSalida}? Esta acción no se puede deshacer.`)) {
      this.salidasService.eliminar(salida.idSalida).subscribe({
        next: () => this.cargarSalidas(),
        error: (err) => {
          if (err.status === 409) {
            alert(err.error?.mensaje || 'La salida tiene reservas: cancélala en lugar de eliminarla');
          } else {
            alert(err.error?.mensaje || 'Error al eliminar la salida');
          }
        }
      });
    }
  }

  formatoHora(hora: string | null): string {
    if (!hora) return '';
    return hora.substring(0, 5);
  }
}
