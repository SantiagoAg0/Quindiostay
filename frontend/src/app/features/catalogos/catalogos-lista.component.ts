import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CatalogosService, MunicipioItem, TipoPrestadorItem, RolItem, CategoriaTourItem, IdiomaItem } from './catalogos.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { TablaVaciaComponent } from '../../shared/tabla-vacia/tabla-vacia.component';

type PestanaCatalogo = 'municipios' | 'tipos' | 'roles' | 'categorias' | 'idiomas';

@Component({
  selector: 'app-catalogos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="catalogos-page animate-fade-in">
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <app-icon name="layers" [size]="14"></app-icon>
            <span>Administración · Tablas del Sistema</span>
          </div>
          <h1 class="page-title">Gestión de Catálogos</h1>
          <p class="page-subtitle">Administra los catálogos base: Municipios, Tipos de Prestador, Roles, Categorías e Idiomas.</p>
        </div>
        <button class="btn btn-primary" (click)="abrirModalCrear()">
          <app-icon name="plus" [size]="16"></app-icon>
          <span>Nuevo Registro</span>
        </button>
      </div>

      <!-- Navegación por pestañas -->
      <div class="tabs-container glass-card">
        <button class="tab-btn" [class.active]="pestanaActiva === 'municipios'" (click)="cambiarPestana('municipios')">
          <app-icon name="map-pin" [size]="16"></app-icon>
          <span>Municipios ({{ municipios.length }})</span>
        </button>
        <button class="tab-btn" [class.active]="pestanaActiva === 'tipos'" (click)="cambiarPestana('tipos')">
          <app-icon name="building" [size]="16"></app-icon>
          <span>Tipos de Prestador ({{ tiposPrestador.length }})</span>
        </button>
        <button class="tab-btn" [class.active]="pestanaActiva === 'roles'" (click)="cambiarPestana('roles')">
          <app-icon name="shield" [size]="16"></app-icon>
          <span>Roles ({{ roles.length }})</span>
        </button>
        <button class="tab-btn" [class.active]="pestanaActiva === 'categorias'" (click)="cambiarPestana('categorias')">
          <app-icon name="compass" [size]="16"></app-icon>
          <span>Categorías de Tour ({{ categoriasTour.length }})</span>
        </button>
        <button class="tab-btn" [class.active]="pestanaActiva === 'idiomas'" (click)="cambiarPestana('idiomas')">
          <app-icon name="globe" [size]="16"></app-icon>
          <span>Idiomas ({{ idiomas.length }})</span>
        </button>
      </div>

      <!-- Alertas de error y éxito -->
      <div *ngIf="mensajeError" class="alert-box error animate-fade-in">
        <app-icon name="alert" [size]="18"></app-icon>
        <span>{{ mensajeError }}</span>
      </div>
      <div *ngIf="mensajeExito" class="alert-box success animate-fade-in">
        <app-icon name="check" [size]="18"></app-icon>
        <span>{{ mensajeExito }}</span>
      </div>

      <!-- Contenido de la tabla según pestaña -->
      <div class="table-card glass-card">
        <div *ngIf="cargando" class="loading-state">
          <div class="spinner"></div>
          <span>Cargando registros...</span>
        </div>

        <!-- 1. MUNICIPIOS -->
        <div class="table-responsive" *ngIf="!cargando && pestanaActiva === 'municipios' && municipios.length">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Municipio</th>
                <th>Código DANE</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of municipios">
                <td class="id-cell">#MUN-{{ m.idMunicipio }}</td>
                <td class="name-cell">{{ m.nombre }}</td>
                <td><span class="badge">{{ m.codigoDane }}</span></td>
                <td class="actions-col">
                  <button class="action-btn edit" (click)="abrirModalEditar(m)" title="Editar">
                    <app-icon name="edit" [size]="14"></app-icon>
                  </button>
                  <button class="action-btn delete" (click)="eliminar(m.idMunicipio)" title="Eliminar">
                    <app-icon name="trash" [size]="14"></app-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 2. TIPOS DE PRESTADOR -->
        <div class="table-responsive" *ngIf="!cargando && pestanaActiva === 'tipos' && tiposPrestador.length">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo de Prestador</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tp of tiposPrestador">
                <td class="id-cell">#TIP-{{ tp.idTipoPrestador }}</td>
                <td class="name-cell">{{ tp.nombre }}</td>
                <td class="actions-col">
                  <button class="action-btn edit" (click)="abrirModalEditar(tp)" title="Editar">
                    <app-icon name="edit" [size]="14"></app-icon>
                  </button>
                  <button class="action-btn delete" (click)="eliminar(tp.idTipoPrestador)" title="Eliminar">
                    <app-icon name="trash" [size]="14"></app-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 3. ROLES -->
        <div class="table-responsive" *ngIf="!cargando && pestanaActiva === 'roles' && roles.length">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Rol</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of roles">
                <td class="id-cell">#ROL-{{ r.idRol }}</td>
                <td class="name-cell"><span class="role-badge">{{ r.nombre }}</span></td>
                <td class="actions-col">
                  <button class="action-btn edit" (click)="abrirModalEditar(r)" title="Editar">
                    <app-icon name="edit" [size]="14"></app-icon>
                  </button>
                  <button class="action-btn delete" (click)="eliminar(r.idRol)" title="Eliminar">
                    <app-icon name="trash" [size]="14"></app-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 4. CATEGORÍAS -->
        <div class="table-responsive" *ngIf="!cargando && pestanaActiva === 'categorias' && categoriasTour.length">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of categoriasTour">
                <td class="id-cell">#CAT-{{ c.idCategoria }}</td>
                <td class="name-cell">{{ c.nombre }}</td>
                <td>{{ c.descripcion || 'Sin descripción' }}</td>
                <td class="actions-col">
                  <button class="action-btn edit" (click)="abrirModalEditar(c)" title="Editar">
                    <app-icon name="edit" [size]="14"></app-icon>
                  </button>
                  <button class="action-btn delete" (click)="eliminar(c.idCategoria)" title="Eliminar">
                    <app-icon name="trash" [size]="14"></app-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 5. IDIOMAS -->
        <div class="table-responsive" *ngIf="!cargando && pestanaActiva === 'idiomas' && idiomas.length">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Idioma</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let i of idiomas">
                <td class="id-cell">#IDM-{{ i.idIdioma }}</td>
                <td class="name-cell">{{ i.nombre }}</td>
                <td class="actions-col">
                  <button class="action-btn edit" (click)="abrirModalEditar(i)" title="Editar">
                    <app-icon name="edit" [size]="14"></app-icon>
                  </button>
                  <button class="action-btn delete" (click)="eliminar(i.idIdioma)" title="Eliminar">
                    <app-icon name="trash" [size]="14"></app-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL CREAR / EDITAR -->
      <div class="modal-backdrop" *ngIf="mostrarModal" (click)="cerrarModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">{{ editandoId ? 'Editar' : 'Nuevo' }} {{ tituloSingular }}</h3>
              <p class="modal-subtitle">Ingrese los datos requeridos para este registro de catálogo.</p>
            </div>
            <button class="close-btn" (click)="cerrarModal()">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form [formGroup]="formRegistro" (ngSubmit)="guardar()" class="modal-body">
            <div class="form-group">
              <label class="form-label">Nombre *</label>
              <input type="text" formControlName="nombre" class="form-control" placeholder="Ej: Nombre del registro" />
            </div>

            <div class="form-group" *ngIf="pestanaActiva === 'municipios'">
              <label class="form-label">Código DANE (5 dígitos) *</label>
              <input type="text" formControlName="codigoDane" maxlength="5" class="form-control" placeholder="Ej: 63001" />
            </div>

            <div class="form-group" *ngIf="pestanaActiva === 'categorias'">
              <label class="form-label">Descripción</label>
              <textarea formControlName="descripcion" rows="3" class="form-control" placeholder="Breve descripción..."></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="formRegistro.invalid || guardando">
                <app-icon name="check" [size]="16"></app-icon>
                <span>{{ guardando ? 'Guardando...' : (editandoId ? 'Actualizar' : 'Crear Registro') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .catalogos-page {
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
      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8125rem;
        color: #059669;
        font-weight: 600;
        margin-bottom: 6px;
      }
      .page-title {
        font-size: 1.75rem;
        font-weight: 800;
        color: #0e1712;
        margin: 0 0 4px;
      }
      .page-subtitle {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0;
      }
    }
    .tabs-container {
      display: flex;
      gap: 8px;
      padding: 10px;
      overflow-x: auto;
      .tab-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        border: none;
        background: transparent;
        color: #4b5563;
        font-size: 0.875rem;
        font-weight: 600;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        &:hover {
          background: rgba(16, 185, 129, 0.08);
          color: #059669;
        }
        &.active {
          background: #10b981;
          color: #ffffff;
        }
      }
    }
    .alert-box {
      padding: 12px 16px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.875rem;
      font-weight: 500;
      &.error {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #f87171;
      }
      &.success {
        background: #dcfce7;
        color: #166534;
        border: 1px solid #86efac;
      }
    }
    .table-card {
      padding: 0;
      overflow: hidden;
      border-radius: 16px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;
      th {
        padding: 14px 20px;
        background: #f8fafc;
        color: #475569;
        font-weight: 600;
        border-bottom: 1px solid #e2e8f0;
      }
      td {
        padding: 16px 20px;
        border-bottom: 1px solid #f1f5f9;
        color: #1e293b;
      }
      .id-cell {
        font-family: monospace;
        font-weight: 600;
        color: #64748b;
      }
      .name-cell {
        font-weight: 600;
        color: #0f172a;
      }
      .badge {
        padding: 4px 8px;
        background: #f1f5f9;
        border-radius: 6px;
        font-family: monospace;
        font-size: 0.8125rem;
        color: #334155;
      }
      .role-badge {
        padding: 4px 10px;
        background: rgba(16, 185, 129, 0.12);
        color: #047857;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
      }
    }
    .actions-col {
      width: 110px;
      text-align: right;
      padding-right: 20px;
    }
    .action-btn {
      background: none;
      border: 1px solid transparent;
      padding: 6px;
      border-radius: 8px;
      cursor: pointer;
      color: #64748b;
      transition: all 0.2s ease;
      margin-left: 4px;
      &:hover {
        background: #f1f5f9;
      }
      &.edit:hover {
        color: #059669;
        background: rgba(16, 185, 129, 0.1);
      }
      &.delete:hover {
        color: #dc2626;
        background: rgba(220, 38, 38, 0.1);
      }
    }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(7, 25, 17, 0.5);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal-dialog {
      background: #ffffff;
      border-radius: 20px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }
    .modal-header {
      padding: 20px 24px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      .modal-title { font-size: 1.2rem; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
      .modal-subtitle { font-size: 0.8125rem; color: #64748b; margin: 0; }
      .close-btn { background: none; border: none; cursor: pointer; color: #64748b; }
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
      .form-label { font-size: 0.8125rem; font-weight: 600; color: #334155; }
      .form-control {
        padding: 10px 14px;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        font-size: 0.875rem;
        outline: none;
        &:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); }
      }
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
    }
  `]
})
export class CatalogosListaComponent implements OnInit {
  private service = inject(CatalogosService);
  private fb = inject(FormBuilder);

  pestanaActiva: PestanaCatalogo = 'municipios';
  cargando = false;
  guardando = false;
  mostrarModal = false;
  editandoId: number | null = null;
  mensajeError: string | null = null;
  mensajeExito: string | null = null;

  municipios: MunicipioItem[] = [];
  tiposPrestador: TipoPrestadorItem[] = [];
  roles: RolItem[] = [];
  categoriasTour: CategoriaTourItem[] = [];
  idiomas: IdiomaItem[] = [];

  formRegistro = this.fb.group({
    nombre: ['', [Validators.required]],
    codigoDane: [''],
    descripcion: ['']
  });

  get tituloSingular(): string {
    switch (this.pestanaActiva) {
      case 'municipios': return 'Municipio';
      case 'tipos': return 'Tipo de Prestador';
      case 'roles': return 'Rol';
      case 'categorias': return 'Categoría de Tour';
      case 'idiomas': return 'Idioma';
    }
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cambiarPestana(p: PestanaCatalogo): void {
    this.pestanaActiva = p;
    this.mensajeError = null;
    this.mensajeExito = null;
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    switch (this.pestanaActiva) {
      case 'municipios':
        this.service.listarMunicipios().subscribe({
          next: (d) => { this.municipios = d || []; this.cargando = false; },
          error: (e) => { this.manejarError('Error al cargar municipios', e); }
        });
        break;
      case 'tipos':
        this.service.listarTiposPrestador().subscribe({
          next: (d) => { this.tiposPrestador = d || []; this.cargando = false; },
          error: (e) => { this.manejarError('Error al cargar tipos de prestador', e); }
        });
        break;
      case 'roles':
        this.service.listarRoles().subscribe({
          next: (d) => { this.roles = d || []; this.cargando = false; },
          error: (e) => { this.manejarError('Error al cargar roles', e); }
        });
        break;
      case 'categorias':
        this.service.listarCategoriasTour().subscribe({
          next: (d) => { this.categoriasTour = d || []; this.cargando = false; },
          error: (e) => { this.manejarError('Error al cargar categorías', e); }
        });
        break;
      case 'idiomas':
        this.service.listarIdiomas().subscribe({
          next: (d) => { this.idiomas = d || []; this.cargando = false; },
          error: (e) => { this.manejarError('Error al cargar idiomas', e); }
        });
        break;
    }
  }

  abrirModalCrear(): void {
    this.editandoId = null;
    this.mensajeError = null;
    this.formRegistro.reset();
    if (this.pestanaActiva === 'municipios') {
      this.formRegistro.get('codigoDane')?.setValidators([Validators.required, Validators.minLength(5), Validators.maxLength(5)]);
    } else {
      this.formRegistro.get('codigoDane')?.clearValidators();
    }
    this.formRegistro.get('codigoDane')?.updateValueAndValidity();
    this.mostrarModal = true;
  }

  abrirModalEditar(item: any): void {
    this.editandoId = item.idMunicipio || item.idTipoPrestador || item.idRol || item.idCategoria || item.idIdioma;
    this.mensajeError = null;
    this.formRegistro.patchValue({
      nombre: item.nombre,
      codigoDane: item.codigoDane || '',
      descripcion: item.descripcion || ''
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.editandoId = null;
  }

  guardar(): void {
    if (this.formRegistro.invalid) return;

    this.guardando = true;
    this.mensajeError = null;
    const v = this.formRegistro.value;

    const onExito = () => {
      this.guardando = false;
      this.cerrarModal();
      this.mensajeExito = `${this.tituloSingular} ${this.editandoId ? 'actualizado' : 'creado'} con éxito.`;
      setTimeout(() => (this.mensajeExito = null), 4000);
      this.cargarDatos();
    };

    const onError = (err: any) => {
      this.guardando = false;
      if (err.status === 409) {
        this.mensajeError = err.error?.mensaje || 'No se puede guardar o modificar este registro porque genera un conflicto de datos o duplicidad.';
      } else {
        this.mensajeError = err.error?.mensaje || 'Ocurrió un error al procesar la solicitud.';
      }
    };

    if (this.pestanaActiva === 'municipios') {
      const data = { nombre: v.nombre!, codigoDane: v.codigoDane! };
      if (this.editandoId) {
        this.service.modificarMunicipio(this.editandoId, data).subscribe({ next: onExito, error: onError });
      } else {
        this.service.crearMunicipio(data).subscribe({ next: onExito, error: onError });
      }
    } else if (this.pestanaActiva === 'tipos') {
      const data = { nombre: v.nombre! };
      if (this.editandoId) {
        this.service.modificarTipoPrestador(this.editandoId, data).subscribe({ next: onExito, error: onError });
      } else {
        this.service.crearTipoPrestador(data).subscribe({ next: onExito, error: onError });
      }
    } else if (this.pestanaActiva === 'roles') {
      const data = { nombre: v.nombre! };
      if (this.editandoId) {
        this.service.modificarRol(this.editandoId, data).subscribe({ next: onExito, error: onError });
      } else {
        this.service.crearRol(data).subscribe({ next: onExito, error: onError });
      }
    } else if (this.pestanaActiva === 'categorias') {
      const data = { nombre: v.nombre!, descripcion: v.descripcion || undefined };
      if (this.editandoId) {
        this.service.modificarCategoriaTour(this.editandoId, data).subscribe({ next: onExito, error: onError });
      } else {
        this.service.crearCategoriaTour(data).subscribe({ next: onExito, error: onError });
      }
    } else if (this.pestanaActiva === 'idiomas') {
      const data = { nombre: v.nombre! };
      if (this.editandoId) {
        this.service.modificarIdioma(this.editandoId, data).subscribe({ next: onExito, error: onError });
      } else {
        this.service.crearIdioma(data).subscribe({ next: onExito, error: onError });
      }
    }
  }

  eliminar(id: number): void {
    if (!confirm(`¿Está seguro de eliminar este registro de ${this.tituloSingular}?`)) return;

    this.mensajeError = null;
    this.service[
      this.pestanaActiva === 'municipios' ? 'eliminarMunicipio' :
      this.pestanaActiva === 'tipos' ? 'eliminarTipoPrestador' :
      this.pestanaActiva === 'roles' ? 'eliminarRol' :
      this.pestanaActiva === 'categorias' ? 'eliminarCategoriaTour' : 'eliminarIdioma'
    ](id).subscribe({
      next: () => {
        this.mensajeExito = `${this.tituloSingular} eliminado exitosamente.`;
        setTimeout(() => (this.mensajeExito = null), 4000);
        this.cargarDatos();
      },
      error: (err) => {
        if (err.status === 409) {
          this.mensajeError = 'No se puede eliminar este registro porque está referenciado por otros datos del sistema (Restricción de Integridad FK).';
        } else {
          this.mensajeError = err.error?.mensaje || 'Error al eliminar registro.';
        }
      }
    });
  }

  private manejarError(msg: string, e: any): void {
    console.error(msg, e);
    this.cargando = false;
    this.mensajeError = msg;
  }
}
