import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ReservasService } from './reservas.service';
import { SalidasService } from '../salidas/salidas.service';
import { PlanesService } from '../planes/planes.service';
import { ClientesService } from '../clientes/clientes.service';
import { AuthService } from '../../core/auth/auth.service';
import { PagosService } from '../pagos/pagos.service';
import {
  ReservaDetalleDto,
  CrearReservaRequest,
  EstadoReserva,
  CanalReserva,
  ParticipanteDto
} from '../../core/models/reserva.model';
import { SalidaTour } from '../../core/models/salida-tour.model';
import { PlanDto } from '../../core/models/plan.model';
import { ClienteDto } from '../../core/models/cliente.model';
import { CrearPagoRequest, MetodoPago } from '../../core/models/pago.model';
import { IconComponent } from '../../shared/icon/icon.component';
import { PillEstadoComponent } from '../../shared/pill-estado/pill-estado.component';
import { TablaVaciaComponent } from '../../shared/tabla-vacia/tabla-vacia.component';

@Component({
  selector: 'app-reservas-lista',
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
    <div class="reservas-page animate-fade-in">
      <!-- Encabezado de página -->
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <app-icon name="ticket" [size]="14"></app-icon>
            <span>{{ authService.esCliente() ? 'Mis Viajes · Reservas y Boletos' : 'Operaciones · Transacciones y Boletos' }}</span>
          </div>
          <h1 class="page-title">{{ authService.esCliente() ? 'Mis Reservas de Tours' : 'Gestión de Reservas' }}</h1>
          <p class="page-subtitle">{{ authService.esCliente() ? 'Consulta el estado de tus reservas, fechas de salida y saldo pendiente.' : 'Control de boletos, registro de pasajeros y políticas de cancelación.' }}</p>
        </div>
        <button class="btn btn-primary" (click)="abrirModalNuevaReserva()">
          <app-icon name="plus" [size]="16"></app-icon>
          <span>Nueva Reserva</span>
        </button>
      </div>

      <!-- Barra de Filtros -->
      <div class="filters-card glass-card">
        <div class="filter-group search">
          <app-icon name="search" [size]="16" class="search-icon"></app-icon>
          <input
            type="text"
            placeholder="Buscar por cliente, tour o código..."
            [(ngModel)]="filtroTexto"
            (ngModelChange)="filtrarReservas()" />
        </div>

        <div class="filter-group">
          <select [(ngModel)]="filtroEstado" (change)="filtrarReservas()">
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendientes de Pago</option>
            <option value="CONFIRMADA">Confirmadas (100% Pagadas)</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
        </div>

        <button class="btn btn-secondary" (click)="limpiarFiltros()">
          <app-icon name="refresh" [size]="14"></app-icon>
          <span>Limpiar</span>
        </button>
      </div>

      <!-- Tabla de Reservas -->
      <div class="table-card glass-card">
        <div *ngIf="cargando" class="loading-state">
          <div class="spinner"></div>
          <span>Cargando reservas y expedientes...</span>
        </div>

        <div class="table-responsive" *ngIf="!cargando && reservasFiltradas.length">
          <table class="reservas-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Tour & Salida</th>
                <th>Pax</th>
                <th>Total / Saldo</th>
                <th>Canal</th>
                <th>Estado</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of reservasFiltradas">
                <td class="code-cell">#RES-{{ r.idReserva }}</td>
                <td>
                  <div class="cliente-info">
                    <span class="cliente-name">{{ r.clienteNombreCompleto }}</span>
                    <span class="cliente-email">{{ r.clienteCorreo }}</span>
                  </div>
                </td>
                <td>
                  <div class="tour-info">
                    <span class="tour-name">{{ r.tourNombre }}</span>
                    <span class="tour-meta">
                      <app-icon name="calendar" [size]="12"></app-icon>
                      {{ r.fechaServicio }} · {{ r.guiaNombre }}
                    </span>
                  </div>
                </td>
                <td>
                  <span class="pax-badge">
                    <app-icon name="users" [size]="12"></app-icon>
                    {{ r.participantes.length || 0 }}
                  </span>
                </td>
                <td>
                  <div class="valores-info">
                    <span class="valor-total">$ {{ r.valorTotal | number }}</span>
                    <span class="valor-saldo" [class.saldo-cero]="r.saldoPendiente === 0">
                      {{ r.saldoPendiente === 0 ? 'Pagado completo' : 'Saldo: $' + (r.saldoPendiente | number) }}
                    </span>
                  </div>
                </td>
                <td>
                  <span class="canal-tag">{{ r.canal }}</span>
                </td>
                <td>
                  <app-pill-estado [estado]="r.estado"></app-pill-estado>
                </td>
                <td class="actions-col">
                  <div class="actions-group">
                    <button class="action-btn view" (click)="verDetalle(r)" title="Ver detalle de reserva">
                      <app-icon name="eye" [size]="15"></app-icon>
                    </button>
                    <button
                      *ngIf="r.saldoPendiente > 0 && r.estado !== 'CANCELADA'"
                      class="action-btn pay"
                      (click)="abrirModalPagar(r)"
                      title="Registrar pago">
                      <app-icon name="credit-card" [size]="15"></app-icon>
                    </button>
                    <button
                      *ngIf="r.estado !== 'CANCELADA'"
                      class="action-btn cancel"
                      (click)="abrirModalCancelar(r)"
                      title="Cancelar reserva (RN05)">
                      <app-icon name="ban" [size]="15"></app-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-tabla-vacia
          *ngIf="!cargando && !reservasFiltradas.length"
          titulo="No se encontraron reservas"
          subtitulo="No existen registros que coincidan con los filtros aplicados.">
        </app-tabla-vacia>
      </div>

      <!-- MODAL NUEVA RESERVA -->
      <div class="modal-backdrop" *ngIf="mostrarModalNueva" (click)="cerrarModalNueva()">
        <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Registrar Nueva Reserva</h3>
              <p class="modal-subtitle">Selecciona la salida, el plan y agrega los participantes (Validación RN06)</p>
            </div>
            <button class="close-btn" (click)="cerrarModalNueva()">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form [formGroup]="formReserva" (ngSubmit)="guardarReserva()" class="modal-body">
            <!-- Salida y Plan -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Salida de Tour Programada <span class="req">*</span></label>
                <select formControlName="idSalida" class="form-control" (change)="onSalidaSeleccionada()">
                  <option [ngValue]="null" disabled>Selecciona una salida</option>
                  <option *ngFor="let s of salidasDisponibles" [ngValue]="s.idSalida">
                    {{ s.tour.nombre }} - {{ s.fecha }} {{ s.horaInicio.substring(0,5) }} ({{ s.cupo - s.cuposOcupados }} cupos libres)
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Plan / Paquete <span class="req">*</span></label>
                <select formControlName="idPlan" class="form-control">
                  <option [ngValue]="null" disabled>Selecciona un plan</option>
                  <option *ngFor="let p of planesDisponibles" [ngValue]="p.idPlan">
                    {{ p.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Cliente y Canal -->
            <div class="form-row">
              <div class="form-group" *ngIf="!authService.esCliente()">
                <label class="form-label">Cliente Titular <span class="req">*</span></label>
                <select formControlName="idCliente" class="form-control">
                  <option [ngValue]="null" disabled>Selecciona un cliente</option>
                  <option *ngFor="let c of clientesDisponibles" [ngValue]="c.idCliente">
                    {{ c.nombres }} {{ c.apellidos }} ({{ c.correo }})
                  </option>
                </select>
              </div>

              <div class="form-group" *ngIf="authService.esCliente()">
                <label class="form-label">Cliente Titular</label>
                <div class="readonly-field">
                  {{ clientesDisponibles.length ? (clientesDisponibles[0].nombres + ' ' + clientesDisponibles[0].apellidos + ' (' + clientesDisponibles[0].correo + ')') : (authService.usuarioActual()?.nombre || 'Cliente Conectado') }}
                </div>
              </div>

              <div class="form-group" *ngIf="!authService.esCliente()">
                <label class="form-label">Canal de Reserva <span class="req">*</span></label>
                <select formControlName="canal" class="form-control">
                  <option value="WEB">Portal Web Oficial</option>
                  <option value="APP_MOVIL">Aplicación Móvil</option>
                  <option value="MOSTRADOR">Taquilla Mostrador</option>
                  <option value="TELEFONO">Línea Telefónica</option>
                  <option value="AGENCIA_INTERMEDIARIA">Agencia Aliada</option>
                </select>
              </div>

              <div class="form-group" *ngIf="authService.esCliente()">
                <label class="form-label">Canal de Reserva</label>
                <div class="readonly-field">Portal Web Oficial (WEB)</div>
              </div>
            </div>

            <!-- Participantes (RN06) -->
            <div class="participantes-section">
              <div class="section-title-row">
                <div>
                  <h4 class="sub-title">Pasajeros / Participantes</h4>
                  <p class="sub-desc">Cada persona debe quedar registrada con su edad para la póliza turística.</p>
                </div>
                <button type="button" class="btn btn-sm btn-outline" (click)="agregarParticipante()">
                  <app-icon name="plus" [size]="14"></app-icon>
                  <span>Agregar Pasajero</span>
                </button>
              </div>

              <!-- Alerta Regla RN06 -->
              <div *ngIf="tieneInfraccionRN06" class="alert-rn06">
                <app-icon name="alert" [size]="16"></app-icon>
                <span><strong>Regla RN06:</strong> Hay menores de 18 años registrados. Debe incluir al menos un adulto responsable (mayor de 18 años) en la reserva.</span>
              </div>

              <div class="participantes-list" formArrayName="participantes">
                <div
                  *ngFor="let p of participantesArray.controls; let i = index"
                  [formGroupName]="i"
                  class="participante-row">
                  <span class="pax-num">#{{ i + 1 }}</span>
                  <div class="pax-field name">
                    <input
                      type="text"
                      formControlName="nombre"
                      placeholder="Nombre y Apellidos completos"
                      class="form-control" />
                  </div>
                  <div class="pax-field age">
                    <input
                      type="number"
                      formControlName="edad"
                      placeholder="Edad"
                      min="0"
                      max="120"
                      class="form-control" />
                  </div>
                  <button
                    type="button"
                    class="btn-remove"
                    *ngIf="participantesArray.length > 1"
                    (click)="removerParticipante(i)"
                    title="Quitar pasajero">
                    <app-icon name="trash" [size]="14"></app-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- Resumen de Costo -->
            <div class="resumen-calculo glass-card">
              <div class="resumen-item">
                <span class="label">Total Pasajeros:</span>
                <span class="val">{{ participantesArray.length }} personas</span>
              </div>
              <div class="resumen-item" *ngIf="salidaSeleccionadaObj">
                <span class="label">Tarifa base por persona:</span>
                <span class="val">$ {{ salidaSeleccionadaObj.tour.precioPersona | number }}</span>
              </div>
              <div class="resumen-item total-highlight" *ngIf="salidaSeleccionadaObj">
                <span class="label">Total a Pagar (RN01):</span>
                <span class="val">$ {{ (salidaSeleccionadaObj.tour.precioPersona * participantesArray.length) | number }}</span>
              </div>
            </div>

            <div *ngIf="errorMensaje" class="error-alert">
              <app-icon name="alert" [size]="16"></app-icon>
              <span>{{ errorMensaje }}</span>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="cerrarModalNueva()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="formReserva.invalid || tieneInfraccionRN06 || guardando">
                <app-icon name="check" [size]="16"></app-icon>
                <span>{{ guardando ? 'Confirmando...' : 'Crear Reserva' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL DETALLE DE RESERVA -->
      <div class="modal-backdrop" *ngIf="reservaDetalle" (click)="reservaDetalle = null">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Detalle de Reserva #RES-{{ reservaDetalle.idReserva }}</h3>
              <p class="modal-subtitle">Fecha de creación: {{ reservaDetalle.fechaCreacion | date:'medium' }}</p>
            </div>
            <button class="close-btn" (click)="reservaDetalle = null">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="modal-body">
            <div class="detail-grid">
              <div class="detail-box">
                <span class="d-label">Cliente</span>
                <span class="d-val">{{ reservaDetalle.clienteNombreCompleto }}</span>
                <span class="d-sub">{{ reservaDetalle.clienteCorreo }}</span>
              </div>
              <div class="detail-box">
                <span class="d-label">Tour & Guía</span>
                <span class="d-val">{{ reservaDetalle.tourNombre }}</span>
                <span class="d-sub">{{ reservaDetalle.guiaNombre }} ({{ reservaDetalle.idiomaNombre }})</span>
              </div>
              <div class="detail-box">
                <span class="d-label">Fecha de Salida</span>
                <span class="d-val">{{ reservaDetalle.fechaServicio }}</span>
                <span class="d-sub">Plan: {{ reservaDetalle.planNombre }}</span>
              </div>
              <div class="detail-box">
                <span class="d-label">Estado Financiero</span>
                <div class="status-row">
                  <app-pill-estado [estado]="reservaDetalle.estado"></app-pill-estado>
                  <span class="d-val">$ {{ reservaDetalle.totalPagado | number }} / $ {{ reservaDetalle.valorTotal | number }}</span>
                </div>
              </div>
            </div>

            <div class="pax-table-wrap">
              <h4 class="sub-title">Pasajeros Acreditados</h4>
              <table class="pax-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre Completo</th>
                    <th>Edad</th>
                    <th>Condición</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of reservaDetalle.participantes; let idx = index">
                    <td>{{ idx + 1 }}</td>
                    <td><strong>{{ p.nombre }}</strong></td>
                    <td>{{ p.edad }} años</td>
                    <td>
                      <span class="pax-tag" [class.adult]="p.edad >= 18" [class.minor]="p.edad < 18">
                        {{ p.edad >= 18 ? 'Adulto' : 'Menor de Edad' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="reservaDetalle = null">
                Cerrar
              </button>
              <button
                *ngIf="reservaDetalle.saldoPendiente > 0 && reservaDetalle.estado !== 'CANCELADA'"
                type="button"
                class="btn btn-primary"
                (click)="abrirModalPagar(reservaDetalle)">
                <app-icon name="credit-card" [size]="16"></app-icon>
                <span>Abonar Saldo ($ {{ reservaDetalle.saldoPendiente | number }})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL REGISTRAR PAGO -->
      <div class="modal-backdrop" *ngIf="reservaParaPagar" (click)="reservaParaPagar = null">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Registrar Pago a Reserva #{{ reservaParaPagar.idReserva }}</h3>
              <p class="modal-subtitle">Saldo pendiente actual: $ {{ reservaParaPagar.saldoPendiente | number }}</p>
            </div>
            <button class="close-btn" (click)="reservaParaPagar = null">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form [formGroup]="formPago" (ngSubmit)="guardarPago()" class="modal-body">
            <div class="form-group">
              <label class="form-label">Monto a Pagar ($ COP) <span class="req">*</span></label>
              <input
                type="number"
                class="form-control"
                formControlName="monto"
                [max]="reservaParaPagar.saldoPendiente"
                min="1" />
            </div>

            <div class="form-group">
              <label class="form-label">Método de Pago <span class="req">*</span></label>
              <select formControlName="metodo" class="form-control">
                <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                <option value="TARJETA_DEBITO">Tarjeta Débito</option>
                <option value="PSE">Transferencia PSE</option>
                <option value="TRANSFERENCIA">Transferencia Bancaria Directa</option>
                <option value="EFECTIVO">Efectivo en Taquilla</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Referencia / Pasarela de Pago</label>
              <input
                type="text"
                class="form-control"
                formControlName="referenciaTransaccion"
                placeholder="Autogenerado o número de recibo" />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="reservaParaPagar = null">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="formPago.invalid || guardando">
                <app-icon name="check" [size]="16"></app-icon>
                <span>{{ guardando ? 'Procesando...' : 'Confirmar Pago' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL CANCELAR RESERVA (RN05) -->
      <div class="modal-backdrop" *ngIf="reservaParaCancelar" (click)="reservaParaCancelar = null">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Cancelar Reserva #RES-{{ reservaParaCancelar.idReserva }}</h3>
              <p class="modal-subtitle">Aplicación estricta de la política de reembolsos RN05</p>
            </div>
            <button class="close-btn" (click)="reservaParaCancelar = null">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="modal-body">
            <div class="politica-box">
              <div class="politica-header">
                <app-icon name="shield" [size]="16"></app-icon>
                <span>Política Oficial de Cancelaciones (RN05)</span>
              </div>
              <ul class="politica-list">
                <li>Más de 48 horas antes de la salida: <strong>100% de reembolso</strong> del valor pagado.</li>
                <li>Entre 24 y 48 horas antes: <strong>50% de reembolso</strong> del valor pagado.</li>
                <li>Menos de 24 horas antes o no-show: <strong>0% de reembolso</strong>.</li>
              </ul>
            </div>

            <div class="form-group">
              <label class="form-label">Motivo de Cancelación <span class="req">*</span></label>
              <textarea
                class="form-control"
                rows="3"
                [(ngModel)]="motivoCancelacion"
                placeholder="Especifique el motivo de la cancelación...">
              </textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="reservaParaCancelar = null">
                Volver
              </button>
              <button
                type="button"
                class="btn btn-danger"
                [disabled]="!motivoCancelacion.trim() || guardando"
                (click)="ejecutarCancelacion()">
                <app-icon name="ban" [size]="16"></app-icon>
                <span>{{ guardando ? 'Cancelando...' : 'Confirmar Cancelación' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reservas-page {
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

    .reservas-table {
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

    .code-cell {
      font-family: monospace;
      font-weight: 700;
      color: var(--color-primary-dark);
    }

    .cliente-info, .tour-info, .valores-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .cliente-name, .tour-name {
      font-weight: 700;
      color: var(--color-ink);
    }

    .cliente-email, .tour-meta {
      font-size: 0.75rem;
      color: var(--color-ink-muted);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .pax-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(11, 45, 31, 0.06);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-ink);
    }

    .valor-total {
      font-weight: 700;
      color: var(--color-ink);
    }

    .valor-saldo {
      font-size: 0.75rem;
      font-weight: 600;
      color: #d97706;

      &.saldo-cero {
        color: #059669;
      }
    }

    .canal-tag {
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(11, 45, 31, 0.05);
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--color-ink-muted);
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
      transition: all 0.2s;

      &.view:hover {
        background: rgba(16, 185, 129, 0.1);
        color: #059669;
        border-color: rgba(16, 185, 129, 0.3);
      }

      &.pay:hover {
        background: rgba(139, 92, 246, 0.1);
        color: #7c3aed;
        border-color: rgba(139, 92, 246, 0.3);
      }

      &.cancel:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
        border-color: rgba(239, 68, 68, 0.3);
      }
    }

    /* Modal Styles */
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
      max-width: 540px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;

      &.modal-lg {
        max-width: 680px;
      }
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

      &:hover {
        background: rgba(0, 0, 0, 0.05);
        color: var(--color-ink);
      }
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
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

    .readonly-field {
      padding: 9px 12px;
      border: 1px solid var(--color-border);
      border-radius: 10px;
      font-size: 0.875rem;
      color: var(--color-ink);
      background: #f9fafb;
      font-weight: 600;
    }

    /* Participantes Section */
    .participantes-section {
      border: 1px solid var(--color-border);
      border-radius: 14px;
      padding: 16px;
      background: rgba(11, 45, 31, 0.02);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .section-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .sub-title {
      font-family: var(--font-heading);
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0 0 2px;
    }

    .sub-desc {
      font-size: 0.75rem;
      color: var(--color-ink-muted);
      margin: 0;
    }

    .btn-sm {
      padding: 6px 10px;
      font-size: 0.75rem;
    }

    .btn-outline {
      background: #ffffff;
      border: 1px solid var(--color-border);
      color: var(--color-ink);
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;

      &:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
    }

    .alert-rn06 {
      padding: 10px 14px;
      border-radius: 8px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      font-size: 0.8125rem;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      line-height: 1.4;
    }

    .participantes-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .participante-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .pax-num {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-ink-muted);
      width: 24px;
    }

    .pax-field {
      &.name { flex: 1; }
      &.age { width: 85px; }
    }

    .btn-remove {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid #fecaca;
      background: #fef2f2;
      color: #dc2626;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .resumen-calculo {
      padding: 14px 18px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.2);

      .resumen-item {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .label { font-size: 0.75rem; color: var(--color-ink-muted); }
        .val { font-weight: 700; color: var(--color-ink); font-size: 0.9375rem; }

        &.total-highlight .val {
          color: #047857;
          font-size: 1.125rem;
        }
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

    /* Detalle View */
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 16px;
    }

    .detail-box {
      padding: 12px 14px;
      background: rgba(11, 45, 31, 0.03);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      gap: 3px;

      .d-label { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-ink-muted); }
      .d-val { font-weight: 700; color: var(--color-ink); font-size: 0.875rem; }
      .d-sub { font-size: 0.75rem; color: var(--color-ink-muted); }
      .status-row { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
    }

    .pax-table-wrap {
      border: 1px solid var(--color-border);
      border-radius: 12px;
      overflow: hidden;
    }

    .pax-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8125rem;

      th {
        background: rgba(11, 45, 31, 0.04);
        padding: 10px 14px;
        font-weight: 700;
        text-align: left;
      }

      td {
        padding: 10px 14px;
        border-top: 1px solid var(--color-border);
      }
    }

    .pax-tag {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.6875rem;
      font-weight: 700;

      &.adult { background: rgba(16, 185, 129, 0.15); color: #047857; }
      &.minor { background: rgba(245, 158, 11, 0.15); color: #b45309; }
    }

    /* Cancelación RN05 Box */
    .politica-box {
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 12px;

      .politica-header {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 700;
        color: #b45309;
        font-size: 0.8125rem;
        margin-bottom: 8px;
      }

      .politica-list {
        margin: 0;
        padding-left: 20px;
        font-size: 0.8125rem;
        color: var(--color-ink);
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
    }

    .btn-danger {
      background: #dc2626;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 10px 18px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;

      &:hover:not(:disabled) {
        background: #b91c1c;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
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
export class ReservasListaComponent implements OnInit {
  private reservasService = inject(ReservasService);
  private salidasService = inject(SalidasService);
  private planesService = inject(PlanesService);
  private clientesService = inject(ClientesService);
  private pagosService = inject(PagosService);
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  reservas: ReservaDetalleDto[] = [];
  reservasFiltradas: ReservaDetalleDto[] = [];
  salidasDisponibles: SalidaTour[] = [];
  planesDisponibles: PlanDto[] = [];
  clientesDisponibles: ClienteDto[] = [];

  cargando = true;
  guardando = false;
  filtroTexto = '';
  filtroEstado = '';

  // Modales
  mostrarModalNueva = false;
  reservaDetalle: ReservaDetalleDto | null = null;
  reservaParaPagar: ReservaDetalleDto | null = null;
  reservaParaCancelar: ReservaDetalleDto | null = null;
  motivoCancelacion = '';
  errorMensaje: string | null = null;
  salidaSeleccionadaObj: SalidaTour | null = null;

  // Formularios reactivos
  formReserva = this.fb.group({
    idSalida: [null as number | null, [Validators.required]],
    idPlan: [null as number | null, [Validators.required]],
    idCliente: [null as number | null, [Validators.required]],
    canal: ['WEB' as CanalReserva, [Validators.required]],
    participantes: this.fb.array([])
  });

  formPago = this.fb.group({
    monto: [0, [Validators.required, Validators.min(1)]],
    metodo: ['TARJETA_CREDITO' as MetodoPago, [Validators.required]],
    referenciaTransaccion: ['']
  });

  get participantesArray(): FormArray {
    return this.formReserva.get('participantes') as FormArray;
  }

  // Regla de Negocio RN06: Si hay menores (< 18), debe haber al menos un adulto (>= 18)
  get tieneInfraccionRN06(): boolean {
    const paxs = this.participantesArray.value as ParticipanteDto[];
    if (!paxs || paxs.length === 0) return false;

    const hayMenor = paxs.some((p) => p.edad !== null && p.edad !== undefined && p.edad < 18);
    const hayAdulto = paxs.some((p) => p.edad !== null && p.edad !== undefined && p.edad >= 18);

    return hayMenor && !hayAdulto;
  }

  ngOnInit(): void {
    this.cargarReservas();
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.salidasService.listar({ size: 50, estado: 'PROGRAMADA' }).subscribe({
      next: (page) => (this.salidasDisponibles = page.contenido || [])
    });

    this.planesService.listar().subscribe({
      next: (planes) => {
        this.planesDisponibles = planes || [];
        if (planes.length && !this.formReserva.get('idPlan')?.value) {
          this.formReserva.patchValue({ idPlan: planes[0].idPlan });
        }
      }
    });

    // Si es CLIENTE, obtener solo su perfil (no tiene permiso para listar todos)
    if (this.authService.esCliente()) {
      this.clientesService.obtenerMiPerfil().subscribe({
        next: (miPerfil) => {
          this.clientesDisponibles = [miPerfil];
          this.formReserva.patchValue({ idCliente: miPerfil.idCliente, canal: 'WEB' });
        }
      });
    } else {
      this.clientesService.listar().subscribe({
        next: (clientes) => {
          this.clientesDisponibles = clientes || [];
          if (clientes.length && !this.formReserva.get('idCliente')?.value) {
            this.formReserva.patchValue({ idCliente: clientes[0].idCliente });
          }
        }
      });
    }
  }

  cargarReservas(): void {
    this.cargando = true;
    this.reservasService.listar().subscribe({
      next: (data) => {
        this.reservas = data || [];
        this.filtrarReservas();
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error al cargar reservas', e);
        this.cargando = false;
      }
    });
  }

  filtrarReservas(): void {
    let res = [...this.reservas];
    if (this.filtroTexto.trim()) {
      const q = this.filtroTexto.toLowerCase();
      res = res.filter(
        (r) =>
          r.clienteNombreCompleto?.toLowerCase().includes(q) ||
          r.clienteCorreo?.toLowerCase().includes(q) ||
          r.tourNombre?.toLowerCase().includes(q) ||
          r.idReserva.toString().includes(q)
      );
    }
    if (this.filtroEstado) {
      res = res.filter((r) => r.estado === this.filtroEstado);
    }
    this.reservasFiltradas = res;
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroEstado = '';
    this.filtrarReservas();
  }

  abrirModalNuevaReserva(): void {
    this.errorMensaje = null;
    const esCliente = this.authService.esCliente();
    
    // Asegurar que los catálogos estén disponibles
    this.cargarCatalogos();

    this.formReserva.reset({
      idSalida: this.salidasDisponibles.length ? this.salidasDisponibles[0].idSalida : null,
      idPlan: this.planesDisponibles.length ? this.planesDisponibles[0].idPlan : null,
      idCliente: this.clientesDisponibles.length ? this.clientesDisponibles[0].idCliente : null,
      canal: 'WEB'
    });
    this.participantesArray.clear();
    this.agregarParticipante(); // 1 default participant
    if (this.salidasDisponibles.length) {
      this.salidaSeleccionadaObj = this.salidasDisponibles[0];
    } else {
      this.salidaSeleccionadaObj = null;
    }
    this.mostrarModalNueva = true;
  }

  cerrarModalNueva(): void {
    this.mostrarModalNueva = false;
  }

  agregarParticipante(): void {
    const fg = this.fb.group({
      nombre: ['', [Validators.required]],
      edad: [25, [Validators.required, Validators.min(0), Validators.max(120)]]
    });
    this.participantesArray.push(fg);
  }

  removerParticipante(index: number): void {
    if (this.participantesArray.length > 1) {
      this.participantesArray.removeAt(index);
    }
  }

  onSalidaSeleccionada(): void {
    const id = this.formReserva.get('idSalida')?.value;
    this.salidaSeleccionadaObj = this.salidasDisponibles.find((s) => s.idSalida === id) || null;
  }

  guardarReserva(): void {
    if (this.formReserva.invalid || this.tieneInfraccionRN06) return;

    this.guardando = true;
    this.errorMensaje = null;
    const v = this.formReserva.value;

    const req: CrearReservaRequest = {
      idSalida: v.idSalida!,
      idPlan: v.idPlan!,
      idCliente: v.idCliente!,
      canal: v.canal!,
      participantes: v.participantes as ParticipanteDto[]
    };

    this.reservasService.crear(req).subscribe({
      next: (reservaCreada) => {
        this.guardando = false;
        this.cerrarModalNueva();
        this.cargarReservas();
      },
      error: (err) => {
        this.guardando = false;
        this.errorMensaje = err.error?.mensaje || 'Error al procesar la reserva';
      }
    });
  }

  verDetalle(reserva: ReservaDetalleDto): void {
    this.reservaDetalle = reserva;
  }

  abrirModalPagar(reserva: ReservaDetalleDto): void {
    this.reservaParaPagar = reserva;
    this.formPago.reset({
      monto: reserva.saldoPendiente,
      metodo: 'TARJETA_CREDITO',
      referenciaTransaccion: 'SIM-' + Math.floor(100000 + Math.random() * 900000)
    });
  }

  guardarPago(): void {
    if (this.formPago.invalid || !this.reservaParaPagar) return;

    this.guardando = true;
    const val = this.formPago.value;

    const req: CrearPagoRequest = {
      idReserva: this.reservaParaPagar.idReserva,
      monto: val.monto!,
      metodo: val.metodo!,
      referenciaTransaccion: val.referenciaTransaccion || undefined
    };

    this.pagosService.registrarPago(req).subscribe({
      next: () => {
        this.guardando = false;
        this.reservaParaPagar = null;
        if (this.reservaDetalle) {
          this.reservaDetalle = null;
        }
        this.cargarReservas();
      },
      error: (err) => {
        this.guardando = false;
        alert(err.error?.mensaje || 'Error al procesar el pago');
      }
    });
  }

  abrirModalCancelar(reserva: ReservaDetalleDto): void {
    this.reservaParaCancelar = reserva;
    this.motivoCancelacion = 'Cancelación solicitada por el usuario';
  }

  ejecutarCancelacion(): void {
    if (!this.reservaParaCancelar) return;

    this.guardando = true;
    this.reservasService.cancelar(this.reservaParaCancelar.idReserva, this.motivoCancelacion).subscribe({
      next: (resp) => {
        this.guardando = false;
        this.reservaParaCancelar = null;
        this.cargarReservas();
      },
      error: (err) => {
        this.guardando = false;
        alert(err.error?.mensaje || 'Error al cancelar reserva');
      }
    });
  }
}
