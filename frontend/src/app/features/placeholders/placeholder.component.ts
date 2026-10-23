import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder-page">
      <div class="card">
        <span class="icon">🚧</span>
        <h2>Módulo en construcción</h2>
        <p>Esta sección formará parte de la <strong>Entrega 3</strong> del proyecto de Bases de Datos I.</p>
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
      background: var(--white);
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 48px;
      text-align: center;
      max-width: 480px;
      .icon { font-size: 3rem; margin-bottom: 16px; display: block; }
      h2 { color: var(--ink); margin: 0 0 10px; }
      p { color: var(--mute); margin: 0; line-height: 1.5; }
    }
  `]
})
export class PlaceholderComponent {}
