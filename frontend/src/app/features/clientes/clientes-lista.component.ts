import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ClientesService } from './clientes.service';
import { AuthService } from '../../core/auth/auth.service';
import { ClienteDto, ActualizarPerfilRequest } from '../../core/models/cliente.model';
import { IconComponent } from '../../shared/icon/icon.component';
import { TablaVaciaComponent } from '../../shared/tabla-vacia/tabla-vacia.component';

@Component({
  selector: 'app-clientes-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IconComponent,
    TablaVaciaComponent
  ],
  template: `
    <div class="clientes-page animate-fade-in">
      <!-- MODO CLIENTE: MI PERFIL -->
      <div *ngIf="esSoloCliente" class="perfil-container">
        <div class="page-header">
          <div>
            <div class="breadcrumb">
              <app-icon name="user" [size]="14"></app-icon>
              <span>Viajero · Tu Cuenta</span>
            </div>
            <h1 class="page-title">Mi Perfil y Preferencias</h1>
            <p class="page-subtitle">Gestiona tus canales de notificación para recordatorios de tours y promociones.</p>
          </div>
        </div>

        <div *ngIf="cargando" class="loading-state glass-card">
          <div class="spinner"></div>
          <span>Cargando tu información...</span>
        </div>

        <div *ngIf="!cargando && perfilCliente" class="perfil-card glass-card">
          <div class="perfil-header">
            <div class="avatar-large">
              <app-icon name="user" [size]="36"></app-icon>
            </div>
            <div class="perfil-titles">
              <h2 class="perfil-name">{{ perfilCliente.nombres }} {{ perfilCliente.apellidos }}</h2>
              <p class="perfil-email">{{ perfilCliente.correo }} · Doc: {{ perfilCliente.tipoDocumento }} {{ perfilCliente.numeroDocumento }}</p>
            </div>
          </div>

          <form [formGroup]="formPerfil" (ngSubmit)="guardarMiPerfil()" class="perfil-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Teléfono Móvil</label>
                <input type="text" formControlName="telefono" class="form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Ciudad de Residencia / Origen</label>
                <input type="text" formControlName="ciudadOrigen" class="form-control" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Idioma de Preferencia</label>
                <select formControlName="idiomaPreferido" class="form-control">
                  <option value="ESPAÑOL">Español</option>
                  <option value="INGLES">Inglés (English)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Canal Preferido de Notificación</label>
                <select formControlName="canalPreferido" class="form-control">
                  <option value="CORREO">Correo Electrónico</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="SMS">Mensaje SMS</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Anticipación de Recordatorios (Días antes)</label>
                <select formControlName="anticipacionDias" class="form-control">
                  <option [ngValue]="1">1 día antes del tour</option>
                  <option [ngValue]="2">2 días antes del tour</option>
                  <option [ngValue]="3">3 días antes del tour</option>
                  <option [ngValue]="7">1 semana antes del tour</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Recepción de Promociones</label>
                <select formControlName="aceptaPromociones" class="form-control">
                  <option value="S">Sí, deseo recibir ofertas especiales</option>
                  <option value="N">No, solo notificaciones de servicio</option>
                </select>
              </div>
            </div>

            <div *ngIf="mensajeExito" class="success-alert">
              <app-icon name="check" [size]="16"></app-icon>
              <span>{{ mensajeExito }}</span>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="formPerfil.invalid || guardando">
                <app-icon name="check" [size]="16"></app-icon>
                <span>{{ guardando ? 'Guardando...' : 'Actualizar Preferencias' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODO OPERADOR / ADMIN: DIRECTORIO DE CLIENTES -->
      <div *ngIf="!esSoloCliente" class="directorio-container">
        <div class="page-header">
          <div>
            <div class="breadcrumb">
              <app-icon name="users" [size]="14"></app-icon>
              <span>Directorio · Base de Viajeros</span>
            </div>
            <h1 class="page-title">Directorio de Clientes</h1>
            <p class="page-subtitle">Padrón de usuarios registrados, canales preferidos y configuración de alertas.</p>
          </div>
        </div>

        <!-- Filtros -->
        <div class="filters-card glass-card">
          <div class="filter-group search">
            <app-icon name="search" [size]="16" class="search-icon"></app-icon>
            <input
              type="text"
              placeholder="Buscar por nombre, documento o correo..."
              [(ngModel)]="filtroTexto"
              (ngModelChange)="filtrarClientes()" />
          </div>

          <div class="filter-group">
            <select [(ngModel)]="filtroCanal" (change)="filtrarClientes()">
              <option value="">Todos los canales</option>
              <option value="EMAIL">Correo Electrónico</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="SMS">SMS</option>
            </select>
          </div>

          <button class="btn btn-secondary" (click)="limpiarFiltros()">
            <app-icon name="refresh" [size]="14"></app-icon>
            <span>Limpiar</span>
          </button>
        </div>

        <!-- Tabla -->
        <div class="table-card glass-card">
          <div *ngIf="cargando" class="loading-state">
            <div class="spinner"></div>
            <span>Cargando padrón de clientes...</span>
          </div>

          <div class="table-responsive" *ngIf="!cargando && clientesFiltrados.length">
            <table class="clientes-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre Completo</th>
                  <th>Documento</th>
                  <th>Contacto</th>
                  <th>Origen</th>
                  <th>Canal Preferido</th>
                  <th>Anticipación</th>
                  <th class="actions-col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of clientesFiltrados">
                  <td class="id-cell">#CLI-{{ c.idCliente }}</td>
                  <td>
                    <div class="name-cell">
                      <span class="full-name">{{ c.nombres }} {{ c.apellidos }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="doc-text">{{ c.tipoDocumento }}: {{ c.numeroDocumento }}</span>
                  </td>
                  <td>
                    <div class="contact-box">
                      <span class="c-email">{{ c.correo }}</span>
                      <span class="c-tel" *ngIf="c.telefono">{{ c.telefono }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="city-text">{{ c.ciudadOrigen || 'No registrada' }}</span>
                  </td>
                  <td>
                    <span class="canal-badge" [ngClass]="(c.canalPreferido || 'email').toLowerCase()">
                      {{ c.canalPreferido || 'EMAIL' }}
                    </span>
                  </td>
                  <td>
                    <span class="anticipacion-tag">{{ c.anticipacionDias || 1 }} d</span>
                  </td>
                  <td class="actions-col">
                    <button class="action-btn edit" (click)="abrirModalEditar(c)" title="Editar preferencias">
                      <app-icon name="edit" [size]="14"></app-icon>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <app-tabla-vacia
            *ngIf="!cargando && !clientesFiltrados.length"
            titulo="No se encontraron clientes"
            subtitulo="Aún no hay viajeros registrados que coincidan con la búsqueda.">
          </app-tabla-vacia>
        </div>
      </div>

      <!-- MODAL EDITAR PREFERENCIAS DE CLIENTE (ADMIN/OPERADOR) -->
      <div class="modal-backdrop" *ngIf="clienteSeleccionado" (click)="clienteSeleccionado = null">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Preferencias de {{ clienteSeleccionado.nombres }} {{ clienteSeleccionado.apellidos }}</h3>
              <p class="modal-subtitle">Actualizar canal de notificaciones y recordatorios</p>
            </div>
            <button class="close-btn" (click)="clienteSeleccionado = null">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form [formGroup]="formAdmin" (ngSubmit)="guardarClienteAdmin()" class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input type="text" formControlName="telefono" class="form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Ciudad de Origen</label>
                <input type="text" formControlName="ciudadOrigen" class="form-control" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Idioma</label>
                <select formControlName="idiomaPreferido" class="form-control">
                  <option value="ESPAÑOL">Español</option>
                  <option value="INGLES">Inglés</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Canal Preferido</label>
                <select formControlName="canalPreferido" class="form-control">
                  <option value="CORREO">Correo Electrónico</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Días de Anticipación</label>
                <input type="number" formControlName="anticipacionDias" min="1" max="30" class="form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Acepta Promociones</label>
                <select formControlName="aceptaPromociones" class="form-control">
                  <option value="S">Sí</option>
                  <option value="N">No</option>
                </select>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="clienteSeleccionado = null">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="formAdmin.invalid || guardando">
                <app-icon name="check" [size]="16"></app-icon>
                <span>{{ guardando ? 'Guardando...' : 'Guardar Cambios' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .clientes-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 20px;
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

    /* Perfil Card */
    .perfil-card {
      padding: 32px;
      border-radius: 20px;
      max-width: 720px;
    }

    .perfil-header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: 24px;
    }

    .avatar-large {
      width: 64px;
      height: 64px;
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(11, 45, 31, 0.1) 100%);
      color: var(--color-primary-dark);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .perfil-name {
      font-family: var(--font-heading);
      font-size: 1.375rem;
      font-weight: 800;
      color: var(--color-ink);
      margin: 0 0 4px;
    }

    .perfil-email {
      font-size: 0.8125rem;
      color: var(--color-ink-muted);
      margin: 0;
    }

    .perfil-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
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

    .success-alert {
      padding: 12px 16px;
      border-radius: 10px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #047857;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 16px;
    }

    /* Directorio Table */
    .filters-card {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 16px 20px;
      border-radius: 16px;
      align-items: center;
      margin-bottom: 20px;
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

    .clientes-table {
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

    .full-name {
      font-weight: 700;
      color: var(--color-ink);
    }

    .doc-text {
      font-size: 0.8125rem;
      color: var(--color-ink-muted);
    }

    .contact-box {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 0.8125rem;

      .c-email { color: var(--color-ink); font-weight: 600; }
      .c-tel { color: var(--color-ink-muted); font-size: 0.75rem; }
    }

    .city-text {
      font-size: 0.8125rem;
      color: var(--color-ink);
    }

    .canal-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;

      &.email { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
      &.whatsapp { background: rgba(16, 185, 129, 0.12); color: #047857; }
      &.sms { background: rgba(139, 92, 246, 0.12); color: #7c3aed; }
    }

    .anticipacion-tag {
      font-size: 0.75rem;
      font-weight: 600;
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

      &.edit:hover {
        background: rgba(16, 185, 129, 0.1);
        color: #059669;
        border-color: rgba(16, 185, 129, 0.3);
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
export class ClientesListaComponent implements OnInit {
  private clientesService = inject(ClientesService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  clientes: ClienteDto[] = [];
  clientesFiltrados: ClienteDto[] = [];
  perfilCliente: ClienteDto | null = null;

  cargando = true;
  guardando = false;
  filtroTexto = '';
  filtroCanal = '';
  mensajeExito: string | null = null;

  clienteSeleccionado: ClienteDto | null = null;

  formPerfil = this.fb.group({
    telefono: [''],
    ciudadOrigen: [''],
    idiomaPreferido: ['ESPAÑOL', [Validators.required]],
    canalPreferido: ['CORREO', [Validators.required]],
    anticipacionDias: [3, [Validators.required]],
    aceptaPromociones: ['SI', [Validators.required]]
  });

  formAdmin = this.fb.group({
    telefono: [''],
    ciudadOrigen: [''],
    idiomaPreferido: ['ESPAÑOL', [Validators.required]],
    canalPreferido: ['CORREO', [Validators.required]],
    anticipacionDias: [3, [Validators.required]],
    aceptaPromociones: ['SI', [Validators.required]]
  });

  get esSoloCliente(): boolean {
    return this.authService.esCliente();
  }

  ngOnInit(): void {
    if (this.esSoloCliente) {
      this.cargarMiPerfil();
    } else {
      this.cargarClientes();
    }
  }

  cargarMiPerfil(): void {
    this.cargando = true;
    this.clientesService.obtenerMiPerfil().subscribe({
      next: (cli) => {
        this.perfilCliente = cli;
        this.formPerfil.patchValue({
          telefono: cli.telefono || '',
          ciudadOrigen: cli.ciudadOrigen || '',
          idiomaPreferido: cli.idiomaPreferido || 'ESPAÑOL',
          canalPreferido: cli.canalPreferido || 'CORREO',
          anticipacionDias: cli.anticipacionDias || 3,
          aceptaPromociones: cli.aceptaPromociones || 'SI'
        });
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error al cargar perfil cliente', e);
        this.cargando = false;
      }
    });
  }

  guardarMiPerfil(): void {
    if (this.formPerfil.invalid) return;

    this.guardando = true;
    this.mensajeExito = null;
    const v = this.formPerfil.value;

    const req: ActualizarPerfilRequest = {
      telefono: v.telefono || undefined,
      ciudadOrigen: v.ciudadOrigen || undefined,
      idiomaPreferido: v.idiomaPreferido!,
      canalPreferido: v.canalPreferido!,
      anticipacionDias: v.anticipacionDias!,
      aceptaPromociones: v.aceptaPromociones!
    };

    this.clientesService.actualizarMiPerfil(req).subscribe({
      next: (resp) => {
        this.guardando = false;
        this.perfilCliente = resp;
        this.mensajeExito = 'Preferencias actualizadas con éxito.';
        setTimeout(() => (this.mensajeExito = null), 4000);
      },
      error: (err) => {
        this.guardando = false;
        alert(err.error?.mensaje || 'Error al actualizar preferencias');
      }
    });
  }

  cargarClientes(): void {
    this.cargando = true;
    this.clientesService.listar().subscribe({
      next: (data) => {
        this.clientes = data || [];
        this.filtrarClientes();
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error al cargar clientes', e);
        this.cargando = false;
      }
    });
  }

  filtrarClientes(): void {
    let res = [...this.clientes];
    if (this.filtroTexto.trim()) {
      const q = this.filtroTexto.toLowerCase();
      res = res.filter(
        (c) =>
          c.nombres?.toLowerCase().includes(q) ||
          c.apellidos?.toLowerCase().includes(q) ||
          c.correo?.toLowerCase().includes(q) ||
          c.numeroDocumento?.toLowerCase().includes(q)
      );
    }
    if (this.filtroCanal) {
      res = res.filter((c) => (c.canalPreferido || 'EMAIL') === this.filtroCanal);
    }
    this.clientesFiltrados = res;
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroCanal = '';
    this.filtrarClientes();
  }

  abrirModalEditar(c: ClienteDto): void {
    this.clienteSeleccionado = c;
    this.formAdmin.patchValue({
      telefono: c.telefono || '',
      ciudadOrigen: c.ciudadOrigen || '',
      idiomaPreferido: c.idiomaPreferido || 'ESPAÑOL',
      canalPreferido: c.canalPreferido || 'CORREO',
      anticipacionDias: c.anticipacionDias || 3,
      aceptaPromociones: c.aceptaPromociones || 'SI'
    });
  }

  guardarClienteAdmin(): void {
    if (this.formAdmin.invalid || !this.clienteSeleccionado) return;

    this.guardando = true;
    const v = this.formAdmin.value;

    const req: ActualizarPerfilRequest = {
      telefono: v.telefono || undefined,
      ciudadOrigen: v.ciudadOrigen || undefined,
      idiomaPreferido: v.idiomaPreferido!,
      canalPreferido: v.canalPreferido!,
      anticipacionDias: v.anticipacionDias!,
      aceptaPromociones: v.aceptaPromociones!
    };

    this.clientesService.actualizarPerfilPorId(this.clienteSeleccionado.idCliente, req).subscribe({
      next: () => {
        this.guardando = false;
        this.clienteSeleccionado = null;
        this.cargarClientes();
      },
      error: (err) => {
        this.guardando = false;
        alert(err.error?.mensaje || 'Error al actualizar cliente');
      }
    });
  }
}
