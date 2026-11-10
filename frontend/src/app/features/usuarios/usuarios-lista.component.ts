import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsuariosService, CrearUsuarioRequest } from './usuarios.service';
import { PrestadoresService } from '../prestadores/prestadores.service';
import { UsuarioSistemaDto, RolDto } from '../../core/models/usuario.model';
import { PrestadorDto } from '../../core/models/prestador.model';
import { IconComponent } from '../../shared/icon/icon.component';
import { PillEstadoComponent } from '../../shared/pill-estado/pill-estado.component';
import { TablaVaciaComponent } from '../../shared/tabla-vacia/tabla-vacia.component';

@Component({
  selector: 'app-usuarios-lista',
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
    <div class="usuarios-page animate-fade-in">
      <!-- Encabezado de página -->
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <app-icon name="shield" [size]="14"></app-icon>
            <span>Seguridad · Cuentas Internas</span>
          </div>
          <h1 class="page-title">Usuarios del Sistema</h1>
          <p class="page-subtitle">Control de accesos por roles y asignación de prestadores turísticos (Regla RN13).</p>
        </div>
        <button class="btn btn-primary" (click)="abrirModalCrear()">
          <app-icon name="plus" [size]="16"></app-icon>
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <!-- Filtros -->
      <div class="filters-card glass-card">
        <div class="filter-group search">
          <app-icon name="search" [size]="16" class="search-icon"></app-icon>
          <input
            type="text"
            placeholder="Buscar por usuario o prestador..."
            [(ngModel)]="filtroTexto"
            (ngModelChange)="filtrarUsuarios()" />
        </div>

        <div class="filter-group">
          <select [(ngModel)]="filtroRol" (change)="filtrarUsuarios()">
            <option value="">Todos los roles</option>
            <option *ngFor="let r of roles" [value]="r.nombre">{{ r.nombre }}</option>
          </select>
        </div>

        <div class="filter-group">
          <select [(ngModel)]="filtroEstado" (change)="filtrarUsuarios()">
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="BLOQUEADO">Bloqueado</option>
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
        <span>Cargando cuentas de usuario...</span>
      </div>

      <!-- Tabla de Usuarios -->
      <div class="table-card glass-card" *ngIf="!cargando && usuariosFiltrados.length">
        <div class="table-responsive">
          <table class="usuarios-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Rol Asignado</th>
                <th>Prestador Vinculado</th>
                <th>Estado</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of usuariosFiltrados">
                <td class="id-cell">#USR-{{ u.idUsuario }}</td>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">
                      <app-icon name="user" [size]="16"></app-icon>
                    </div>
                    <span class="username">{{ u.nombreUsuario }}</span>
                  </div>
                </td>
                <td>
                  <span class="rol-badge" [ngClass]="u.rolNombre.toLowerCase()">
                    {{ u.rolNombre }}
                  </span>
                </td>
                <td>
                  <span class="prestador-text" *ngIf="u.prestadorNombre">
                    <app-icon name="building" [size]="13"></app-icon>
                    {{ u.prestadorNombre }}
                  </span>
                  <span class="sin-prestador" *ngIf="!u.prestadorNombre">
                    N/A (Plataforma Global)
                  </span>
                </td>
                <td>
                  <app-pill-estado [estado]="u.estado"></app-pill-estado>
                </td>
                <td class="actions-col">
                  <div class="actions-group">
                    <button
                      class="action-btn toggle"
                      [class.active]="u.estado === 'ACTIVO'"
                      (click)="toggleEstado(u)"
                      [title]="u.estado === 'ACTIVO' ? 'Bloquear usuario' : 'Desbloquear usuario'">
                      <app-icon [name]="u.estado === 'ACTIVO' ? 'lock' : 'unlock'" [size]="14"></app-icon>
                    </button>
                    <button class="action-btn delete" (click)="confirmarEliminar(u)" title="Eliminar usuario">
                      <app-icon name="trash" [size]="14"></app-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <app-tabla-vacia
        *ngIf="!cargando && !usuariosFiltrados.length"
        titulo="No se encontraron usuarios"
        subtitulo="Intenta con otros filtros o crea un nuevo usuario administrativo.">
      </app-tabla-vacia>

      <!-- MODAL CREAR USUARIO -->
      <div class="modal-backdrop" *ngIf="mostrarModal" (click)="cerrarModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Nuevo Usuario del Sistema</h3>
              <p class="modal-subtitle">Asignación de credenciales y rol (RN13)</p>
            </div>
            <button class="close-btn" (click)="cerrarModal()">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="guardar()" class="modal-body">
            <div class="form-group">
              <label class="form-label">Nombre de Usuario <span class="req">*</span></label>
              <input
                type="text"
                formControlName="nombreUsuario"
                placeholder="Ej. operador.cocora"
                class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label">Contraseña <span class="req">*</span></label>
              <input
                type="password"
                formControlName="contrasena"
                placeholder="Mínimo 6 caracteres"
                class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label">Rol del Sistema <span class="req">*</span></label>
              <select formControlName="idRol" class="form-control" (change)="onRolChange()">
                <option [ngValue]="null" disabled>Selecciona un rol</option>
                <option *ngFor="let r of roles" [ngValue]="r.idRol">{{ r.nombre }}</option>
              </select>
            </div>

            <!-- Prestador selector (requerido si rol es ENCARGADO_PRESTADOR por RN13) -->
            <div class="form-group" *ngIf="esRolEncargado">
              <label class="form-label">
                Prestador Asociado <span class="req">*</span>
                <span class="label-hint">(Requerido por Regla RN13)</span>
              </label>
              <select formControlName="idPrestador" class="form-control">
                <option [ngValue]="null" disabled>Selecciona el prestador</option>
                <option *ngFor="let p of prestadores" [ngValue]="p.idPrestador">
                  {{ p.nombreComercial }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Estado Inicial <span class="req">*</span></label>
              <select formControlName="estado" class="form-control">
                <option value="ACTIVO">Activo</option>
                <option value="BLOQUEADO">Bloqueado</option>
              </select>
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
                <span>{{ guardando ? 'Guardando...' : 'Crear Usuario' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .usuarios-page {
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

    .table-card {
      border-radius: 16px;
      padding: 0;
      overflow: hidden;
    }

    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }

    .usuarios-table {
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

    .user-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(11, 45, 31, 0.06);
      color: var(--color-primary-dark);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .username {
      font-weight: 700;
      color: var(--color-ink);
    }

    .rol-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;

      &.administrador_plataforma, &.admin {
        background: rgba(11, 45, 31, 0.1);
        color: var(--color-primary-dark);
      }

      &.operador {
        background: rgba(16, 185, 129, 0.12);
        color: #047857;
      }

      &.encargado_prestador {
        background: rgba(20, 184, 166, 0.12);
        color: #0f766e;
      }
    }

    .prestador-text {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: var(--color-ink);
      font-size: 0.8125rem;
    }

    .sin-prestador {
      font-size: 0.75rem;
      color: var(--color-ink-muted);
      font-style: italic;
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

      &.toggle:hover {
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
      max-width: 500px;
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

    .form-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-ink);

      .req { color: #dc2626; }
      .label-hint { font-size: 0.75rem; color: #d97706; font-weight: normal; }
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
export class UsuariosListaComponent implements OnInit {
  private usuariosService = inject(UsuariosService);
  private prestadoresService = inject(PrestadoresService);
  private fb = inject(FormBuilder);

  usuarios: UsuarioSistemaDto[] = [];
  usuariosFiltrados: UsuarioSistemaDto[] = [];
  roles: RolDto[] = [];
  prestadores: PrestadorDto[] = [];

  cargando = true;
  guardando = false;
  filtroTexto = '';
  filtroRol = '';
  filtroEstado = '';

  mostrarModal = false;
  errorMensaje: string | null = null;

  form = this.fb.group({
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    contrasena: ['', [Validators.required, Validators.minLength(6)]],
    idRol: [null as number | null, [Validators.required]],
    estado: ['ACTIVO' as 'ACTIVO' | 'BLOQUEADO', [Validators.required]],
    idPrestador: [null as number | null]
  });

  get esRolEncargado(): boolean {
    const idRol = this.form.get('idRol')?.value;
    const r = this.roles.find((item) => item.idRol === idRol);
    return r?.nombre === 'ENCARGADO_PRESTADOR';
  }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.usuariosService.listarRoles().subscribe({
      next: (rs) => (this.roles = rs || [])
    });

    this.prestadoresService.listar().subscribe({
      next: (prs) => (this.prestadores = prs || [])
    });
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuariosService.listar().subscribe({
      next: (data) => {
        this.usuarios = data || [];
        this.filtrarUsuarios();
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error al cargar usuarios', e);
        this.cargando = false;
      }
    });
  }

  filtrarUsuarios(): void {
    let res = [...this.usuarios];
    if (this.filtroTexto.trim()) {
      const q = this.filtroTexto.toLowerCase();
      res = res.filter(
        (u) =>
          u.nombreUsuario?.toLowerCase().includes(q) ||
          u.prestadorNombre?.toLowerCase().includes(q)
      );
    }
    if (this.filtroRol) {
      res = res.filter((u) => u.rolNombre === this.filtroRol);
    }
    if (this.filtroEstado) {
      res = res.filter((u) => u.estado === this.filtroEstado);
    }
    this.usuariosFiltrados = res;
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroRol = '';
    this.filtroEstado = '';
    this.filtrarUsuarios();
  }

  onRolChange(): void {
    if (!this.esRolEncargado) {
      this.form.patchValue({ idPrestador: null });
    }
  }

  abrirModalCrear(): void {
    this.errorMensaje = null;
    this.form.reset({
      nombreUsuario: '',
      contrasena: '',
      idRol: this.roles.length ? this.roles[0].idRol : null,
      estado: 'ACTIVO',
      idPrestador: null
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardar(): void {
    if (this.form.invalid) return;

    if (this.esRolEncargado && !this.form.get('idPrestador')?.value) {
      this.errorMensaje = 'Regla RN13: Debe asignar un prestador para el rol ENCARGADO_PRESTADOR';
      return;
    }

    this.guardando = true;
    this.errorMensaje = null;
    const v = this.form.value;

    const req: CrearUsuarioRequest = {
      nombreUsuario: v.nombreUsuario!,
      contrasena: v.contrasena!,
      idRol: v.idRol!,
      estado: v.estado as 'ACTIVO' | 'BLOQUEADO',
      idPrestador: v.idPrestador || undefined
    };

    this.usuariosService.crear(req).subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.cargarUsuarios();
      },
      error: (err) => {
        this.guardando = false;
        this.errorMensaje = err.error?.mensaje || 'Error al crear usuario';
      }
    });
  }

  toggleEstado(usuario: UsuarioSistemaDto): void {
    const nuevo = usuario.estado === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO';
    this.usuariosService.cambiarEstado(usuario.idUsuario, nuevo).subscribe({
      next: (resp) => {
        usuario.estado = resp.estado;
      },
      error: (err) => {
        alert(err.error?.mensaje || 'Error al cambiar estado');
      }
    });
  }

  confirmarEliminar(usuario: UsuarioSistemaDto): void {
    if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombreUsuario}?`)) {
      this.usuariosService.eliminar(usuario.idUsuario).subscribe({
        next: () => this.cargarUsuarios(),
        error: (err) => alert(err.error?.mensaje || 'Error al eliminar usuario')
      });
    }
  }
}
