import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <span class="region-pill">Valle del Cocora · Quindío</span>
      </div>
      <div class="topbar-right">
        <div class="user-info" *ngIf="authService.usuarioActual() as user">
          <div class="avatar">{{ iniciales(user.nombre) }}</div>
          <div class="details">
            <span class="name">{{ user.nombre }}</span>
            <span class="role">{{ formatoRol(user.rol) }}</span>
          </div>
        </div>
        <button class="btn-logout" (click)="authService.logout()" title="Cerrar sesión">
          Salir ↪
        </button>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: 64px;
      background: var(--white);
      border-bottom: 1px solid var(--line);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .region-pill {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--pine);
      background: var(--mint);
      padding: 4px 12px;
      border-radius: 999px;
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--forest);
        color: var(--leaf);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.875rem;
      }
      .details {
        display: flex;
        flex-direction: column;
        .name { font-size: 0.875rem; font-weight: 600; color: var(--ink); }
        .role { font-size: 0.75rem; color: var(--mute); }
      }
    }
    .btn-logout {
      background: none;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--mute);
      cursor: pointer;
      transition: all 0.2s;
      &:hover { color: #DC2626; border-color: #FCA5A5; background: #FEF2F2; }
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
      default: return rol;
    }
  }
}
