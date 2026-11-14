import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PagosService } from './pagos.service';
import { ReservasService } from '../reservas/reservas.service';
import { PagoDetalleDto, CrearPagoRequest, MetodoPago, EstadoPago } from '../../core/models/pago.model';
import { ReservaDetalleDto } from '../../core/models/reserva.model';
import { IconComponent } from '../../shared/icon/icon.component';
import { PillEstadoComponent } from '../../shared/pill-estado/pill-estado.component';
import { TablaVaciaComponent } from '../../shared/tabla-vacia/tabla-vacia.component';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-pagos-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IconComponent,
    PillEstadoComponent,
    TablaVaciaComponent
  ],
  template: `
    <div class="pagos-page animate-fade-in">
      <!-- Encabezado de página -->
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <app-icon name="dollar-sign" [size]="14"></app-icon>
            <span>{{ authService.esCliente() ? 'Mis Pagos · Historial de Comprobantes' : 'Tesorería · Pasarela y Recaudos' }}</span>
          </div>
          <h1 class="page-title">{{ authService.esCliente() ? 'Mis Pagos Realizados' : 'Historial y Control de Pagos' }}</h1>
          <p class="page-subtitle">{{ authService.esCliente() ? 'Consulta tus pagos, métodos utilizados y estado de cada transacción.' : 'Registro de transacciones, comprobantes digitales y gestión de reembolsos.' }}</p>
        </div>
        <button *ngIf="!authService.esCliente()" class="btn btn-primary" (click)="abrirModalNuevoPago()">
          <app-icon name="plus" [size]="16"></app-icon>
          <span>Registrar Transacción</span>
        </button>
      </div>

      <!-- Resumen Financiero Rápido -->
      <div *ngIf="!authService.esCliente()" class="kpi-mini-grid">
        <div class="kpi-mini glass-card">
          <div class="kpi-mini-label">Total Recaudado</div>
          <div class="kpi-mini-val">$ {{ totalRecaudado | number }}</div>
        </div>
        <div class="kpi-mini glass-card">
          <div class="kpi-mini-label">Transacciones Exitosas</div>
          <div class="kpi-mini-val green">{{ totalExitosos }}</div>
        </div>
        <div class="kpi-mini glass-card">
          <div class="kpi-mini-label">Reembolsos Emitidos</div>
          <div class="kpi-mini-val blue">{{ totalReembolsos }}</div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-card glass-card">
        <div class="filter-group search">
          <app-icon name="search" [size]="16" class="search-icon"></app-icon>
          <input
            type="text"
            placeholder="Buscar por cliente, tour, o referencia..."
            [(ngModel)]="filtroTexto"
            (ngModelChange)="filtrarPagos()" />
        </div>

        <div class="filter-group">
          <select [(ngModel)]="filtroEstado" (change)="filtrarPagos()">
            <option value="">Todos los estados</option>
            <option value="EXITOSO">Exitoso</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="REEMBOLSADO">Reembolsado</option>
            <option value="FALLIDO">Fallido</option>
          </select>
        </div>

        <button class="btn btn-secondary" (click)="limpiarFiltros()">
          <app-icon name="refresh" [size]="14"></app-icon>
          <span>Limpiar</span>
        </button>
      </div>

      <!-- Tabla de Pagos -->
      <div class="table-card glass-card">
        <div *ngIf="cargando" class="loading-state">
          <div class="spinner"></div>
          <span>Cargando transacciones bancarias y pasarelas...</span>
        </div>

        <div class="table-responsive" *ngIf="!cargando && pagosFiltrados.length">
          <table class="pagos-table">
            <thead>
              <tr>
                <th>ID Transacción</th>
                <th>Reserva</th>
                <th>Cliente & Tour</th>
                <th>Monto</th>
                <th>Método de Pago</th>
                <th>Referencia</th>
                <th>Fecha y Hora</th>
                <th>Estado</th>
                <th class="actions-col">Comprobante</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pagosPaginados">
                <td class="id-cell">#PAG-{{ p.idPago }}</td>
                <td>
                  <span class="reserva-tag">#RES-{{ p.idReserva }}</span>
                </td>
                <td>
                  <div class="cliente-tour">
                    <span class="c-name">{{ p.clienteNombre }}</span>
                    <span class="t-name">{{ p.tourNombre }}</span>
                  </div>
                </td>
                <td class="monto-cell">
                  <span class="monto-val">$ {{ p.monto | number }}</span>
                </td>
                <td>
                  <div class="metodo-chip">
                    <app-icon name="credit-card" [size]="13"></app-icon>
                    <span>{{ formatoMetodo(p.metodo) }}</span>
                  </div>
                </td>
                <td>
                  <span class="ref-cell">{{ p.referenciaTransaccion || 'N/A' }}</span>
                </td>
                <td>
                  <span class="fecha-cell">{{ p.fechaPago | date:'short' }}</span>
                </td>
                <td>
                  <app-pill-estado [estado]="p.estado"></app-pill-estado>
                </td>
                <td class="actions-col">
                  <div class="actions-group">
                    <a [href]="'/api/plantillas/pago/' + p.idPago" target="_blank" class="action-btn pdf-btn" title="Descargar Recibo de Pago (PDF)">
                      <app-icon name="file-text" [size]="14"></app-icon>
                    </a>
                    <button
                      *ngIf="!authService.esCliente() && p.estado === 'EXITOSO'"
                      class="action-btn refund"
                      (click)="confirmarReembolso(p)"
                      title="Emitir reembolso">
                      <app-icon name="refresh" [size]="14"></app-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-tabla-vacia
          *ngIf="!cargando && !pagosFiltrados.length"
          titulo="No se encontraron pagos"
          subtitulo="Aún no hay transacciones registradas con los filtros actuales.">
        </app-tabla-vacia>

        <!-- Paginación Visual de Pagos -->
        <div *ngIf="totalPaginas > 1" class="pagination-footer">
          <span class="page-info">Página {{ paginaActual + 1 }} de {{ totalPaginas }} ({{ pagosFiltrados.length }} transacciones)</span>
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

      <!-- MODAL NUEVO PAGO -->
      <div class="modal-backdrop" *ngIf="mostrarModal" (click)="cerrarModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Registrar Nueva Transacción</h3>
              <p class="modal-subtitle">Asocia el pago a una reserva con saldo pendiente</p>
            </div>
            <button class="close-btn" (click)="cerrarModal()">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="guardarPago()" class="modal-body">
            <div class="form-group">
              <label class="form-label">Reserva Asociada <span class="req">*</span></label>
              <select formControlName="idReserva" class="form-control" (change)="onReservaChange()">
                <option [ngValue]="null" disabled>Selecciona una reserva con saldo</option>
                <option *ngFor="let r of reservasConSaldo" [ngValue]="r.idReserva">
                  #RES-{{ r.idReserva }} · {{ r.clienteNombreCompleto }} · Saldo: $ {{ r.saldoPendiente | number }}
                </option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Monto a Abonar <span class="req">*</span></label>
                <input
                  type="number"
                  formControlName="monto"
                  class="form-control"
                  min="100" />
              </div>

              <div class="form-group">
                <label class="form-label">Método de Pago <span class="req">*</span></label>
                <select formControlName="metodo" class="form-control">
                  <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                  <option value="TARJETA_DEBITO">Tarjeta Débito</option>
                  <option value="PSE">Transferencia PSE</option>
                  <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                  <option value="EFECTIVO">Efectivo en Taquilla</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Referencia / Pasarela de Pago</label>
              <input
                type="text"
                formControlName="referenciaTransaccion"
                class="form-control"
                placeholder="Ej. PSE-948103 o Wompi REF" />
            </div>

            <div *ngIf="errorMensaje" class="error-alert">
              <app-icon name="alert" [size]="16"></app-icon>
              <span>{{ errorMensaje }}</span>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="cerrarModal()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || guardando">
                <app-icon name="check" [size]="16"></app-icon>
                <span>{{ guardando ? 'Registrando...' : 'Confirmar Pago' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pagos-page {
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

    .kpi-mini-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .kpi-mini {
      padding: 16px 20px;
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .kpi-mini-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-ink-muted);
      letter-spacing: 0.04em;
    }

    .kpi-mini-val {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--color-ink);

      &.green { color: #059669; }
      &.blue { color: #2563eb; }
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
        min-width: 240px;
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

        &:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }
      }

      select {
        padding: 9px 14px;
        border: 1px solid var(--color-border);
        border-radius: 10px;
        font-size: 0.875rem;
        background: #ffffff;
        color: var(--color-ink);
        min-width: 180px;

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

    .pagos-table {
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

      tbody tr:hover {
        background: rgba(16, 185, 129, 0.03);
      }
    }

    .id-cell {
      font-family: monospace;
      font-weight: 700;
      color: var(--color-primary-dark);
    }

    .reserva-tag {
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(11, 45, 31, 0.05);
      font-size: 0.75rem;
      font-family: monospace;
      font-weight: 700;
      color: var(--color-ink);
    }

    .cliente-tour {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .c-name { font-weight: 700; color: var(--color-ink); }
      .t-name { font-size: 0.75rem; color: var(--color-ink-muted); }
    }

    .monto-cell {
      white-space: nowrap;
    }

    .monto-val {
      font-weight: 800;
      color: #047857;
      font-size: 0.9375rem;
      white-space: nowrap;
    }

    .metodo-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(11, 45, 31, 0.06);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-ink);
    }

    .ref-cell {
      font-family: monospace;
      font-size: 0.75rem;
      color: var(--color-ink-muted);
    }

    .fecha-cell {
      font-size: 0.8125rem;
      color: var(--color-ink-muted);
    }

    .actions-col {
      text-align: right;
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
      transition: all 0.2s;

      &.refund:hover {
        background: rgba(59, 130, 246, 0.1);
        color: #2563eb;
        border-color: rgba(59, 130, 246, 0.3);
      }
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(7, 25, 17, 0.5);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-dialog {
      background: #ffffff;
      border-radius: 20px;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }

    .modal-header {
      padding: 22px 24px;
      background: linear-gradient(135deg, rgba(11, 45, 31, 0.04) 0%, rgba(16, 185, 129, 0.06) 100%);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .modal-title {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--color-ink);
      margin: 0 0 4px;
    }

    .modal-subtitle {
      font-size: 0.8125rem;
      color: var(--color-ink-muted);
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--color-ink-muted);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
    }

    .modal-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .form-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-ink);

      .req { color: #dc2626; }
    }

    .form-control {
      padding: 9px 12px;
      border: 1px solid var(--color-border);
      border-radius: 10px;
      font-size: 0.875rem;
      color: var(--color-ink);

      &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
      }
    }

    .error-alert {
      padding: 10px 14px;
      border-radius: 8px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      font-size: 0.8125rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 14px;
      border-top: 1px solid var(--color-border);
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

    @media (max-width: 768px) {
      .kpi-mini-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class PagosListaComponent implements OnInit {
  private pagosService = inject(PagosService);
  private reservasService = inject(ReservasService);
  private fb = inject(FormBuilder);
  authService = inject(AuthService);

  pagos: PagoDetalleDto[] = [];
  pagosFiltrados: PagoDetalleDto[] = [];
  pagosPaginados: PagoDetalleDto[] = [];
  reservasConSaldo: ReservaDetalleDto[] = [];

  cargando = true;
  guardando = false;
  filtroTexto = '';
  filtroEstado = '';

  paginaActual = 0;
  tamanoPagina = 8;
  totalPaginas = 0;

  totalRecaudado = 0;
  totalExitosos = 0;
  totalReembolsos = 0;

  mostrarModal = false;
  errorMensaje: string | null = null;

  form = this.fb.group({
    idReserva: [null as number | null, [Validators.required]],
    monto: [0, [Validators.required, Validators.min(100)]],
    metodo: ['TARJETA_CREDITO' as MetodoPago, [Validators.required]],
    referenciaTransaccion: ['']
  });

  ngOnInit(): void {
    this.cargarPagos();
    this.cargarReservasConSaldo();
  }

  cargarPagos(): void {
    this.cargando = true;
    this.pagosService.listar().subscribe({
      next: (data) => {
        this.pagos = data || [];
        this.calcularMetricas();
        this.filtrarPagos();
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error al cargar pagos', e);
        this.cargando = false;
      }
    });
  }

  cargarReservasConSaldo(): void {
    this.reservasService.listar().subscribe({
      next: (res) => {
        this.reservasConSaldo = (res || []).filter((r) => r.saldoPendiente > 0 && r.estado !== 'CANCELADA');
      }
    });
  }

  calcularMetricas(): void {
    this.totalRecaudado = this.pagos
      .filter((p) => p.estado === 'EXITOSO')
      .reduce((acc, p) => acc + (p.monto || 0), 0);
    this.totalExitosos = this.pagos.filter((p) => p.estado === 'EXITOSO').length;
    this.totalReembolsos = this.pagos.filter((p) => p.estado === 'REEMBOLSADO').length;
  }

  filtrarPagos(): void {
    let res = [...this.pagos];
    if (this.filtroTexto.trim()) {
      const q = this.filtroTexto.toLowerCase();
      res = res.filter(
        (p) =>
          p.clienteNombre?.toLowerCase().includes(q) ||
          p.tourNombre?.toLowerCase().includes(q) ||
          p.referenciaTransaccion?.toLowerCase().includes(q) ||
          p.idPago.toString().includes(q)
      );
    }
    if (this.filtroEstado) {
      res = res.filter((p) => p.estado === this.filtroEstado);
    }
    this.pagosFiltrados = res;
    this.totalPaginas = Math.ceil(this.pagosFiltrados.length / this.tamanoPagina) || 1;
    if (this.paginaActual >= this.totalPaginas) {
      this.paginaActual = 0;
    }
    this.actualizarPagina();
  }

  actualizarPagina(): void {
    const inicio = this.paginaActual * this.tamanoPagina;
    this.pagosPaginados = this.pagosFiltrados.slice(inicio, inicio + this.tamanoPagina);
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      this.actualizarPagina();
    }
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroEstado = '';
    this.paginaActual = 0;
    this.filtrarPagos();
  }

  formatoMetodo(metodo: string): string {
    switch (metodo) {
      case 'TARJETA_CREDITO': return 'Tarjeta de Crédito';
      case 'TARJETA_DEBITO': return 'Tarjeta Débito';
      case 'PSE': return 'PSE';
      case 'TRANSFERENCIA': return 'Transferencia';
      case 'EFECTIVO': return 'Efectivo';
      default: return metodo;
    }
  }

  abrirModalNuevoPago(): void {
    this.errorMensaje = null;
    this.form.reset({
      idReserva: this.reservasConSaldo.length ? this.reservasConSaldo[0].idReserva : null,
      monto: this.reservasConSaldo.length ? this.reservasConSaldo[0].saldoPendiente : 0,
      metodo: 'TARJETA_CREDITO',
      referenciaTransaccion: 'SIM-' + Math.floor(100000 + Math.random() * 900000)
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  onReservaChange(): void {
    const id = this.form.get('idReserva')?.value;
    const r = this.reservasConSaldo.find((res) => res.idReserva === id);
    if (r) {
      this.form.patchValue({ monto: r.saldoPendiente });
    }
  }

  guardarPago(): void {
    if (this.form.invalid) return;

    this.guardando = true;
    this.errorMensaje = null;
    const v = this.form.value;

    const req: CrearPagoRequest = {
      idReserva: v.idReserva!,
      monto: v.monto!,
      metodo: v.metodo!,
      referenciaTransaccion: v.referenciaTransaccion || undefined
    };

    this.pagosService.registrarPago(req).subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.cargarPagos();
        this.cargarReservasConSaldo();
      },
      error: (err) => {
        this.guardando = false;
        this.errorMensaje = err.error?.mensaje || 'Error al procesar el pago';
      }
    });
  }

  confirmarReembolso(pago: PagoDetalleDto): void {
    if (confirm(`¿Deseas emitir un reembolso para la transacción #PAG-${pago.idPago} por $ ${pago.monto.toLocaleString()}?`)) {
      this.pagosService.reembolsar(pago.idPago).subscribe({
        next: () => {
          this.cargarPagos();
        },
        error: (err) => {
          alert(err.error?.mensaje || 'Error al emitir reembolso');
        }
      });
    }
  }
}
