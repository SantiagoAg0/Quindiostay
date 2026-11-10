import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="placeholder-page">
      <div class="card">
        <div class="icon-wrap" style="color: #10b981;">
          <app-icon name="shield" [size]="48"></app-icon>
        </div>
        <h2>Módulo en construcción</h2>
        <p>Esta sección formará parte de la plataforma QuindíoStay de Bases de Datos I.</p>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-page {
      display: flex;
      justify-content: center;
      padding: 60px 20px;
    }
    .card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(11, 45, 31, 0.1);
      border-radius: 20px;
      padding: 48px;
      text-align: center;
      max-width: 480px;
      box-shadow: 0 10px 30px rgba(11, 45, 31, 0.08);
      .icon-wrap { margin-bottom: 20px; display: inline-flex; }
      h2 { color: #0B2D1F; margin: 0 0 10px; font-family: var(--font-heading); font-size: 1.5rem; }
      p { color: #64748b; margin: 0; line-height: 1.6; }
    }
  `]
})
export class PlaceholderComponent {}
