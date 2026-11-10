import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PlanesService } from './planes.service';
import { PrestadoresService } from '../prestadores/prestadores.service';
import { PlanDto, CrearPlanRequest, TipoPlan, EstadoPlan } from '../../core/models/plan.model';
import { PrestadorDto } from '../../core/models/prestador.model';
import { IconComponent } from '../../shared/icon/icon.component';
import { PillEstadoComponent } from '../../shared/pill-estado/pill-estado.component';
import { TablaVaciaComponent } from '../../shared/tabla-vacia/tabla-vacia.component';

@Component({
  selector: 'app-planes-lista',
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
    <div class="planes-page animate-fade-in">
      <!-- Encabezado de página -->
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <app-icon name="layers" [size]="14"></app-icon>
            <span>Catálogo Comercial · Paquetes y Planes</span>
          </div>
          <h1 class="page-title">Gestión de Planes Turísticos</h1>
          <p class="page-subtitle">Configuración de paquetes turísticos, vigencias y tarifas por prestador.</p>
        </div>
        <button class="btn btn-primary" (click)="abrirModalCrear()">
          <app-icon name="plus" [size]="16"></app-icon>
          <span>Nuevo Plan</span>
        </button>
      </div>

      <!-- Filtros -->
      <div class="filters-card glass-card">
        <div class="filter-group search">
          <app-icon name="search" [size]="16" class="search-icon"></app-icon>
          <input
            type="text"
            placeholder="Buscar por nombre o prestador..."
            [(ngModel)]="filtroTexto"
            (ngModelChange)="filtrarPlanes()" />
        </div>

        <div class="filter-group">
          <select [(ngModel)]="filtroTipo" (change)="filtrarPlanes()">
            <option value="">Todos los tipos</option>
            <option value="BASICO">Básico</option>
            <option value="ESTANDAR">Estándar</option>
            <option value="PREMIUM">Premium</option>
            <option value="TODO_INCLUIDO">Todo Incluido</option>
          </select>
        </div>

        <div class="filter-group">
          <select [(ngModel)]="filtroEstado" (change)="filtrarPlanes()">
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
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
        <span>Cargando planes y paquetes turísticos...</span>
      </div>

      <!-- Grid de Planes -->
      <div *ngIf="!cargando && planesFiltrados.length" class="planes-grid">
        <div *ngFor="let p of planesFiltrados" class="plan-card glass-card">
          <div class="card-header">
            <span class="tipo-tag" [ngClass]="p.tipo.toLowerCase()">
              {{ p.tipo }}
            </span>
            <div class="actions">
              <button class="icon-btn edit" (click)="abrirModalEditar(p)" title="Editar plan">
                <app-icon name="edit" [size]="14"></app-icon>
              </button>
              <button class="icon-btn delete" (click)="confirmarEliminar(p)" title="Eliminar plan">
                <app-icon name="trash" [size]="14"></app-icon>
              </button>
            </div>
          </div>

          <div class="card-body">
            <h3 class="plan-name">{{ p.nombre }}</h3>
            <p class="plan-prestador">
              <app-icon name="building" [size]="13"></app-icon>
              <span>{{ p.prestadorNombre }}</span>
            </p>
            <p class="plan-desc">{{ p.descripcion }}</p>

            <div class="plan-price-row">
              <span class="price-val">$ {{ p.precio | number }}</span>
              <span class="price-sub">COP / persona</span>
            </div>

            <div class="vigencia-box">
              <app-icon name="calendar" [size]="12"></app-icon>
              <span>Vigencia: {{ p.fechaInicio }} a {{ p.fechaFin }}</span>
            </div>
          </div>

          <div class="card-footer">
            <app-pill-estado [estado]="p.estado"></app-pill-estado>
            <span class="plan-id">#PLA-{{ p.idPlan }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <app-tabla-vacia
        *ngIf="!cargando && !planesFiltrados.length"
        titulo="No se encontraron planes turísticos"
        subtitulo="Crea un nuevo paquete promocional para ofertar tours y experiencias.">
      </app-tabla-vacia>

      <!-- MODAL CREAR / EDITAR -->
      <div class="modal-backdrop" *ngIf="mostrarModal" (click)="cerrarModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">{{ planEditando ? 'Editar Plan Turístico' : 'Nuevo Plan Turístico' }}</h3>
              <p class="modal-subtitle">Configura las tarifas, tipo y prestador asociado</p>
            </div>
            <button class="close-btn" (click)="cerrarModal()">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="guardar()" class="modal-body">
            <div class="form-group">
              <label class="form-label">Nombre del Plan <span class="req">*</span></label>
              <input
                type="text"
                formControlName="nombre"
                placeholder="Ej. Aventura Cocora & Cócora Full"
                class="form-control" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Tipo de Plan <span class="req">*</span></label>
                <select formControlName="tipo" class="form-control">
                  <option value="BASICO">Básico</option>
                  <option value="ESTANDAR">Estándar</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="TODO_INCLUIDO">Todo Incluido</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Prestador Operador <span class="req">*</span></label>
                <select formControlName="idPrestador" class="form-control">
                  <option [ngValue]="null" disabled>Selecciona prestador</option>
                  <option *ngFor="let pr of prestadores" [ngValue]="pr.idPrestador">
                    {{ pr.nombreComercial }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Precio ($ COP) <span class="req">*</span></label>
                <input
                  type="number"
                  formControlName="precio"
                  min="0"
                  class="form-control" />
              </div>

              <div class="form-group">
                <label class="form-label">Estado <span class="req">*</span></label>
                <select formControlName="estado" class="form-control">
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Fecha Inicio Vigencia <span class="req">*</span></label>
                <input
                  type="date"
                  formControlName="fechaInicio"
                  class="form-control" />
              </div>

              <div class="form-group">
                <label class="form-label">Fecha Fin Vigencia <span class="req">*</span></label>
                <input
                  type="date"
                  formControlName="fechaFin"
                  class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Descripción del Paquete</label>
              <textarea
                formControlName="descripcion"
                rows="3"
                placeholder="Detalle qué incluye el paquete..."
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
                <span>{{ guardando ? 'Guardando...' : 'Guardar Plan' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .planes-page {
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
        min-width: 170px;

        &:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }
      }
    }

    /* Grid */
    .planes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .plan-card {
      padding: 22px;
      border-radius: 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.08);
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .tipo-tag {
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 10px;
      border-radius: 6px;

      &.basico { background: rgba(107, 114, 128, 0.12); color: #4b5563; }
      &.estandar { background: rgba(16, 185, 129, 0.12); color: #047857; }
      &.premium { background: rgba(139, 92, 246, 0.12); color: #7c3aed; }
      &.todo_incluido { background: rgba(245, 158, 11, 0.15); color: #b45309; }
    }

    .actions {
      display: flex;
      gap: 6px;
    }

    .icon-btn {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: 1px solid var(--color-border);
      background: #ffffff;
      color: var(--color-ink-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &.edit:hover {
        background: rgba(16, 185, 129, 0.1);
        color: #059669;
        border-color: rgba(16, 185, 129, 0.3);
      }

      &.delete:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
        border-color: rgba(239, 68, 68, 0.3);
      }
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .plan-name {
      font-family: var(--font-heading);
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0;
    }

    .plan-prestador {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-ink-muted);
      margin: 0;
    }

    .plan-desc {
      font-size: 0.8125rem;
      color: var(--color-ink-muted);
      margin: 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .plan-price-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
      padding-top: 6px;

      .price-val {
        font-family: var(--font-heading);
        font-size: 1.375rem;
        font-weight: 800;
        color: var(--color-primary-dark);
      }

      .price-sub {
        font-size: 0.75rem;
        color: var(--color-ink-muted);
      }
    }

    .vigencia-box {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.75rem;
      color: var(--color-ink-muted);
      background: rgba(11, 45, 31, 0.03);
      padding: 4px 8px;
      border-radius: 6px;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid var(--color-border);
    }

    .plan-id {
      font-size: 0.75rem;
      font-family: monospace;
      color: var(--color-ink-muted);
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
export class PlanesListaComponent implements OnInit {
  private planesService = inject(PlanesService);
  private prestadoresService = inject(PrestadoresService);
  private fb = inject(FormBuilder);

  planes: PlanDto[] = [];
  planesFiltrados: PlanDto[] = [];
  prestadores: PrestadorDto[] = [];

  cargando = true;
  guardando = false;
  filtroTexto = '';
  filtroTipo = '';
  filtroEstado = '';

  mostrarModal = false;
  planEditando: PlanDto | null = null;
  errorMensaje: string | null = null;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    tipo: ['ESTANDAR' as TipoPlan, [Validators.required]],
    idPrestador: [null as number | null, [Validators.required]],
    precio: [50000, [Validators.required, Validators.min(0)]],
    fechaInicio: ['', [Validators.required]],
    fechaFin: ['', [Validators.required]],
    estado: ['ACTIVO' as EstadoPlan, [Validators.required]],
    descripcion: ['']
  });

  ngOnInit(): void {
    this.cargarPlanes();
    this.cargarPrestadores();
  }

  cargarPrestadores(): void {
    this.prestadoresService.listar().subscribe({
      next: (prs) => (this.prestadores = prs || [])
    });
  }

  cargarPlanes(): void {
    this.cargando = true;
    this.planesService.listar().subscribe({
      next: (data) => {
        this.planes = data || [];
        this.filtrarPlanes();
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error al cargar planes', e);
        this.cargando = false;
      }
    });
  }

  filtrarPlanes(): void {
    let res = [...this.planes];
    if (this.filtroTexto.trim()) {
      const q = this.filtroTexto.toLowerCase();
      res = res.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(q) ||
          p.prestadorNombre?.toLowerCase().includes(q)
      );
    }
    if (this.filtroTipo) {
      res = res.filter((p) => p.tipo === this.filtroTipo);
    }
    if (this.filtroEstado) {
      res = res.filter((p) => p.estado === this.filtroEstado);
    }
    this.planesFiltrados = res;
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroTipo = '';
    this.filtroEstado = '';
    this.filtrarPlanes();
  }

  abrirModalCrear(): void {
    this.planEditando = null;
    this.errorMensaje = null;
    const hoy = new Date().toISOString().substring(0, 10);
    const finAno = new Date(new Date().getFullYear(), 11, 31).toISOString().substring(0, 10);
    this.form.reset({
      nombre: '',
      tipo: 'ESTANDAR',
      idPrestador: this.prestadores.length ? this.prestadores[0].idPrestador : null,
      precio: 60000,
      fechaInicio: hoy,
      fechaFin: finAno,
      estado: 'ACTIVO',
      descripcion: ''
    });
    this.mostrarModal = true;
  }

  abrirModalEditar(plan: PlanDto): void {
    this.planEditando = plan;
    this.errorMensaje = null;
    this.form.patchValue({
      nombre: plan.nombre,
      tipo: plan.tipo,
      idPrestador: plan.idPrestador,
      precio: plan.precio,
      fechaInicio: plan.fechaInicio,
      fechaFin: plan.fechaFin,
      estado: plan.estado,
      descripcion: plan.descripcion
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.planEditando = null;
  }

  guardar(): void {
    if (this.form.invalid) return;

    this.guardando = true;
    this.errorMensaje = null;
    const v = this.form.value;

    const req: CrearPlanRequest = {
      nombre: v.nombre!,
      tipo: v.tipo as TipoPlan,
      idPrestador: v.idPrestador!,
      precio: v.precio!,
      fechaInicio: v.fechaInicio!,
      fechaFin: v.fechaFin!,
      estado: v.estado as EstadoPlan,
      descripcion: v.descripcion || ''
    };

    const action = this.planEditando
      ? this.planesService.actualizar(this.planEditando.idPlan, req)
      : this.planesService.crear(req);

    action.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.cargarPlanes();
      },
      error: (err) => {
        this.guardando = false;
        this.errorMensaje = err.error?.mensaje || 'Error al guardar plan';
      }
    });
  }

  confirmarEliminar(plan: PlanDto): void {
    if (confirm(`¿Estás seguro de eliminar el plan "${plan.nombre}"?`)) {
      this.planesService.eliminar(plan.idPlan).subscribe({
        next: () => this.cargarPlanes(),
        error: (err) => alert(err.error?.mensaje || 'Error al eliminar plan')
      });
    }
  }
}
