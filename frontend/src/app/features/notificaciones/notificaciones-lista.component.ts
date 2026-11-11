import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NotificacionesService } from './notificaciones.service';
import { ClientesService } from '../clientes/clientes.service';
import {
  NotificacionDto,
  CrearNotificacionRequest,
  TipoNotificacion,
  CanalNotificacion,
  EstadoNotificacion
} from '../../core/models/notificacion.model';
import { ClienteDto } from '../../core/models/cliente.model';
import { IconComponent } from '../../shared/icon/icon.component';
import { PillEstadoComponent } from '../../shared/pill-estado/pill-estado.component';
import { TablaVaciaComponent } from '../../shared/tabla-vacia/tabla-vacia.component';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-notificaciones-lista',
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
    <div class="notificaciones-page animate-fade-in">
      <!-- Encabezado de página -->
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <app-icon name="bell" [size]="14"></app-icon>
            <span>{{ authService.esCliente() ? 'Mis Notificaciones y Alertas' : 'Comunicaciones · Mensajería y Alertas' }}</span>
          </div>
          <h1 class="page-title">{{ authService.esCliente() ? 'Buzón de Notificaciones' : 'Centro de Notificaciones' }}</h1>
          <p class="page-subtitle">{{ authService.esCliente() ? 'Consulta tus confirmaciones de viaje, recordatorios de tours y novedades.' : 'Historial de alertas de viaje, confirmaciones de pago y recordatorios automáticos.' }}</p>
        </div>
        <button *ngIf="!authService.esCliente()" class="btn btn-primary" (click)="abrirModalCrear()">
          <app-icon name="plus" [size]="16"></app-icon>
          <span>Nueva Notificación</span>
        </button>
      </div>

      <!-- Filtros -->
      <div class="filters-card glass-card">
        <div class="filter-group search">
          <app-icon name="search" [size]="16" class="search-icon"></app-icon>
          <input
            type="text"
            placeholder="Buscar por destinatario o mensaje..."
            [(ngModel)]="filtroTexto"
            (ngModelChange)="filtrarNotificaciones()" />
        </div>

        <div class="filter-group">
          <select [(ngModel)]="filtroCanal" (change)="filtrarNotificaciones()">
            <option value="">Todos los canales</option>
            <option value="CORREO">Correo Electrónico</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="SMS">SMS</option>
          </select>
        </div>

        <div class="filter-group">
          <select [(ngModel)]="filtroEstado" (change)="filtrarNotificaciones()">
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="ENVIADA">Enviada</option>
            <option value="LEIDA">Leída</option>
            <option value="FALLIDA">Fallida</option>
          </select>
        </div>

        <button class="btn btn-secondary" (click)="limpiarFiltros()">
          <app-icon name="refresh" [size]="14"></app-icon>
          <span>Limpiar</span>
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="cargando" class="loading-state glass-card">
        <div class="spinner"></div>
        <span>Cargando notificaciones...</span>
      </div>

      <!-- Lista de Notificaciones -->
      <div *ngIf="!cargando && notificacionesFiltradas.length" class="notificaciones-list">
        <div
          *ngFor="let n of notificacionesFiltradas"
          class="notificacion-card glass-card"
          [class.no-leida]="n.estado !== 'LEIDA'">
          <div class="notif-icon-col">
            <div class="notif-avatar" [ngClass]="n.tipo.toLowerCase()">
              <app-icon [name]="obtenerIconoTipo(n.tipo)" [size]="20"></app-icon>
            </div>
          </div>

          <div class="notif-content-col">
            <div class="notif-header">
              <div class="notif-meta">
                <span class="destinatario">{{ n.clienteNombre }}</span>
                <span class="canal-badge" [ngClass]="n.canal.toLowerCase()">
                  {{ n.canal }}
                </span>
                <span class="tipo-tag">{{ formatoTipo(n.tipo) }}</span>
                <span *ngIf="n.idReserva" class="reserva-tag">#RES-{{ n.idReserva }}</span>
              </div>
              <div class="notif-date">
                <app-icon name="clock" [size]="12"></app-icon>
                <span>{{ n.fechaEnvioReal || n.fechaProgramada | date:'medium' }}</span>
              </div>
            </div>

            <p class="notif-mensaje">{{ n.mensaje }}</p>

            <div class="notif-footer">
              <app-pill-estado [estado]="n.estado"></app-pill-estado>

              <button
                *ngIf="n.estado !== 'LEIDA'"
                class="btn-mark-read"
                (click)="marcarComoLeida(n)"
                title="Marcar como leída">
                <app-icon name="check" [size]="14"></app-icon>
                <span>Marcar como leída</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <app-tabla-vacia
        *ngIf="!cargando && !notificacionesFiltradas.length"
        titulo="No hay notificaciones registradas"
        subtitulo="Las alertas programadas y recordatorios automáticos aparecerán aquí.">
      </app-tabla-vacia>

      <!-- MODAL CREAR NOTIFICACIÓN -->
      <div class="modal-backdrop" *ngIf="mostrarModal" (click)="cerrarModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Programar Notificación</h3>
              <p class="modal-subtitle">Envío de mensaje o recordatorio a un viajero registrado</p>
            </div>
            <button class="close-btn" (click)="cerrarModal()">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="guardar()" class="modal-body">
            <div class="form-group">
              <label class="form-label">Cliente Destinatario <span class="req">*</span></label>
              <select formControlName="idCliente" class="form-control">
                <option [ngValue]="null" disabled>Selecciona un cliente</option>
                <option *ngFor="let c of clientes" [ngValue]="c.idCliente">
                  {{ c.nombres }} {{ c.apellidos }} ({{ c.correo }})
                </option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Tipo de Notificación <span class="req">*</span></label>
                <select formControlName="tipo" class="form-control">
                  <option value="RECORDATORIO_RESERVA">Recordatorio de Salida</option>
                  <option value="CONFIRMACION_RESERVA">Confirmación de Reserva</option>
                  <option value="CONFIRMACION_PAGO">Confirmación de Pago</option>
                  <option value="CAMBIO_ESTADO">Cambio de Estado</option>
                  <option value="PROMOCION">Oferta / Promoción</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Canal de Envío <span class="req">*</span></label>
                <select formControlName="canal" class="form-control">
                  <option value="CORREO">Correo Electrónico</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Fecha Programada <span class="req">*</span></label>
              <input
                type="datetime-local"
                formControlName="fechaProgramada"
                class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label">Mensaje / Contenido <span class="req">*</span></label>
              <textarea
                formControlName="mensaje"
                rows="4"
                placeholder="Escribe el mensaje de la notificación..."
                class="form-control">
              </textarea>
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
                <span>{{ guardando ? 'Programando...' : 'Programar Notificación' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notificaciones-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 1200px;
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
        min-width: 170px;

        &:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }
      }
    }

    /* Lista */
    .notificaciones-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .notificacion-card {
      padding: 18px 20px;
      border-radius: 16px;
      display: flex;
      gap: 18px;
      align-items: flex-start;
      transition: all 0.2s ease;

      &.no-leida {
        border-left: 4px solid var(--color-primary);
        background: rgba(255, 255, 255, 0.85);
      }
    }

    .notif-avatar {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.recordatorio_reserva { background: rgba(245, 158, 11, 0.15); color: #d97706; }
      &.confirmacion_reserva { background: rgba(16, 185, 129, 0.15); color: #059669; }
      &.confirmacion_pago { background: rgba(139, 92, 246, 0.15); color: #7c3aed; }
      &.cambio_estado { background: rgba(59, 130, 246, 0.15); color: #2563eb; }
      &.promocion { background: rgba(236, 72, 153, 0.15); color: #db2777; }
    }

    .notif-content-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .notif-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .destinatario {
      font-weight: 700;
      color: var(--color-ink);
      font-size: 0.9375rem;
    }

    .canal-badge {
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 5px;
      text-transform: uppercase;

      &.correo { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
      &.whatsapp { background: rgba(16, 185, 129, 0.15); color: #047857; }
      &.sms { background: rgba(139, 92, 246, 0.15); color: #7c3aed; }
    }

    .tipo-tag {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-ink-muted);
    }

    .reserva-tag {
      font-size: 0.6875rem;
      font-family: monospace;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(11, 45, 31, 0.05);
      color: var(--color-ink);
    }

    .notif-date {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      color: var(--color-ink-muted);
    }

    .notif-mensaje {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-ink);
      line-height: 1.5;
    }

    .notif-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }

    .btn-mark-read {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid var(--color-border);
      background: #ffffff;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-ink);
      cursor: pointer;
      transition: all 0.15s;

      &:hover {
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(16, 185, 129, 0.3);
        color: #047857;
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
      gap: 14px;
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
export class NotificacionesListaComponent implements OnInit {
  private notificacionesService = inject(NotificacionesService);
  private clientesService = inject(ClientesService);
  private fb = inject(FormBuilder);
  authService = inject(AuthService);

  notificaciones: NotificacionDto[] = [];
  notificacionesFiltradas: NotificacionDto[] = [];
  clientes: ClienteDto[] = [];

  cargando = true;
  guardando = false;
  filtroTexto = '';
  filtroCanal = '';
  filtroEstado = '';

  mostrarModal = false;
  errorMensaje: string | null = null;

  form = this.fb.group({
    idCliente: [null as number | null, [Validators.required]],
    tipo: ['RECORDATORIO_RESERVA' as TipoNotificacion, [Validators.required]],
    canal: ['CORREO' as CanalNotificacion, [Validators.required]],
    fechaProgramada: ['', [Validators.required]],
    mensaje: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit(): void {
    this.cargarNotificaciones();
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.clientesService.listar().subscribe({
      next: (cls) => (this.clientes = cls || [])
    });
  }

  cargarNotificaciones(): void {
    this.cargando = true;
    this.notificacionesService.listar().subscribe({
      next: (data) => {
        this.notificaciones = data || [];
        this.filtrarNotificaciones();
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error al cargar notificaciones', e);
        this.cargando = false;
      }
    });
  }

  filtrarNotificaciones(): void {
    let res = [...this.notificaciones];
    if (this.filtroTexto.trim()) {
      const q = this.filtroTexto.toLowerCase();
      res = res.filter(
        (n) =>
          n.clienteNombre?.toLowerCase().includes(q) ||
          n.mensaje?.toLowerCase().includes(q)
      );
    }
    if (this.filtroCanal) {
      res = res.filter((n) => n.canal === this.filtroCanal);
    }
    if (this.filtroEstado) {
      res = res.filter((n) => n.estado === this.filtroEstado);
    }
    this.notificacionesFiltradas = res;
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroCanal = '';
    this.filtroEstado = '';
    this.filtrarNotificaciones();
  }

  obtenerIconoTipo(tipo: string): string {
    switch (tipo) {
      case 'RECORDATORIO_RESERVA': return 'clock';
      case 'CONFIRMACION_RESERVA': return 'ticket';
      case 'CONFIRMACION_PAGO': return 'credit-card';
      case 'PROMOCION': return 'sparkles';
      default: return 'bell';
    }
  }

  formatoTipo(tipo: string): string {
    switch (tipo) {
      case 'RECORDATORIO_RESERVA': return 'Recordatorio de Salida';
      case 'CONFIRMACION_RESERVA': return 'Confirmación de Reserva';
      case 'CONFIRMACION_PAGO': return 'Confirmación de Pago';
      case 'CAMBIO_ESTADO': return 'Actualización de Estado';
      case 'PROMOCION': return 'Oferta Especial';
      default: return tipo;
    }
  }

  abrirModalCrear(): void {
    this.errorMensaje = null;
    const ahora = new Date();
    const manana = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
    const fechaIso = manana.toISOString().substring(0, 16);

    this.form.reset({
      idCliente: this.clientes.length ? this.clientes[0].idCliente : null,
      tipo: 'RECORDATORIO_RESERVA',
      canal: 'CORREO',
      fechaProgramada: fechaIso,
      mensaje: '¡Hola! Te recordamos que tu tour programado con QuindíoStay inicia pronto. Lleva calzado cómodo e hidratación.'
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardar(): void {
    if (this.form.invalid) return;

    this.guardando = true;
    this.errorMensaje = null;
    const v = this.form.value;

    const req: CrearNotificacionRequest = {
      idCliente: v.idCliente!,
      tipo: v.tipo as TipoNotificacion,
      canal: v.canal as CanalNotificacion,
      fechaProgramada: v.fechaProgramada!,
      mensaje: v.mensaje!
    };

    this.notificacionesService.crear(req).subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.cargarNotificaciones();
      },
      error: (err) => {
        this.guardando = false;
        this.errorMensaje = err.error?.mensaje || 'Error al programar notificación';
      }
    });
  }

  marcarComoLeida(n: NotificacionDto): void {
    this.notificacionesService.marcarLeida(n.idNotificacion).subscribe({
      next: () => {
        n.estado = 'LEIDA';
      },
      error: (err) => {
        console.error('Error al marcar leída', err);
      }
    });
  }
}
