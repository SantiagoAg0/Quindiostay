import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { GuiasService } from './guias.service';
import { GuiaDetalleDto, CrearGuiaRequest } from '../../core/models/guia.model';
import { IdiomaResumen } from '../../core/models/idioma.model';
import { IconComponent } from '../../shared/icon/icon.component';
import { TablaVaciaComponent } from '../../shared/tabla-vacia/tabla-vacia.component';

@Component({
  selector: 'app-guias-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IconComponent,
    TablaVaciaComponent
  ],
  template: `
    <div class="guias-page animate-fade-in">
      <!-- Encabezado -->
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <app-icon name="user" [size]="14"></app-icon>
            <span>Equipo Humano · Guías Certificados</span>
          </div>
          <h1 class="page-title">Directorio de Guías Turísticos</h1>
          <p class="page-subtitle">Personal certificado con tarjeta profesional e idiomas para la operación en el Quindío.</p>
        </div>
        <button class="btn btn-primary" (click)="abrirModalCrear()">
          <app-icon name="plus" [size]="16"></app-icon>
          <span>Registrar Guía</span>
        </button>
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="filters-bar glass-card">
        <div class="search-box">
          <app-icon name="search" [size]="16" class="search-icon"></app-icon>
          <input
            type="text"
            placeholder="Buscar por nombre, documento o tarjeta profesional..."
            [(ngModel)]="busqueda"
            (ngModelChange)="filtrarGuias()" />
        </div>
        <div class="filter-pills">
          <button
            class="filter-chip"
            [class.active]="idiomaFiltro === null"
            (click)="filtrarPorIdioma(null)">
            Todos los idiomas
          </button>
          <button
            *ngFor="let idm of idiomasDisponibles"
            class="filter-chip"
            [class.active]="idiomaFiltro === idm.idIdioma"
            (click)="filtrarPorIdioma(idm.idIdioma)">
            {{ idm.nombre }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="cargando" class="loading-state glass-card">
        <div class="spinner"></div>
        <span>Cargando guías registrados...</span>
      </div>

      <!-- Guías Grid -->
      <div *ngIf="!cargando && guiasFiltrados.length" class="guias-grid">
        <div *ngFor="let g of guiasFiltrados" class="guia-card glass-card">
          <div class="card-top">
            <div class="guia-avatar">
              <app-icon name="user" [size]="24"></app-icon>
            </div>
            <div class="card-actions">
              <button class="icon-btn edit" (click)="abrirModalEditar(g)" title="Editar guía">
                <app-icon name="edit" [size]="15"></app-icon>
              </button>
              <button class="icon-btn delete" (click)="confirmarEliminar(g)" title="Eliminar guía">
                <app-icon name="trash" [size]="15"></app-icon>
              </button>
            </div>
          </div>

          <div class="card-info">
            <h3 class="guia-name">{{ g.nombre }}</h3>
            <div class="badge-acreditacion">
              <app-icon name="shield" [size]="12"></app-icon>
              <span>TP: {{ g.tarjetaProfesional }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Documento:</span>
              <span class="info-val">{{ g.documento }}</span>
            </div>
          </div>

          <div class="card-idiomas">
            <span class="idiomas-title">Idiomas certificados:</span>
            <div class="idiomas-tags">
              <span *ngFor="let nom of g.idiomasNombres" class="idioma-badge">
                <app-icon name="globe" [size]="12"></app-icon>
                {{ nom }}
              </span>
              <span *ngIf="!g.idiomasNombres?.length" class="no-idiomas">Sin idiomas asignados</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <app-tabla-vacia
        *ngIf="!cargando && !guiasFiltrados.length"
        titulo="No se encontraron guías turísticos"
        subtitulo="Intenta con otro término de búsqueda o registra un nuevo guía.">
      </app-tabla-vacia>

      <!-- Modal / Drawer Form -->
      <div class="modal-backdrop" *ngIf="mostrarModal" (click)="cerrarModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">{{ guiaEditando ? 'Editar Guía' : 'Registrar Nuevo Guía' }}</h3>
              <p class="modal-subtitle">Ingresa la acreditación profesional e idiomas certificados</p>
            </div>
            <button class="close-btn" (click)="cerrarModal()">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="guardar()" class="modal-body">
            <div class="form-group">
              <label class="form-label">Nombre Completo <span class="req">*</span></label>
              <input
                type="text"
                class="form-control"
                formControlName="nombre"
                placeholder="Ej. Carlos Arturo Ramírez" />
              <span class="field-error" *ngIf="form.get('nombre')?.touched && form.get('nombre')?.invalid">
                El nombre es obligatorio (mínimo 3 caracteres)
              </span>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Documento de Identidad <span class="req">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="documento"
                  placeholder="Ej. 1094883921" />
                <span class="field-error" *ngIf="form.get('documento')?.touched && form.get('documento')?.invalid">
                  Requerido
                </span>
              </div>

              <div class="form-group">
                <label class="form-label">Tarjeta Profesional (RNT) <span class="req">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  formControlName="tarjetaProfesional"
                  placeholder="Ej. TP-49201" />
                <span class="field-error" *ngIf="form.get('tarjetaProfesional')?.touched && form.get('tarjetaProfesional')?.invalid">
                  Requerido
                </span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Idiomas Certificados</label>
              <div class="idiomas-checkbox-grid">
                <label
                  *ngFor="let idm of idiomasDisponibles"
                  class="checkbox-card"
                  [class.checked]="esIdiomaSeleccionado(idm.idIdioma)">
                  <input
                    type="checkbox"
                    [checked]="esIdiomaSeleccionado(idm.idIdioma)"
                    (change)="toggleIdioma(idm.idIdioma)" />
                  <span class="checkbox-name">{{ idm.nombre }}</span>
                </label>
              </div>
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
                <span>{{ guardando ? 'Guardando...' : (guiaEditando ? 'Guardar Cambios' : 'Registrar Guía') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .guias-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
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

    .filters-bar {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 16px 20px;
      border-radius: 16px;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        left: 14px;
        color: var(--color-ink-muted);
        pointer-events: none;
      }

      input {
        width: 100%;
        padding: 10px 14px 10px 40px;
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
    }

    .filter-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .filter-chip {
      padding: 6px 14px;
      border-radius: 9999px;
      border: 1px solid rgba(16, 185, 129, 0.25);
      background: rgba(16, 185, 129, 0.08);
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-primary-dark);
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: rgba(16, 185, 129, 0.16);
        border-color: var(--color-primary);
        color: var(--color-primary-dark);
        transform: translateY(-1px);
        box-shadow: 0 3px 8px rgba(16, 185, 129, 0.15);
      }

      &.active {
        background: linear-gradient(135deg, #10B981 0%, #047857 100%);
        color: #ffffff;
        border-color: transparent;
        box-shadow: 0 3px 10px rgba(16, 185, 129, 0.3);
      }
    }

    /* Grid */
    .guias-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .guia-card {
      padding: 22px;
      border-radius: 18px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.08);
      }
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .guia-avatar {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(11, 45, 31, 0.1) 100%);
      color: var(--color-primary-dark);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-actions {
      display: flex;
      gap: 6px;
    }

    .icon-btn {
      width: 32px;
      height: 32px;
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

    .card-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .guia-name {
      font-family: var(--font-heading);
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0;
    }

    .badge-acreditacion {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.1);
      color: #047857;
      font-size: 0.75rem;
      font-weight: 700;
      width: fit-content;
      letter-spacing: 0.02em;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.8125rem;
      color: var(--color-ink-muted);

      .info-val {
        font-weight: 600;
        color: var(--color-ink);
      }
    }

    .card-idiomas {
      border-top: 1px solid var(--color-border);
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .idiomas-title {
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-ink-muted);
    }

    .idiomas-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .idioma-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: var(--color-primary-dark);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      transition: all 0.2s;

      &:hover {
        background: rgba(16, 185, 129, 0.18);
        border-color: rgba(16, 185, 129, 0.35);
      }
    }

    .no-idiomas {
      font-size: 0.75rem;
      font-style: italic;
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
      animation: modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .modal-header {
      padding: 24px;
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
      padding: 10px 14px;
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

    .field-error {
      font-size: 0.75rem;
      color: #dc2626;
    }

    .idiomas-checkbox-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .checkbox-card {
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: all 0.15s ease;
      font-size: 0.8125rem;
      font-weight: 600;

      &:hover {
        border-color: var(--color-primary);
      }

      &.checked {
        border-color: var(--color-primary);
        background: rgba(16, 185, 129, 0.08);
        color: var(--color-primary-dark);
      }

      input[type="checkbox"] {
        accent-color: var(--color-primary);
        width: 16px;
        height: 16px;
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
      padding-top: 12px;
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
export class GuiasListaComponent implements OnInit {
  private guiasService = inject(GuiasService);
  private fb = inject(FormBuilder);

  guias: GuiaDetalleDto[] = [];
  guiasFiltrados: GuiaDetalleDto[] = [];
  idiomasDisponibles: IdiomaResumen[] = [];

  cargando = true;
  guardando = false;
  busqueda = '';
  idiomaFiltro: number | null = null;

  mostrarModal = false;
  guiaEditando: GuiaDetalleDto | null = null;
  errorMensaje: string | null = null;
  idiomasSeleccionadosIds: number[] = [];

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    documento: ['', [Validators.required]],
    tarjetaProfesional: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.guiasService.listarIdiomas().subscribe({
      next: (idms) => (this.idiomasDisponibles = idms),
      error: () => {}
    });

    this.guiasService.listar().subscribe({
      next: (data) => {
        this.guias = data;
        this.filtrarGuias();
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error al cargar guías', e);
        this.cargando = false;
      }
    });
  }

  filtrarGuias(): void {
    let res = [...this.guias];
    if (this.busqueda.trim()) {
      const q = this.busqueda.toLowerCase();
      res = res.filter(
        (g) =>
          g.nombre.toLowerCase().includes(q) ||
          g.documento.toLowerCase().includes(q) ||
          g.tarjetaProfesional.toLowerCase().includes(q)
      );
    }
    if (this.idiomaFiltro !== null) {
      res = res.filter((g) => g.idiomasIds?.includes(this.idiomaFiltro!));
    }
    this.guiasFiltrados = res;
  }

  filtrarPorIdioma(idIdioma: number | null): void {
    this.idiomaFiltro = idIdioma;
    this.filtrarGuias();
  }

  abrirModalCrear(): void {
    this.guiaEditando = null;
    this.idiomasSeleccionadosIds = [];
    this.errorMensaje = null;
    this.form.reset();
    this.mostrarModal = true;
  }

  abrirModalEditar(guia: GuiaDetalleDto): void {
    this.guiaEditando = guia;
    this.idiomasSeleccionadosIds = [...(guia.idiomasIds || [])];
    this.errorMensaje = null;
    this.form.patchValue({
      nombre: guia.nombre,
      documento: guia.documento,
      tarjetaProfesional: guia.tarjetaProfesional
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.guiaEditando = null;
  }

  esIdiomaSeleccionado(id: number): boolean {
    return this.idiomasSeleccionadosIds.includes(id);
  }

  toggleIdioma(id: number): void {
    const idx = this.idiomasSeleccionadosIds.indexOf(id);
    if (idx >= 0) {
      this.idiomasSeleccionadosIds.splice(idx, 1);
    } else {
      this.idiomasSeleccionadosIds.push(id);
    }
  }

  guardar(): void {
    if (this.form.invalid) return;

    this.guardando = true;
    this.errorMensaje = null;
    const v = this.form.value;

    const req: CrearGuiaRequest = {
      nombre: v.nombre!,
      documento: v.documento!,
      tarjetaProfesional: v.tarjetaProfesional!,
      idiomasIds: this.idiomasSeleccionadosIds
    };

    const action = this.guiaEditando
      ? this.guiasService.actualizar(this.guiaEditando.idGuia, req)
      : this.guiasService.crear(req);

    action.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.cargarDatos();
      },
      error: (err) => {
        this.guardando = false;
        this.errorMensaje = err.error?.mensaje || 'Error al guardar guía';
      }
    });
  }

  confirmarEliminar(guia: GuiaDetalleDto): void {
    if (confirm(`¿Estás seguro de eliminar al guía ${guia.nombre}?`)) {
      this.guiasService.eliminar(guia.idGuia).subscribe({
        next: () => this.cargarDatos(),
        error: (err) => alert(err.error?.mensaje || 'Error al eliminar guía')
      });
    }
  }
}
