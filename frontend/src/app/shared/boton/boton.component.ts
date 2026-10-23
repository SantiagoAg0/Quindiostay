import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [type]="type" class="btn" [ngClass]="variant" [disabled]="disabled" (click)="click.emit($event)">
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 0.9375rem;
      font-weight: 600;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;

      &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      &.primary {
        background: var(--green);
        color: var(--white);
        &:hover:not(:disabled) { background: #156637; }
      }
      &.secondary {
        background: var(--white);
        border-color: var(--line);
        color: var(--ink);
        &:hover:not(:disabled) { background: var(--mist); }
      }
      &.danger {
        background: #FEE2E2;
        color: #DC2626;
        &:hover:not(:disabled) { background: #FECACA; }
      }
      &.dark {
        background: var(--ink);
        color: var(--white);
        &:hover:not(:disabled) { background: #262626; }
      }
    }
  `]
})
export class BotonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'dark' = 'primary';
  @Input() disabled = false;
  @Output() click = new EventEmitter<MouseEvent>();
}
