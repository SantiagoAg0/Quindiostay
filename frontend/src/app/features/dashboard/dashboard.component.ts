import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ToursService } from '../tours/tours.service';
import { SalidasService } from '../salidas/salidas.service';
import { ReservasService } from '../reservas/reservas.service';
import { ReportesService } from '../reportes/reportes.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { PillEstadoComponent } from '../../shared/pill-estado/pill-estado.component';
import { BarraOcupacionComponent } from '../../shared/barra-ocupacion/barra-ocupacion.component';
import { SalidaTour } from '../../core/models/salida-tour.model';
import { ReservaDetalleDto } from '../../core/models/reserva.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IconComponent,
    PillEstadoComponent,
    BarraOcupacionComponent
  ],
  template: `
    <div class="dashboard-page animate-fade-in">
      <!-- Hero Welcome Banner -->
      <section class="hero-banner">
        <div class="hero-content">
          <div class="hero-badge">
            <app-icon name="sparkles" [size]="14"></app-icon>
            <span>Plataforma Turística Oficial del Quindío</span>
          </div>
          <h1 class="hero-title">
            {{ authService.esCliente() ? 'Bienvenido a tus Experiencias,' : 'Panel de Operaciones,' }} <span class="highlight">{{ nombreUsuario }}</span>
          </h1>
          <p class="hero-subtitle">
            {{ authService.esCliente() ? 'Explora los mejores tours del Quindío, consulta tus reservas activas y gestiona tus itinerarios de viaje.' : 'Monitorea en tiempo real la ocupación de salidas, reservas, pagos y rendimiento de prestadores en el Paisaje Cultural Cafetero.' }}
          </p>
        </div>
        <div class="hero-actions">
          <a *ngIf="!authService.esCliente()" routerLink="/salidas" class="action-btn primary">
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Programar Salida</span>
          </a>
          <a *ngIf="authService.esCliente()" routerLink="/tours" class="action-btn primary">
            <app-icon name="compass" [size]="16"></app-icon>
            <span>Explorar Tours</span>
          </a>
          <a routerLink="/reservas" class="action-btn secondary">
            <app-icon name="ticket" [size]="16"></app-icon>
            <span>{{ authService.esCliente() ? 'Mis Reservas' : 'Nueva Reserva' }}</span>
          </a>
        </div>
      </section>

      <!-- KPI Cards Row -->
      <section class="kpi-grid">
        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-label">Tours en Catálogo</span>
            <div class="kpi-icon-wrap emerald">
              <app-icon name="compass" [size]="20"></app-icon>
            </div>
          </div>
          <div class="kpi-body">
            <div class="kpi-value">{{ totalTours }}</div>
            <div class="kpi-trend positive">
              <app-icon name="check" [size]="14"></app-icon>
              <span>100% operativos</span>
            </div>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-label">Salidas Programadas</span>
            <div class="kpi-icon-wrap teal">
              <app-icon name="calendar" [size]="20"></app-icon>
            </div>
          </div>
          <div class="kpi-body">
            <div class="kpi-value">{{ proximasSalidas.length }}</div>
            <div class="kpi-trend neutral">
              <app-icon name="clock" [size]="14"></app-icon>
              <span>Próximos días</span>
            </div>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-label">Reservas Registradas</span>
            <div class="kpi-icon-wrap amber">
              <app-icon name="ticket" [size]="20"></app-icon>
            </div>
          </div>
          <div class="kpi-body">
            <div class="kpi-value">{{ totalReservas }}</div>
            <div class="kpi-trend positive">
              <app-icon name="users" [size]="14"></app-icon>
              <span>Viajeros activos</span>
            </div>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <span class="kpi-label">Recaudo Estimado</span>
            <div class="kpi-icon-wrap violet">
              <app-icon name="dollar-sign" [size]="20"></app-icon>
            </div>
          </div>
          <div class="kpi-body">
            <div class="kpi-value">$ {{ totalRecaudado | number }}</div>
            <div class="kpi-trend positive">
              <app-icon name="credit-card" [size]="14"></app-icon>
              <span>Confirmado</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Operational Split -->
      <div class="dashboard-split">
        <!-- Upcoming Salidas Column -->
        <section class="split-col glass-card">
          <div class="section-header">
            <div>
              <h2 class="section-title">Próximas Salidas</h2>
              <p class="section-subtitle">Monitoreo de aforo y cupos en tiempo real</p>
            </div>
            <a routerLink="/salidas" class="view-all-link">
              <span>Ver todas</span>
              <app-icon name="chevron-right" [size]="14"></app-icon>
            </a>
          </div>

          <div *ngIf="cargandoSalidas" class="loading-state">
            <div class="spinner"></div>
            <span>Cargando salidas próximas...</span>
          </div>

          <div *ngIf="!cargandoSalidas && !proximasSalidas.length" class="empty-state">
            <app-icon name="calendar" [size]="32"></app-icon>
            <p>No hay salidas programadas para los próximos días.</p>
          </div>

          <div *ngIf="!cargandoSalidas && proximasSalidas.length" class="salidas-list">
            <div *ngFor="let s of proximasSalidas.slice(0, 5)" class="salida-item">
              <div class="salida-main">
                <div class="salida-title-row">
                  <span class="salida-tour">{{ s.tour.nombre }}</span>
                  <app-pill-estado [estado]="s.estado"></app-pill-estado>
                </div>
                <div class="salida-meta">
                  <span class="meta-item">
                    <app-icon name="calendar" [size]="13"></app-icon>
                    {{ s.fecha }}
                  </span>
                  <span class="meta-item">
                    <app-icon name="clock" [size]="13"></app-icon>
                    {{ s.horaInicio.substring(0, 5) }}
                  </span>
                  <span class="meta-item">
                    <app-icon name="user" [size]="13"></app-icon>
                    {{ s.guia.nombre }}
                  </span>
                  <span class="idioma-tag">{{ s.idioma.nombre }}</span>
                </div>
              </div>
              <div class="salida-cupos">
                <app-barra-ocupacion
                  [cuposOcupados]="s.cuposOcupados"
                  [totalCupos]="s.cupo">
                </app-barra-ocupacion>
              </div>
            </div>
          </div>
        </section>

        <!-- Recent Reservations Column -->
        <section class="split-col glass-card">
          <div class="section-header">
            <div>
              <h2 class="section-title">Últimas Reservas</h2>
              <p class="section-subtitle">Flujo de reservas y transacciones recientes</p>
            </div>
            <a routerLink="/reservas" class="view-all-link">
              <span>Ver todas</span>
              <app-icon name="chevron-right" [size]="14"></app-icon>
            </a>
          </div>

          <div *ngIf="cargandoReservas" class="loading-state">
            <div class="spinner"></div>
            <span>Cargando reservas...</span>
          </div>

          <div *ngIf="!cargandoReservas && !ultimasReservas.length" class="empty-state">
            <app-icon name="ticket" [size]="32"></app-icon>
            <p>No se registran reservas recientes.</p>
          </div>

          <div *ngIf="!cargandoReservas && ultimasReservas.length" class="reservas-list">
            <div *ngFor="let r of ultimasReservas.slice(0, 5)" class="reserva-item">
              <div class="reserva-avatar">
                <app-icon name="user" [size]="18"></app-icon>
              </div>
              <div class="reserva-details">
                <div class="reserva-top">
                  <span class="reserva-cliente">{{ r.clienteNombreCompleto }}</span>
                  <span class="reserva-total">$ {{ r.valorTotal | number }}</span>
                </div>
                <div class="reserva-sub">
                  <span class="reserva-tour">{{ r.tourNombre }}</span>
                  <span class="reserva-pax">· {{ r.participantes.length }} pax</span>
                </div>
              </div>
              <div class="reserva-status">
                <app-pill-estado [estado]="r.estado"></app-pill-estado>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Hero Banner */
    .hero-banner {
      background: linear-gradient(135deg, rgba(11, 45, 31, 0.95) 0%, rgba(15, 61, 42, 0.85) 100%);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 20px;
      padding: 32px 36px;
      color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      box-shadow: 0 16px 36px -12px rgba(11, 45, 31, 0.25);
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        right: -60px;
        top: -60px;
        width: 240px;
        height: 240px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
      }
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .hero-title {
      font-family: var(--font-heading);
      font-size: 1.875rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0 0 8px;
      line-height: 1.2;

      .highlight {
        background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .hero-subtitle {
      color: rgba(255, 255, 255, 0.75);
      font-size: 0.9375rem;
      max-width: 620px;
      margin: 0;
      line-height: 1.5;
    }

    .hero-actions {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;

      &.primary {
        background: #10b981;
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);

        &:hover {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.45);
        }
      }

      &.secondary {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.2);

        &:hover {
          background: rgba(255, 255, 255, 0.18);
          transform: translateY(-2px);
        }
      }
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .kpi-card {
      padding: 22px;
      border-radius: 18px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.08);
      }
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .kpi-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-ink-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .kpi-icon-wrap {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.emerald { background: rgba(16, 185, 129, 0.12); color: #10b981; }
      &.teal { background: rgba(20, 184, 166, 0.12); color: #14b8a6; }
      &.amber { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
      &.violet { background: rgba(139, 92, 246, 0.12); color: #8b5cf6; }
    }

    .kpi-value {
      font-family: var(--font-heading);
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--color-ink);
      line-height: 1.1;
      margin-bottom: 6px;
    }

    .kpi-trend {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.75rem;
      font-weight: 600;

      &.positive { color: #059669; }
      &.neutral { color: var(--color-ink-muted); }
    }

    /* Split Operational Layout */
    .dashboard-split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .split-col {
      padding: 24px;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--color-border);
    }

    .section-title {
      font-family: var(--font-heading);
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0 0 4px;
    }

    .section-subtitle {
      font-size: 0.8125rem;
      color: var(--color-ink-muted);
      margin: 0;
    }

    .view-all-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-primary);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    /* Salidas List */
    .salidas-list, .reservas-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .salida-item {
      padding: 14px 16px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.6);
      border: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      transition: all 0.2s ease;

      &:hover {
        background: #ffffff;
        border-color: rgba(16, 185, 129, 0.3);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
      }
    }

    .salida-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .salida-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .salida-tour {
      font-weight: 700;
      font-size: 0.9375rem;
      color: var(--color-ink);
    }

    .salida-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.75rem;
      color: var(--color-ink-muted);
      flex-wrap: wrap;
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .idioma-tag {
      padding: 2px 8px;
      background: rgba(11, 45, 31, 0.06);
      border-radius: 6px;
      font-weight: 600;
      color: var(--color-primary-dark);
    }

    .salida-cupos {
      width: 110px;
      flex-shrink: 0;
    }

    /* Reservas List */
    .reserva-item {
      padding: 12px 14px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.6);
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s ease;

      &:hover {
        background: #ffffff;
        border-color: rgba(16, 185, 129, 0.3);
      }
    }

    .reserva-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .reserva-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .reserva-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .reserva-cliente {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--color-ink);
    }

    .reserva-total {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--color-primary-dark);
    }

    .reserva-sub {
      font-size: 0.75rem;
      color: var(--color-ink-muted);
    }

    .loading-state, .empty-state {
      padding: 36px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--color-ink-muted);
      font-size: 0.875rem;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(16, 185, 129, 0.2);
      border-top-color: #10b981;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 1024px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .dashboard-split { grid-template-columns: 1fr; }
      .hero-banner { flex-direction: column; align-items: flex-start; }
    }

    @media (max-width: 640px) {
      .kpi-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private toursService = inject(ToursService);
  private salidasService = inject(SalidasService);
  private reservasService = inject(ReservasService);

  totalTours = 0;
  totalReservas = 0;
  totalRecaudado = 0;
  proximasSalidas: SalidaTour[] = [];
  ultimasReservas: ReservaDetalleDto[] = [];
  cargandoSalidas = true;
  cargandoReservas = true;

  get nombreUsuario(): string {
    const u = this.authService.usuarioActual();
    return u?.nombre || 'Operador';
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Tours
    this.toursService.listar().subscribe({
      next: (t) => {
        this.totalTours = t.length;
      },
      error: () => {}
    });

    // Salidas
    this.salidasService.listar({ size: 10, sort: 'fecha,asc' }).subscribe({
      next: (page) => {
        this.proximasSalidas = page.contenido || [];
        this.cargandoSalidas = false;
      },
      error: () => {
        this.cargandoSalidas = false;
      }
    });

    // Reservas
    this.reservasService.listar().subscribe({
      next: (reservas) => {
        this.ultimasReservas = reservas || [];
        this.totalReservas = reservas.length;
        this.totalRecaudado = reservas.reduce((acc, r) => acc + (r.totalPagado || 0), 0);
        this.cargandoReservas = false;
      },
      error: () => {
        this.cargandoReservas = false;
      }
    });
  }
}
