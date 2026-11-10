import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PrestadoresService } from './prestadores.service';
import { PrestadorDto, MunicipioDto, TipoPrestadorDto, CrearPrestadorRequest, EstadoPrestador } from '../../core/models/prestador.model';
import { IconComponent } from '../../shared/icon/icon.component';
import { PillEstadoComponent } from '../../shared/pill-estado/pill-estado.component';
import { TablaVaciaComponent } from '../../shared/tabla-vacia/tabla-vacia.component';

@Component({
  selector: 'app-prestadores-lista',
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
    <div class="prestadores-page animate-fade-in">
      <!-- Encabezado de página -->
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <app-icon name="building" [size]="14"></app-icon>
            <span>Aliados Regionales · Prestadores Turísticos</span>
          </div>
          <h1 class="page-title">Directorio de Prestadores</h1>
          <p class="page-subtitle">Agencias, fincas cafeteras y operadores turísticos certificados en el departamento del Quindío.</p>
        </div>
        <button class="btn btn-primary" (click)="abrirModalCrear()">
          <app-icon name="plus" [size]="16"></app-icon>
          <span>Nuevo Prestador</span>
        </button>
      </div>

      <!-- Barra de Filtros -->
      <div class="filters-card glass-card">
        <div class="filter-group search">
          <app-icon name="search" [size]="16" class="search-icon"></app-icon>
          <input
            type="text"
            placeholder="Buscar por nombre, NIT o RNT..."
            [(ngModel)]="filtroTexto"
            (ngModelChange)="filtrarPrestadores()" />
        </div>

        <div class="filter-group">
          <select [(ngModel)]="filtroMunicipio" (change)="filtrarPrestadores()">
            <option [ngValue]="null">Todos los municipios</option>
            <option *ngFor="let m of municipios" [ngValue]="m.idMunicipio">{{ m.nombre }}</option>
          </select>
        </div>

        <div class="filter-group">
          <select [(ngModel)]="filtroTipo" (change)="filtrarPrestadores()">
            <option [ngValue]="null">Todos los tipos</option>
            <option *ngFor="let t of tipos" [ngValue]="t.idTipoPrestador">{{ t.nombre }}</option>
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
        <span>Cargando prestadores y empresas aliadas...</span>
      </div>

      <!-- Grid de Prestadores -->
      <div *ngIf="!cargando && prestadoresFiltrados.length" class="prestadores-grid">
        <div *ngFor="let p of prestadoresFiltrados" class="prestador-card glass-card">
          <div class="card-header">
            <div class="prestador-badge-tipo">
              {{ p.tipoPrestadorNombre }}
            </div>
            <div class="actions">
              <button class="icon-btn edit" (click)="abrirModalEditar(p)" title="Editar prestador">
                <app-icon name="edit" [size]="14"></app-icon>
              </button>
              <button class="icon-btn delete" (click)="confirmarEliminar(p)" title="Eliminar prestador">
                <app-icon name="trash" [size]="14"></app-icon>
              </button>
            </div>
          </div>

          <div class="card-body">
            <h3 class="prestador-name">{{ p.nombreComercial }}</h3>
            <div class="muni-tag">
              <app-icon name="map-pin" [size]="13"></app-icon>
              <span>{{ p.municipioNombre }}</span>
            </div>

            <div class="info-list">
              <div class="info-item">
                <span class="label">NIT:</span>
                <span class="val">{{ p.nitDocumento }}</span>
              </div>
              <div class="info-item" *ngIf="p.rnt">
                <span class="label">RNT:</span>
                <span class="val">{{ p.rnt }}</span>
              </div>
              <div class="info-item" *ngIf="p.telefono">
                <span class="label">Teléfono:</span>
                <span class="val">{{ p.telefono }}</span>
              </div>
              <div class="info-item" *ngIf="p.correo">
                <span class="label">Correo:</span>
                <span class="val">{{ p.correo }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <app-pill-estado [estado]="p.estado"></app-pill-estado>
            <span class="dir-preview" *ngIf="p.direccion">{{ p.direccion }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <app-tabla-vacia
        *ngIf="!cargando && !prestadoresFiltrados.length"
        titulo="No se encontraron prestadores"
        subtitulo="Intenta con otro filtro o registra una nueva empresa aliada.">
      </app-tabla-vacia>

      <!-- MODAL CREAR / EDITAR -->
      <div class="modal-backdrop" *ngIf="mostrarModal" (click)="cerrarModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">{{ prestadorEditando ? 'Editar Prestador' : 'Nuevo Prestador Turístico' }}</h3>
              <p class="modal-subtitle">Registro en el catálogo departamental con RNT y municipio</p>
            </div>
            <button class="close-btn" (click)="cerrarModal()">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="guardar()" class="modal-body">
            <div class="form-group">
              <label class="form-label">Razón Social / Nombre Comercial <span class="req">*</span></label>
              <input
                type="text"
                formControlName="nombreComercial"
                placeholder="Ej. Finca Cafetera La Morelia"
                class="form-control" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">NIT o Documento <span class="req">*</span></label>
                <input
                  type="text"
                  formControlName="nitDocumento"
                  placeholder="Ej. 900.123.456-7"
                  class="form-control" />
              </div>

              <div class="form-group">
                <label class="form-label">Registro Nal. Turismo (RNT)</label>
                <input
                  type="text"
                  formControlName="rnt"
                  placeholder="Ej. 48201"
                  class="form-control" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Municipio del Quindío <span class="req">*</span></label>
                <select formControlName="idMunicipio" class="form-control">
                  <option [ngValue]="null" disabled>Selecciona un municipio</option>
                  <option *ngFor="let m of municipios" [ngValue]="m.idMunicipio">{{ m.nombre }}</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Tipo de Prestador <span class="req">*</span></label>
                <select formControlName="idTipoPrestador" class="form-control">
                  <option [ngValue]="null" disabled>Selecciona el tipo</option>
                  <option *ngFor="let t of tipos" [ngValue]="t.idTipoPrestador">{{ t.nombre }}</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Teléfono de Contacto</label>
                <input
                  type="text"
                  formControlName="telefono"
                  placeholder="Ej. 312 456 7890"
                  class="form-control" />
              </div>

              <div class="form-group">
                <label class="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  formControlName="correo"
                  placeholder="Ej. reservas@finca.com"
                  class="form-control" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Dirección Física</label>
                <input
                  type="text"
                  formControlName="direccion"
                  placeholder="Ej. Vereda La Nubia Km 4"
                  class="form-control" />
              </div>

              <div class="form-group">
                <label class="form-label">Estado Operativo <span class="req">*</span></label>
                <select formControlName="estado" class="form-control">
                  <option value="ACTIVO">Activo</option>
                  <option value="SUSPENDIDO">Suspendido</option>
                  <option value="RETIRADO">Retirado</option>
                </select>
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
                <span>{{ guardando ? 'Guardando...' : 'Guardar Prestador' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .prestadores-page {
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
    .prestadores-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }

    .prestador-card {
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

    .prestador-badge-tipo {
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-primary-dark);
      background: rgba(16, 185, 129, 0.1);
      padding: 3px 10px;
      border-radius: 6px;
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

    .prestador-name {
      font-family: var(--font-heading);
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0;
    }

    .muni-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-primary);
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 6px;
      border-top: 1px solid var(--color-border);
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.8125rem;

      .label { color: var(--color-ink-muted); }
      .val { font-weight: 600; color: var(--color-ink); }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid var(--color-border);
    }

    .dir-preview {
      font-size: 0.75rem;
      color: var(--color-ink-muted);
      max-width: 180px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
      max-width: 540px;
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
export class PrestadoresListaComponent implements OnInit {
  private prestadoresService = inject(PrestadoresService);
  private fb = inject(FormBuilder);

  prestadores: PrestadorDto[] = [];
  prestadoresFiltrados: PrestadorDto[] = [];
  municipios: MunicipioDto[] = [];
  tipos: TipoPrestadorDto[] = [];

  cargando = true;
  guardando = false;
  filtroTexto = '';
  filtroMunicipio: number | null = null;
  filtroTipo: number | null = null;

  mostrarModal = false;
  prestadorEditando: PrestadorDto | null = null;
  errorMensaje: string | null = null;

  form = this.fb.group({
    nombreComercial: ['', [Validators.required, Validators.minLength(3)]],
    nitDocumento: ['', [Validators.required]],
    rnt: [''],
    direccion: [''],
    telefono: [''],
    correo: ['', [Validators.email]],
    estado: ['ACTIVO' as EstadoPrestador, [Validators.required]],
    idMunicipio: [null as number | null, [Validators.required]],
    idTipoPrestador: [null as number | null, [Validators.required]]
  });

  ngOnInit(): void {
    this.cargarPrestadores();
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.prestadoresService.listarMunicipios().subscribe({
      next: (m) => (this.municipios = m || [])
    });

    this.prestadoresService.listarTipos().subscribe({
      next: (t) => (this.tipos = t || [])
    });
  }

  cargarPrestadores(): void {
    this.cargando = true;
    this.prestadoresService.listar().subscribe({
      next: (data) => {
        this.prestadores = data || [];
        this.filtrarPrestadores();
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error al cargar prestadores', e);
        this.cargando = false;
      }
    });
  }

  filtrarPrestadores(): void {
    let res = [...this.prestadores];
    if (this.filtroTexto.trim()) {
      const q = this.filtroTexto.toLowerCase();
      res = res.filter(
        (p) =>
          p.nombreComercial?.toLowerCase().includes(q) ||
          p.nitDocumento?.toLowerCase().includes(q) ||
          p.rnt?.toLowerCase().includes(q)
      );
    }
    if (this.filtroMunicipio !== null) {
      res = res.filter((p) => p.idMunicipio === this.filtroMunicipio);
    }
    if (this.filtroTipo !== null) {
      res = res.filter((p) => p.idTipoPrestador === this.filtroTipo);
    }
    this.prestadoresFiltrados = res;
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroMunicipio = null;
    this.filtroTipo = null;
    this.filtrarPrestadores();
  }

  abrirModalCrear(): void {
    this.prestadorEditando = null;
    this.errorMensaje = null;
    this.form.reset({
      nombreComercial: '',
      nitDocumento: '',
      rnt: '',
      direccion: '',
      telefono: '',
      correo: '',
      estado: 'ACTIVO',
      idMunicipio: this.municipios.length ? this.municipios[0].idMunicipio : null,
      idTipoPrestador: this.tipos.length ? this.tipos[0].idTipoPrestador : null
    });
    this.mostrarModal = true;
  }

  abrirModalEditar(p: PrestadorDto): void {
    this.prestadorEditando = p;
    this.errorMensaje = null;
    this.form.patchValue({
      nombreComercial: p.nombreComercial,
      nitDocumento: p.nitDocumento,
      rnt: p.rnt,
      direccion: p.direccion,
      telefono: p.telefono,
      correo: p.correo,
      estado: p.estado,
      idMunicipio: p.idMunicipio,
      idTipoPrestador: p.idTipoPrestador
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.prestadorEditando = null;
  }

  guardar(): void {
    if (this.form.invalid) return;

    this.guardando = true;
    this.errorMensaje = null;
    const v = this.form.value;

    const req: CrearPrestadorRequest = {
      nombreComercial: v.nombreComercial!,
      nitDocumento: v.nitDocumento!,
      rnt: v.rnt || undefined,
      direccion: v.direccion || undefined,
      telefono: v.telefono || undefined,
      correo: v.correo || undefined,
      estado: v.estado as EstadoPrestador,
      idMunicipio: v.idMunicipio!,
      idTipoPrestador: v.idTipoPrestador!
    };

    const action = this.prestadorEditando
      ? this.prestadoresService.actualizar(this.prestadorEditando.idPrestador, req)
      : this.prestadoresService.crear(req);

    action.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.cargarPrestadores();
      },
      error: (err) => {
        this.guardando = false;
        this.errorMensaje = err.error?.mensaje || 'Error al guardar prestador';
      }
    });
  }

  confirmarEliminar(p: PrestadorDto): void {
    if (confirm(`¿Estás seguro de eliminar al prestador ${p.nombreComercial}?`)) {
      this.prestadoresService.eliminar(p.idPrestador).subscribe({
        next: () => this.cargarPrestadores(),
        error: (err) => alert(err.error?.mensaje || 'Error al eliminar prestador')
      });
    }
  }
}
