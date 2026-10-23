import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-campo-formulario',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="campo-wrapper">
      <label *ngIf="label" class="campo-label">
        {{ label }} <span *ngIf="required" class="req">*</span>
      </label>
      <ng-content></ng-content>
      <span *ngIf="error" class="campo-error">{{ error }}</span>
    </div>
  `,
  styles: [`
    .campo-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;
      .campo-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--ink);
        .req { color: #DC2626; }
      }
      .campo-error {
        font-size: 0.8125rem;
        color: #DC2626;
        font-weight: 500;
      }
    }
  `]
})
export class CampoFormularioComponent {
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() error: string | null = null;
}
