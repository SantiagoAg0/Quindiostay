import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="brand">
        <div class="logo-icon">🌿</div>
        <div class="brand-text">
          <span class="brand-title">QuindíoStay</span>
          <span class="brand-subtitle">Tours & Guianza</span>
        </div>
      </div>

      <nav class="nav">
        <a routerLink="/salidas" routerLinkActive="active" class="nav-item">
          <span class="icon">📅</span>
          <span>Salidas de tour</span>
        </a>
        <a routerLink="/reportes" routerLinkActive="active" class="nav-item">
          <span class="icon">📊</span>
          <span>Reportes</span>
        </a>
        <div class="nav-divider"></div>
        <a routerLink="/tours" routerLinkActive="active" class="nav-item dim">
          <span class="icon">🏔️</span>
          <span>Tours</span>
        </a>
        <a routerLink="/guias" routerLinkActive="active" class="nav-item dim">
          <span class="icon">🧭</span>
          <span>Guías</span>
        </a>
        <a routerLink="/reservas" routerLinkActive="active" class="nav-item dim">
          <span class="icon">🎫</span>
          <span>Reservas</span>
        </a>
        <a routerLink="/pagos" routerLinkActive="active" class="nav-item dim">
          <span class="icon">💳</span>
          <span>Pagos</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="badge">Entrega 2 · Bases I</div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      height: 100vh;
      background: var(--ink);
      color: var(--white);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      border-right: 1px solid #1F2937;
    }
    .brand {
      padding: 24px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      .logo-icon { font-size: 1.5rem; }
      .brand-title { display: block; font-weight: 700; font-size: 1.125rem; letter-spacing: -0.02em; }
      .brand-subtitle { display: block; font-size: 0.75rem; color: #9CA3AF; }
    }
    .nav {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      color: #9CA3AF;
      text-decoration: none;
      font-size: 0.9375rem;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.2s ease;
      .icon { font-size: 1.125rem; }
      &:hover { color: var(--white); background: rgba(255, 255, 255, 0.05); }
      &.active {
        background: var(--green);
        color: var(--white);
        font-weight: 600;
      }
      &.dim { opacity: 0.7; }
    }
    .nav-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
      margin: 10px 4px;
    }
    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      .badge {
        font-size: 0.75rem;
        color: var(--leaf);
        background: rgba(71, 176, 108, 0.1);
        padding: 4px 8px;
        border-radius: 6px;
        display: inline-block;
      }
    }
  `]
})
export class SidebarComponent {}
