import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <aside class="sidebar">
      <!-- Encabezado de Marca Glassmorphic con Logo SVG -->
      <div class="brand">
        <div class="logo-badge">
          <app-icon name="mountain" [size]="20" customClass="text-emerald"></app-icon>
        </div>
        <div class="brand-text">
          <span class="brand-title">QuindíoStay</span>
          <span class="brand-subtitle">Tours & Guianza</span>
        </div>
      </div>

      <!-- Menú de Navegación con Iconos SVG Limpios (Zero Emojis) -->
      <nav class="nav">
        <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
          <app-icon name="sparkles" [size]="18"></app-icon>
          <span>Panel Principal</span>
        </a>

        <!-- Operación Turística (Salidas, Tours, Guías) -->
        <ng-container *ngIf="!authService.esCliente()">
          <div class="nav-section-label">Operación Turística</div>

          <a routerLink="/salidas" routerLinkActive="active" class="nav-item">
            <app-icon name="calendar" [size]="18"></app-icon>
            <span>Salidas de Tour</span>
          </a>

          <a routerLink="/tours" routerLinkActive="active" class="nav-item">
            <app-icon name="compass" [size]="18"></app-icon>
            <span>Catálogo de Tours</span>
          </a>

          <a routerLink="/guias" routerLinkActive="active" class="nav-item">
            <app-icon name="user" [size]="18"></app-icon>
            <span>Guías Turísticos</span>
          </a>
        </ng-container>

        <!-- Para Clientes: Explorar Tours y Salidas -->
        <ng-container *ngIf="authService.esCliente()">
          <div class="nav-section-label">Explorar & Tours</div>

          <a routerLink="/tours" routerLinkActive="active" class="nav-item">
            <app-icon name="compass" [size]="18"></app-icon>
            <span>Catálogo de Tours</span>
          </a>

          <a routerLink="/salidas" routerLinkActive="active" class="nav-item">
            <app-icon name="calendar" [size]="18"></app-icon>
            <span>Salidas Disponibles</span>
          </a>
        </ng-container>

        <!-- Ventas & Cartera para Personal Interno -->
        <ng-container *ngIf="!authService.esCliente()">
          <div class="nav-section-label">Ventas & Cartera</div>

          <a routerLink="/reservas" routerLinkActive="active" class="nav-item">
            <app-icon name="ticket" [size]="18"></app-icon>
            <span>Reservas</span>
          </a>

          <a routerLink="/pagos" routerLinkActive="active" class="nav-item">
            <app-icon name="credit-card" [size]="18"></app-icon>
            <span>Pagos & Cartera</span>
          </a>

          <a routerLink="/notificaciones" routerLinkActive="active" class="nav-item">
            <app-icon name="bell" [size]="18"></app-icon>
            <span>Notificaciones</span>
          </a>
        </ng-container>

        <!-- Mis Viajes para Cliente -->
        <ng-container *ngIf="authService.esCliente()">
          <div class="nav-section-label">Mis Viajes</div>

          <a routerLink="/reservas" routerLinkActive="active" class="nav-item">
            <app-icon name="ticket" [size]="18"></app-icon>
            <span>Mis Reservas</span>
          </a>

          <a routerLink="/pagos" routerLinkActive="active" class="nav-item">
            <app-icon name="credit-card" [size]="18"></app-icon>
            <span>Mis Pagos</span>
          </a>

          <a routerLink="/notificaciones" routerLinkActive="active" class="nav-item">
            <app-icon name="bell" [size]="18"></app-icon>
            <span>Mis Notificaciones</span>
          </a>

          <a routerLink="/clientes" routerLinkActive="active" class="nav-item">
            <app-icon name="user" [size]="18"></app-icon>
            <span>Mi Perfil & Preferencias</span>
          </a>
        </ng-container>

        <!-- Secciones Administrativas (Exclusivo Administrador y Encargado) -->
        <ng-container *ngIf="authService.esAdmin() || authService.esEncargado()">
          <div class="nav-section-label">Administración</div>

          <a routerLink="/prestadores" routerLinkActive="active" class="nav-item">
            <app-icon name="building" [size]="18"></app-icon>
            <span>Prestadores</span>
          </a>

          <a routerLink="/planes" routerLinkActive="active" class="nav-item">
            <app-icon name="layers" [size]="18"></app-icon>
            <span>Planes de Servicio</span>
          </a>
        </ng-container>

        <!-- Directorio de Clientes (Solo para Personal Operativo / Admin) -->
        <ng-container *ngIf="authService.esAdmin() || authService.esOperador()">
          <a routerLink="/clientes" routerLinkActive="active" class="nav-item">
            <app-icon name="users" [size]="18"></app-icon>
            <span>Directorio de Clientes</span>
          </a>
        </ng-container>

        <!-- Usuarios del Sistema (Solo Administrador de Plataforma) -->
        <ng-container *ngIf="authService.esAdmin()">
          <a routerLink="/usuarios" routerLinkActive="active" class="nav-item">
            <app-icon name="shield" [size]="18"></app-icon>
            <span>Usuarios Internos</span>
          </a>
        </ng-container>

        <!-- Reportes y Estadísticas (Personal Administrativo y Operativo) -->
        <ng-container *ngIf="!authService.esCliente()">
          <div class="nav-section-label">Inteligencia de Negocio</div>

          <a routerLink="/reportes" routerLinkActive="active" class="nav-item">
            <app-icon name="chart" [size]="18"></app-icon>
            <span>Reportes & Estadísticas</span>
          </a>
        </ng-container>
      </nav>

      <!-- Pie del Sidebar con Badge de Estado de Sesión -->
      <div class="sidebar-footer">
        <div class="user-role-badge">
          <span class="role-indicator"></span>
          <span class="role-text">{{ authService.rol() || 'Invitado' }}</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: linear-gradient(180deg, #142B20 0%, #1E4D36 45%, #163827 100%);
      color: #E5E7EB;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 4px 0 25px rgba(0, 0, 0, 0.35);
      z-index: 20;
    }

    .brand {
      padding: 24px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);

      .logo-badge {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
        color: #10B981;
      }

      .brand-title {
        display: block;
        font-family: var(--font-brand, 'Caveat', cursive);
        font-weight: 700;
        font-size: 1.75rem;
        letter-spacing: -0.01em;
        color: #FFFFFF;
        line-height: 1;
      }

      .brand-subtitle {
        display: block;
        font-size: 0.75rem;
        color: #34D399;
        font-weight: 500;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }
    }

    .nav {
      flex: 1;
      padding: 18px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 4px;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.12);
        border-radius: 2px;
      }
    }

    .nav-section-label {
      font-size: 0.6875rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.4);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 12px 14px 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      color: #9CA3AF;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 10px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      app-icon {
        color: #9CA3AF;
        transition: color 0.2s;
      }

      &:hover {
        color: #FFFFFF;
        background: rgba(255, 255, 255, 0.06);
        transform: translateX(3px);

        app-icon {
          color: #34D399;
        }
      }

      &.active {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.15) 100%);
        border: 1px solid rgba(16, 185, 129, 0.35);
        color: #FFFFFF;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.15);

        app-icon {
          color: #34D399;
        }
      }
    }

    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.15);

      .user-role-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;

        .role-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 8px #10B981;
        }

        .role-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: #D1D5DB;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
      }
    }
  `]
})
export class SidebarComponent {
  authService = inject(AuthService);
}
