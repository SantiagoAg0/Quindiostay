import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <div class="region-badge">
          <app-icon name="map-pin" [size]="14"></app-icon>
          <span>Corazón del Eje Cafetero · Quindío</span>
        </div>
      </div>

      <div class="topbar-right">
        <!-- Notificaciones rápidas -->
        <a routerLink="/notificaciones" class="icon-action-btn" title="Ver Notificaciones">
          <app-icon name="bell" [size]="18"></app-icon>
        </a>

        <!-- Información de Usuario -->
        <div class="user-info" *ngIf="authService.usuarioActual() as user">
          <div class="avatar">{{ iniciales(user.nombre) }}</div>
          <div class="details">
            <span class="name">{{ user.nombre }}</span>
            <span class="role-pill" [ngClass]="colorRol(user.rol)">{{ formatoRol(user.rol) }}</span>
          </div>
        </div>

        <!-- Botón Salir con Icono SVG Profesional -->
        <button class="btn-logout" (click)="authService.logout()" title="Cerrar sesión">
          <app-icon name="log-out" [size]="16"></app-icon>
          <span>Salir</span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: 68px;
      background: #ffffff;
      border-bottom: 1px solid rgba(16, 185, 129, 0.12);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      position: sticky;
      top: 0;
      z-index: 15;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }

    .region-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #064E3B;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      padding: 5px 14px;
      border-radius: 9999px;
      letter-spacing: -0.01em;

      app-icon {
        color: #10B981;
      }
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .icon-action-btn {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: rgba(16, 185, 129, 0.06);
      border: 1px solid rgba(16, 185, 129, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0B2D1F;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;

      &:hover {
        background: rgba(16, 185, 129, 0.15);
        color: #10B981;
        transform: translateY(-1px);
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .avatar {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        background: linear-gradient(135deg, #0B2D1F 0%, #10B981 100%);
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-weight: 700;
        font-size: 0.875rem;
        box-shadow: 0 4px 10px rgba(11, 45, 31, 0.2);
      }

      .details {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .name {
          font-size: 0.875rem;
          font-weight: 700;
          color: #071911;
          letter-spacing: -0.01em;
        }

        .role-pill {
          display: inline-block;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 8px;
          border-radius: 4px;

          &.role-admin {
            background: rgba(16, 185, 129, 0.15);
            color: #065F46;
          }
          &.role-operador {
            background: rgba(59, 130, 246, 0.15);
            color: #1E40AF;
          }
          &.role-encargado {
            background: rgba(245, 158, 11, 0.15);
            color: #92400E;
          }
          &.role-cliente {
            background: rgba(139, 92, 246, 0.15);
            color: #5B21B6;
          }
        }
      }
    }

    .btn-logout {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 10px;
      padding: 7px 14px;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #DC2626;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: #FEF2F2;
        border-color: #EF4444;
        transform: translateY(-1px);
        box-shadow: 0 3px 10px rgba(239, 68, 68, 0.15);
      }
    }
  `]
})
export class TopbarComponent {
  authService = inject(AuthService);

  iniciales(nombre: string): string {
    if (!nombre) return 'QS';
    return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  formatoRol(rol: string): string {
    switch (rol) {
      case 'ADMINISTRADOR_PLATAFORMA': return 'Administrador';
      case 'OPERADOR': return 'Operador';
      case 'ENCARGADO_PRESTADOR': return 'Encargado';
      case 'CLIENTE': return 'Cliente';
      default: return rol || 'Usuario';
    }
  }

  colorRol(rol: string): string {
    switch (rol) {
      case 'ADMINISTRADOR_PLATAFORMA': return 'role-admin';
      case 'OPERADOR': return 'role-operador';
      case 'ENCARGADO_PRESTADOR': return 'role-encargado';
      case 'CLIENTE': return 'role-cliente';
      default: return '';
    }
  }
}
