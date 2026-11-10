import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToursService } from './tours.service';
import { PrestadoresService } from '../prestadores/prestadores.service';
import { CategoriaTourDto, CrearTourRequest, Dificultad, TourDetalleDto } from '../../core/models/tour.model';
import { PrestadorDto } from '../../core/models/prestador.model';
import { AuthService } from '../../core/auth/auth.service';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-tours-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="page-container animate-fade-in">
      <!-- Encabezado de Página -->
      <div class="page-header">
        <div>
          <span class="page-category">Catálogo de Destinos</span>
          <h1 class="page-title">Tours & Experiencias Locales</h1>
          <p class="page-description">
            Rutas de senderismo, aventura, patrimonio cafetero y avistamiento de fauna en el Quindío.
          </p>
        </div>

        <button *ngIf="puedeGestionar" class="btn btn-primary" (click)="abrirModalCrear()">
          <app-icon name="plus" [size]="18"></app-icon>
          <span>Nuevo Tour</span>
        </button>
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="filter-bar glass-card">
        <div class="search-box">
          <app-icon name="search" [size]="16" class="search-icon"></app-icon>
          <input
            type="text"
            class="search-input"
            placeholder="Buscar tour por nombre..."
            [value]="filtroTexto"
            (input)="onSearchInput($event)" />
        </div>

        <div class="filter-group">
          <select class="filter-select" [value]="filtroDificultad" (change)="onDificultadChange($event)">
            <option value="">Todas las dificultades</option>
            <option value="BAJA">Baja</option>
            <option value="MODERADA">Moderada</option>
            <option value="ALTA">Alta</option>
          </select>
        </div>
      </div>

      <!-- Spinner de Carga -->
      <div *ngIf="cargando" class="loading-state">
        <span class="spinner spinner-dark"></span>
        <p>Cargando experiencias...</p>
      </div>

      <!-- Grilla de Tours Premium -->
      <div *ngIf="!cargando" class="tours-grid">
        <div *ngFor="let tour of toursFiltrados" class="tour-card glass-card">
          <div class="card-top">
            <span class="category-badge">{{ tour.categoriaNombre }}</span>
            <span class="difficulty-pill" [ngClass]="'diff-' + tour.dificultad.toLowerCase()">
              {{ tour.dificultad }}
            </span>
          </div>

          <h3 class="tour-title">{{ tour.nombre }}</h3>
          <p class="tour-desc">{{ tour.descripcion }}</p>

          <div class="tour-meta">
            <div class="meta-item">
              <app-icon name="clock" [size]="14"></app-icon>
              <span>{{ tour.duracionHoras }} horas</span>
            </div>
            <div class="meta-item">
              <app-icon name="user" [size]="14"></app-icon>
              <span>Mín. {{ tour.edadMinima }} años</span>
            </div>
          </div>

          <div class="card-footer">
            <div class="price-box">
              <span class="price-label">Precio por persona</span>
              <span class="price-val">\${{ tour.precioPersona | number:'1.0-0' }}</span>
            </div>

            <div class="actions-box" *ngIf="puedeGestionar">
              <button class="btn-icon" (click)="abrirModalEditar(tour)" title="Editar">
                <app-icon name="edit" [size]="16"></app-icon>
              </button>
              <button class="btn-icon btn-icon-danger" (click)="eliminar(tour.idTour)" title="Eliminar">
                <app-icon name="trash" [size]="16"></app-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado Vacío -->
      <div *ngIf="!cargando && toursFiltrados.length === 0" class="empty-state glass-card">
        <app-icon name="compass" [size]="48" class="empty-icon"></app-icon>
        <h3>No se encontraron tours</h3>
        <p>Intenta ajustar tus criterios de búsqueda o agrega un nuevo tour al catálogo.</p>
      </div>

      <!-- MODAL CREAR / EDITAR TOUR -->
      <div *ngIf="mostrarModal" class="modal-backdrop animate-fade-in">
        <div class="modal-card animate-slide-up">
          <div class="modal-header">
            <h3>{{ editandoId ? 'Editar Tour' : 'Nuevo Tour Turístico' }}</h3>
            <button class="btn-close" (click)="cerrarModal()">
              <app-icon name="x" [size]="20"></app-icon>
            </button>
          </div>

          <form [formGroup]="tourForm" (ngSubmit)="guardar()">
            <div class="form-group">
              <label class="form-label">Nombre del Tour *</label>
              <input type="text" class="form-input" placeholder="Ej: Senderismo Valle de Cocora" formControlName="nombre" />
            </div>

            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea class="form-control" rows="3" placeholder="Detalles de la experiencia y atractivos..." formControlName="descripcion"></textarea>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Duración (Horas) *</label>
                <input type="number" step="0.5" class="form-input" placeholder="4.5" formControlName="duracionHoras" />
              </div>

              <div class="form-group">
                <label class="form-label">Dificultad *</label>
                <select class="form-select" formControlName="dificultad">
                  <option value="BAJA">Baja</option>
                  <option value="MODERADA">Moderada</option>
                  <option value="ALTA">Alta</option>
                </select>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Edad Mínima (Años) *</label>
                <input type="number" class="form-input" placeholder="8" formControlName="edadMinima" />
              </div>

              <div class="form-group">
                <label class="form-label">Precio por Persona (\$) *</label>
                <input type="number" step="1000" class="form-input" placeholder="85000" formControlName="precioPersona" />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Categoría *</label>
                <select class="form-select" formControlName="idCategoria">
                  <option *ngFor="let c of categorias" [ngValue]="c.idCategoria">{{ c.nombre }}</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Prestador Operador *</label>
                <select class="form-select" formControlName="idPrestador">
                  <option *ngFor="let p of prestadores" [ngValue]="p.idPrestador">{{ p.nombreComercial }}</option>
                </select>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="tourForm.invalid || guardando">
                <span *ngIf="guardando" class="spinner"></span>
                <span *ngIf="!guardando">{{ editandoId ? 'Actualizar Tour' : 'Guardar Tour' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 28px;
    }

    .page-category {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      color: #10B981;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }

    .page-title {
      font-family: var(--font-heading, 'Outfit', sans-serif);
      font-size: 2rem;
      font-weight: 800;
      color: #071911;
      letter-spacing: -0.03em;
      margin: 0 0 6px;
    }

    .page-description {
      font-size: 0.9375rem;
      color: #5B6B61;
      margin: 0;
      max-width: 600px;
    }

    .filter-bar {
      display: flex;
      gap: 16px;
      padding: 16px 20px;
      margin-bottom: 28px;
      align-items: center;

      .search-box {
        flex: 1;
        position: relative;
        display: flex;
        align-items: center;

        .search-icon {
          position: absolute;
          left: 14px;
          color: #9CA3AF;
        }

        .search-input {
          width: 100%;
          padding: 10px 14px 10px 40px;
          background: #FFFFFF;
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 10px;
          font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
          font-size: 0.875rem;
          outline: none;

          &:focus {
            border-color: #10B981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
          }
        }
      }

      .filter-select {
        padding: 10px 14px;
        background: #FFFFFF;
        border: 1px solid rgba(16, 185, 129, 0.2);
        border-radius: 10px;
        font-size: 0.875rem;
        font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
        outline: none;
      }
    }

    .tours-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .tour-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-radius: 18px;
      background: #FFFFFF;
      transition: transform 0.25s, box-shadow 0.25s;

      &:hover {
        transform: translateY(-4px) scale(1.01);
        box-shadow: 0 20px 35px -10px rgba(11, 45, 31, 0.15);
      }

      .card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;

        .category-badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: #065F46;
          background: rgba(16, 185, 129, 0.12);
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .difficulty-pill {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;

          &.diff-baja { background: #ECFDF5; color: #047857; }
          &.diff-moderada { background: #FEF3C7; color: #B45309; }
          &.diff-alta { background: #FEE2E2; color: #B91C1C; }
        }
      }

      .tour-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.25rem;
        font-weight: 700;
        color: #071911;
        margin: 0 0 10px;
        line-height: 1.3;
      }

      .tour-desc {
        font-size: 0.875rem;
        color: #5B6B61;
        line-height: 1.5;
        margin-bottom: 18px;
        flex: 1;
      }

      .tour-meta {
        display: flex;
        gap: 16px;
        padding: 12px 0;
        border-top: 1px solid #F0F4F1;
        border-bottom: 1px solid #F0F4F1;
        margin-bottom: 16px;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          color: #4B5563;

          app-icon {
            color: #10B981;
          }
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;

        .price-box {
          display: flex;
          flex-direction: column;

          .price-label {
            font-size: 0.6875rem;
            color: #9CA3AF;
            text-transform: uppercase;
            font-weight: 600;
          }

          .price-val {
            font-family: var(--font-heading, 'Outfit', sans-serif);
            font-size: 1.35rem;
            font-weight: 800;
            color: #064E3B;
          }
        }

        .actions-box {
          display: flex;
          gap: 8px;
        }
      }
    }

    .btn-icon {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: #F3F8F4;
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: #0B2D1F;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #10B981;
        color: #FFFFFF;
      }

      &.btn-icon-danger:hover {
        background: #EF4444;
        border-color: #EF4444;
        color: #FFFFFF;
      }
    }

    .loading-state, .empty-state {
      padding: 60px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: #5B6B61;

      .empty-icon {
        color: #9CA3AF;
        margin-bottom: 8px;
      }
    }

    // Modal
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      z-index: 100; padding: 20px;
    }

    .modal-card {
      width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto;
      background: #FFFFFF; border-radius: 20px; padding: 32px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
      h3 { font-family: var(--font-heading, 'Outfit', sans-serif); font-size: 1.35rem; margin: 0; color: #071911; }
      .btn-close { background: none; border: none; color: #9CA3AF; cursor: pointer; &:hover { color: #071911; } }
    }

    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
  `]
})
export class ToursListaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private toursService = inject(ToursService);
  private prestadoresService = inject(PrestadoresService);
  private authService = inject(AuthService);

  tours: TourDetalleDto[] = [];
  categorias: CategoriaTourDto[] = [];
  prestadores: PrestadorDto[] = [];
  cargando = true;
  guardando = false;

  filtroTexto = '';
  filtroDificultad = '';

  mostrarModal = false;
  editandoId: number | null = null;

  get puedeGestionar(): boolean {
    return !this.authService.esCliente();
  }

  tourForm = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    duracionHoras: [3.0, [Validators.required, Validators.min(0.5)]],
    dificultad: ['MODERADA' as Dificultad, Validators.required],
    edadMinima: [8, [Validators.required, Validators.min(0)]],
    precioPersona: [85000, [Validators.required, Validators.min(1)]],
    idCategoria: [1, Validators.required],
    idPrestador: [1, Validators.required]
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.toursService.listar().subscribe({
      next: (data) => {
        this.tours = data;
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });

    this.toursService.listarCategorias().subscribe({
      next: (cats) => { this.categorias = cats; }
    });

    this.prestadoresService.listar().subscribe({
      next: (prests) => { this.prestadores = prests; }
    });
  }

  get toursFiltrados(): TourDetalleDto[] {
    return this.tours.filter(t => {
      const matchText = !this.filtroTexto || t.nombre.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
                        t.descripcion.toLowerCase().includes(this.filtroTexto.toLowerCase());
      const matchDiff = !this.filtroDificultad || t.dificultad === this.filtroDificultad;
      return matchText && matchDiff;
    });
  }

  onSearchInput(event: Event): void {
    this.filtroTexto = (event.target as HTMLInputElement).value;
  }

  onDificultadChange(event: Event): void {
    this.filtroDificultad = (event.target as HTMLSelectElement).value;
  }

  abrirModalCrear(): void {
    this.editandoId = null;
    this.tourForm.reset({
      duracionHoras: 3.0,
      dificultad: 'MODERADA',
      edadMinima: 8,
      precioPersona: 85000,
      idCategoria: this.categorias[0]?.idCategoria || 1,
      idPrestador: this.prestadores[0]?.idPrestador || 1
    });
    this.mostrarModal = true;
  }

  abrirModalEditar(tour: TourDetalleDto): void {
    this.editandoId = tour.idTour;
    this.tourForm.patchValue({
      nombre: tour.nombre,
      descripcion: tour.descripcion,
      duracionHoras: tour.duracionHoras,
      dificultad: tour.dificultad,
      edadMinima: tour.edadMinima,
      precioPersona: tour.precioPersona,
      idCategoria: tour.idCategoria,
      idPrestador: tour.idPrestador
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.editandoId = null;
  }

  guardar(): void {
    if (this.tourForm.invalid) return;

    this.guardando = true;
    const val = this.tourForm.value;
    const req: CrearTourRequest = {
      nombre: val.nombre!,
      descripcion: val.descripcion || '',
      duracionHoras: Number(val.duracionHoras),
      dificultad: val.dificultad as Dificultad,
      edadMinima: Number(val.edadMinima),
      precioPersona: Number(val.precioPersona),
      idCategoria: Number(val.idCategoria),
      idPrestador: Number(val.idPrestador)
    };

    if (this.editandoId) {
      this.toursService.actualizar(this.editandoId, req).subscribe({
        next: () => {
          this.guardando = false;
          this.cerrarModal();
          this.cargarDatos();
        },
        error: (err) => {
          this.guardando = false;
          alert(err.error?.mensaje || 'Error al actualizar tour');
        }
      });
    } else {
      this.toursService.crear(req).subscribe({
        next: () => {
          this.guardando = false;
          this.cerrarModal();
          this.cargarDatos();
        },
        error: (err) => {
          this.guardando = false;
          alert(err.error?.mensaje || 'Error al crear tour');
        }
      });
    }
  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de eliminar este tour?')) {
      this.toursService.eliminar(id).subscribe({
        next: () => { this.cargarDatos(); },
        error: (err) => { alert(err.error?.mensaje || 'No se puede eliminar el tour porque tiene salidas asociadas'); }
      });
    }
  }
}
