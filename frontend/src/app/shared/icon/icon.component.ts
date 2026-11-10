import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="icon-wrapper" [ngClass]="customClass" [style.width.px]="size" [style.height.px]="size">
      <svg
        [attr.width]="size"
        [attr.height]="size"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        [ngSwitch]="name">

        <!-- Compass / Tours -->
        <g *ngSwitchCase="'compass'">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
        </g>

        <!-- Calendar / Salidas -->
        <g *ngSwitchCase="'calendar'">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </g>

        <!-- Users / Clientes -->
        <g *ngSwitchCase="'users'">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </g>

        <!-- User / Guia / Perfil -->
        <g *ngSwitchCase="'user'">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </g>

        <!-- Ticket / Reservas -->
        <g *ngSwitchCase="'ticket'">
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
          <path d="M13 5v2"></path>
          <path d="M13 17v2"></path>
          <path d="M13 11v2"></path>
        </g>

        <!-- Credit Card / Pagos -->
        <g *ngSwitchCase="'credit-card'">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </g>

        <!-- Chart / Reportes -->
        <g *ngSwitchCase="'chart'">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </g>

        <!-- Building / Prestadores -->
        <g *ngSwitchCase="'building'">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
          <line x1="9" y1="22" x2="9" y2="2"></line>
          <line x1="15" y1="22" x2="15" y2="2"></line>
          <line x1="4" y1="7" x2="20" y2="7"></line>
          <line x1="4" y1="12" x2="20" y2="12"></line>
          <line x1="4" y1="17" x2="20" y2="17"></line>
        </g>

        <!-- Layers / Planes -->
        <g *ngSwitchCase="'layers'">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </g>

        <!-- Bell / Notificaciones -->
        <g *ngSwitchCase="'bell'">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </g>

        <!-- Shield / Seguridad / Usuarios -->
        <g *ngSwitchCase="'shield'">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </g>

        <!-- Mountain / Naturaleza -->
        <g *ngSwitchCase="'mountain'">
          <path d="m8 3 4 8 5-5 5 15H2L8 3z"></path>
        </g>

        <!-- Leaf / Eco -->
        <g *ngSwitchCase="'leaf'">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
        </g>

        <!-- Plus -->
        <g *ngSwitchCase="'plus'">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </g>

        <!-- Search -->
        <g *ngSwitchCase="'search'">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </g>

        <!-- Check -->
        <g *ngSwitchCase="'check'">
          <polyline points="20 6 9 17 4 12"></polyline>
        </g>

        <!-- Alert -->
        <g *ngSwitchCase="'alert'">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </g>

        <!-- X / Close -->
        <g *ngSwitchCase="'x'">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </g>

        <!-- Edit -->
        <g *ngSwitchCase="'edit'">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </g>

        <!-- Trash -->
        <g *ngSwitchCase="'trash'">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </g>

        <!-- Download -->
        <g *ngSwitchCase="'download'">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </g>

        <!-- Log out -->
        <g *ngSwitchCase="'log-out'">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </g>

        <!-- Log in -->
        <g *ngSwitchCase="'log-in'">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <polyline points="10 17 15 12 10 7"></polyline>
          <line x1="15" y1="12" x2="3" y2="12"></line>
        </g>

        <!-- Filter -->
        <g *ngSwitchCase="'filter'">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </g>

        <!-- Eye -->
        <g *ngSwitchCase="'eye'">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </g>

        <!-- Map pin -->
        <g *ngSwitchCase="'map-pin'">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </g>

        <!-- Clock -->
        <g *ngSwitchCase="'clock'">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </g>

        <!-- Globe -->
        <g *ngSwitchCase="'globe'">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </g>

        <!-- Refresh -->
        <g *ngSwitchCase="'refresh'">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </g>

        <!-- Chevron right -->
        <g *ngSwitchCase="'chevron-right'">
          <polyline points="9 18 15 12 9 6"></polyline>
        </g>

        <!-- Chevron down -->
        <g *ngSwitchCase="'chevron-down'">
          <polyline points="6 9 12 15 18 9"></polyline>
        </g>

        <!-- Dollar Sign -->
        <g *ngSwitchCase="'dollar-sign'">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </g>

        <!-- Ban / Slash -->
        <g *ngSwitchCase="'ban'">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
        </g>

        <!-- File Text -->
        <g *ngSwitchCase="'file-text'">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </g>

        <!-- Lock -->
        <g *ngSwitchCase="'lock'">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </g>

        <!-- Unlock -->
        <g *ngSwitchCase="'unlock'">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
        </g>

        <!-- Sparkles / Star -->
        <g *ngSwitchCase="'sparkles'">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </g>

        <!-- Phone -->
        <g *ngSwitchCase="'phone'">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </g>

        <!-- Mail -->
        <g *ngSwitchCase="'mail'">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </g>

        <!-- Default: circle -->
        <g *ngSwitchDefault>
          <circle cx="12" cy="12" r="8"></circle>
        </g>
      </svg>
    </span>
  `,
  styles: [`
    .icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      flex-shrink: 0;
    }
    svg {
      display: block;
    }
  `]
})
export class IconComponent {
  @Input() name = 'compass';
  @Input() size = 18;
  @Input() customClass = '';
}
