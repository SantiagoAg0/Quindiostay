import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-wrapper">
      <!-- Panel Izquierdo: Verde Oscuro / Palmas de Cera -->
      <div class="brand-panel">
        <div class="brand-header">
          <span class="brand-logo">🌿</span>
          <span class="brand-name">QuindíoStay</span>
        </div>

        <div class="brand-illustration">
          <!-- Ilustración SVG: Palmas de Cera del Valle del Cocora -->
          <svg viewBox="0 0 400 320" class="palm-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="200" cy="300" rx="190" ry="40" fill="#12432A" opacity="0.6"/>
            <!-- Montañas de fondo -->
            <path d="M20 280 Q 120 180 220 280" fill="#12432A" opacity="0.3"/>
            <path d="M160 280 Q 280 160 380 280" fill="#12432A" opacity="0.4"/>
            <!-- Palma Izquierda -->
            <path d="M110 280 Q 112 180 114 90" stroke="#47B06C" stroke-width="4" stroke-linecap="round"/>
            <circle cx="114" cy="85" r="5" fill="#47B06C"/>
            <path d="M114 85 Q 90 60 70 75" stroke="#47B06C" stroke-width="2.5" fill="none"/>
            <path d="M114 85 Q 85 80 65 95" stroke="#47B06C" stroke-width="2.5" fill="none"/>
            <path d="M114 85 Q 110 50 114 40" stroke="#47B06C" stroke-width="2.5" fill="none"/>
            <path d="M114 85 Q 135 60 155 70" stroke="#47B06C" stroke-width="2.5" fill="none"/>
            <path d="M114 85 Q 140 85 160 100" stroke="#47B06C" stroke-width="2.5" fill="none"/>
            <!-- Palma Central Alta -->
            <path d="M200 285 Q 198 160 200 50" stroke="#D9F1E0" stroke-width="5" stroke-linecap="round"/>
            <circle cx="200" cy="45" r="6" fill="#D9F1E0"/>
            <path d="M200 45 Q 165 20 145 35" stroke="#D9F1E0" stroke-width="3" fill="none"/>
            <path d="M200 45 Q 160 45 135 60" stroke="#D9F1E0" stroke-width="3" fill="none"/>
            <path d="M200 45 Q 200 10 200 0" stroke="#D9F1E0" stroke-width="3" fill="none"/>
            <path d="M200 45 Q 235 20 255 35" stroke="#D9F1E0" stroke-width="3" fill="none"/>
            <path d="M200 45 Q 240 50 265 65" stroke="#D9F1E0" stroke-width="3" fill="none"/>
            <!-- Palma Derecha -->
            <path d="M290 280 Q 288 170 286 110" stroke="#1B7F47" stroke-width="4" stroke-linecap="round"/>
            <circle cx="286" cy="105" r="5" fill="#1B7F47"/>
            <path d="M286 105 Q 265 85 250 95" stroke="#1B7F47" stroke-width="2.5" fill="none"/>
            <path d="M286 105 Q 285 75 286 65" stroke="#1B7F47" stroke-width="2.5" fill="none"/>
            <path d="M286 105 Q 310 85 325 100" stroke="#1B7F47" stroke-width="2.5" fill="none"/>
            <!-- Aves -->
            <path d="M140 120 Q 145 115 150 120 Q 155 115 160 120" stroke="#D9F1E0" stroke-width="1.5" fill="none" opacity="0.6"/>
            <path d="M240 100 Q 244 96 248 100 Q 252 96 256 100" stroke="#D9F1E0" stroke-width="1.5" fill="none" opacity="0.6"/>
          </svg>
        </div>

        <div class="brand-quote">
          <p class="quote-text">"Cada salida, con su cupo y su guía confirmados."</p>
          <span class="quote-author">Turismo y Naturaleza en el Corazón del Eje Cafetero</span>
        </div>
      </div>

      <!-- Panel Derecho: Formulario de Inicio de Sesión -->
      <div class="form-panel">
        <div class="form-card">
          <div class="form-header">
            <h2>Bienvenido a QuindíoStay</h2>
            <p>Ingresa a tu cuenta para gestionar salidas, reservas y guías.</p>
          </div>

          <!-- Selector de tipo de ingreso -->
          <div class="tab-selector">
            <button
              type="button"
              class="tab-btn"
              [class.active]="tipoIngreso === 'PERSONAL'"
              (click)="cambiarTipo('PERSONAL')">
              Personal del sistema
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="tipoIngreso === 'CLIENTE'"
              (click)="cambiarTipo('CLIENTE')">
              Cliente
            </button>
          </div>

          <!-- Alerta de error -->
          <div *ngIf="errorMensaje" class="error-alert">
            <span class="alert-icon">⚠️</span>
            <span>{{ errorMensaje }}</span>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label">
                {{ tipoIngreso === 'PERSONAL' ? 'Usuario del sistema' : 'Correo electrónico' }}
              </label>
              <input
                type="text"
                class="form-input"
                [placeholder]="tipoIngreso === 'PERSONAL' ? 'Ej: admin u operador' : 'cliente@correo.com'"
                formControlName="identificador" />
              <span *ngIf="loginForm.get('identificador')?.touched && loginForm.get('identificador')?.invalid" class="field-error">
                Este campo es obligatorio
              </span>
            </div>

            <div class="form-group">
              <label class="form-label">Contraseña</label>
              <input
                type="password"
                class="form-input"
                placeholder="••••••••"
                formControlName="contrasena" />
              <span *ngIf="loginForm.get('contrasena')?.touched && loginForm.get('contrasena')?.invalid" class="field-error">
                La contraseña es obligatoria
              </span>
            </div>

            <button type="submit" class="submit-btn" [disabled]="loginForm.invalid || cargando">
              <span *ngIf="!cargando">Ingresar</span>
              <span *ngIf="cargando">Iniciando sesión...</span>
            </button>
          </form>

          <div class="form-footer">
            <button type="button" class="btn-link" (click)="crearCuentaCliente()">
              ¿Eres nuevo? Crear cuenta de cliente
            </button>
          </div>

          <!-- Credenciales sugeridas para evaluación -->
          <div class="credentials-hint">
            <span class="hint-title">Credenciales de desarrollo:</span>
            <code>admin / Admin123*</code> · <code>operador / Operador123*</code> · <code>cliente&#64;correo.com / Cliente123*</code>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      min-height: 100vh;
      background: var(--mist);
    }
    .brand-panel {
      flex: 1;
      background: var(--forest);
      color: var(--white);
      padding: 48px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      @media (max-width: 900px) { display: none; }
    }
    .brand-header {
      display: flex;
      align-items: center;
      gap: 12px;
      .brand-logo { font-size: 2rem; }
      .brand-name { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; }
    }
    .brand-illustration {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px 0;
      .palm-svg { max-width: 380px; width: 100%; height: auto; }
    }
    .brand-quote {
      .quote-text {
        font-size: 1.25rem;
        font-weight: 600;
        line-height: 1.4;
        color: var(--mint);
        margin: 0 0 8px;
        letter-spacing: -0.01em;
      }
      .quote-author { font-size: 0.875rem; color: #9CA3AF; }
    }
    .form-panel {
      flex: 1.1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
    }
    .form-card {
      width: 100%;
      max-width: 440px;
      background: var(--white);
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 36px 32px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    }
    .form-header {
      margin-bottom: 24px;
      h2 { font-size: 1.5rem; font-weight: 700; color: var(--ink); margin: 0 0 6px; letter-spacing: -0.02em; }
      p { font-size: 0.875rem; color: var(--mute); margin: 0; }
    }
    .tab-selector {
      display: flex;
      background: var(--mist);
      border-radius: 10px;
      padding: 4px;
      margin-bottom: 20px;
      .tab-btn {
        flex: 1;
        padding: 8px 12px;
        font-size: 0.8125rem;
        font-weight: 600;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--mute);
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
        &.active {
          background: var(--white);
          color: var(--green);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
      }
    }
    .error-alert {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #FEE2E2;
      border: 1px solid #FCA5A5;
      color: #B91C1C;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 0.875rem;
      margin-bottom: 20px;
    }
    .form-group {
      margin-bottom: 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--ink);
    }
    .form-input {
      padding: 10px 14px;
      border: 1px solid var(--line);
      border-radius: 10px;
      font-size: 0.9375rem;
      font-family: inherit;
      color: var(--ink);
      transition: border-color 0.2s, box-shadow 0.2s;
      &:focus {
        outline: none;
        border-color: var(--green);
        box-shadow: 0 0 0 3px rgba(27, 127, 71, 0.12);
      }
    }
    .field-error {
      font-size: 0.75rem;
      color: #DC2626;
      font-weight: 500;
    }
    .submit-btn {
      width: 100%;
      padding: 12px;
      background: var(--green);
      color: var(--white);
      border: none;
      border-radius: 10px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      margin-top: 8px;
      transition: background 0.2s;
      &:hover:not(:disabled) { background: #156637; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .form-footer {
      text-align: center;
      margin-top: 18px;
      .btn-link {
        background: none;
        border: none;
        color: var(--green);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        &:hover { text-decoration: underline; }
      }
    }
    .credentials-hint {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px dashed var(--line);
      font-size: 0.75rem;
      color: var(--mute);
      text-align: center;
      .hint-title { display: block; font-weight: 600; margin-bottom: 4px; color: var(--ink); }
      code {
        background: var(--mist);
        padding: 2px 5px;
        border-radius: 4px;
        font-family: monospace;
        color: var(--pine);
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  tipoIngreso: 'PERSONAL' | 'CLIENTE' = 'PERSONAL';
  errorMensaje: string | null = null;
  cargando = false;

  loginForm = this.fb.group({
    identificador: ['admin', [Validators.required]],
    contrasena: ['Admin123*', [Validators.required]]
  });

  cambiarTipo(tipo: 'PERSONAL' | 'CLIENTE'): void {
    this.tipoIngreso = tipo;
    this.errorMensaje = null;
    if (tipo === 'PERSONAL') {
      this.loginForm.patchValue({ identificador: 'admin', contrasena: 'Admin123*' });
    } else {
      this.loginForm.patchValue({ identificador: 'cliente@correo.com', contrasena: 'Cliente123*' });
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.cargando = true;
    this.errorMensaje = null;

    const val = this.loginForm.value;
    this.authService.login({
      tipoIngreso: this.tipoIngreso,
      identificador: val.identificador!,
      contrasena: val.contrasena!
    }).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/salidas']);
      },
      error: (err) => {
        this.cargando = false;
        if (err.status === 401) {
          this.errorMensaje = err.error?.mensaje || 'Usuario o contraseña incorrectos';
        } else if (err.status === 403) {
          this.errorMensaje = 'Usuario bloqueado';
        } else {
          this.errorMensaje = err.error?.mensaje || 'Error al iniciar sesión';
        }
      }
    });
  }

  crearCuentaCliente(): void {
    alert('El registro público de clientes estará habilitado en la Entrega 3.');
  }
}
