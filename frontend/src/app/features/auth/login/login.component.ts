import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { IconComponent } from '../../../shared/icon/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="login-wrapper">
      <!-- Panel Izquierdo: Ilustración Premium de la Cordillera Central y Palmas de Cera -->
      <div class="brand-panel">
        <div class="brand-header">
          <div class="brand-logo-icon">
            <app-icon name="mountain" [size]="24" customClass="text-emerald"></app-icon>
          </div>
          <span class="brand-name">QuindíoStay</span>
        </div>

        <div class="brand-hero">
          <span class="hero-badge">Turismo & Naturaleza</span>
          <h1 class="hero-title">Explora la magia del Eje Cafetero</h1>
          <p class="hero-subtitle">
            Plataforma integral de gestión turística, salidas de ecoturismo, guianza certificada y reservas seguras en los 12 municipios del Quindío.
          </p>

          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon">
                <app-icon name="check" [size]="14"></app-icon>
              </div>
              <span>Guías bilingües profesionales con tarjeta acreditada</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <app-icon name="check" [size]="14"></app-icon>
              </div>
              <span>Control riguroso de cupos y edades por tour</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <app-icon name="check" [size]="14"></app-icon>
              </div>
              <span>Pagos en línea y recordatorios automáticos multicanal</span>
            </div>
          </div>
        </div>

        <div class="brand-quote">
          <p class="quote-text">"Cada salida, con su cupo y su guía confirmados."</p>
          <span class="quote-sub">Experiencias Auténticas en el Quindío</span>
        </div>
      </div>

      <!-- Panel Derecho: Formulario de Autenticación y Registro -->
      <div class="form-panel">
        <div class="form-card animate-slide-up">
          <div class="form-header">
            <h2>Bienvenido a QuindíoStay</h2>
            <p>Accede con tus credenciales o crea tu cuenta de viajero.</p>
          </div>

          <!-- Selector de tipo de ingreso -->
          <div class="tab-selector">
            <button
              type="button"
              class="tab-btn"
              [class.active]="tipoIngreso === 'PERSONAL'"
              (click)="cambiarTipo('PERSONAL')">
              <app-icon name="shield" [size]="16"></app-icon>
              <span>Personal Interno</span>
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="tipoIngreso === 'CLIENTE'"
              (click)="cambiarTipo('CLIENTE')">
              <app-icon name="user" [size]="16"></app-icon>
              <span>Cliente / Viajero</span>
            </button>
          </div>

          <!-- Cuentas de Acceso Rápido de Prueba -->
          <div class="quick-access-box" *ngIf="tipoIngreso === 'PERSONAL'">
            <span class="quick-title">Cuentas demo de personal:</span>
            <div class="quick-pills">
              <button type="button" class="quick-pill" (click)="autocompletar('admin', 'Admin123*', 'PERSONAL')">Admin</button>
              <button type="button" class="quick-pill" (click)="autocompletar('operador', 'Operador123*', 'PERSONAL')">Operador</button>
              <button type="button" class="quick-pill" (click)="autocompletar('enc_cocora', 'Encargado123*', 'PERSONAL')">Encargado</button>
            </div>
          </div>

          <div class="quick-access-box" *ngIf="tipoIngreso === 'CLIENTE'">
            <span class="quick-title">Clientes demo con perfil (Clave: Cliente123*):</span>
            <div class="quick-pills">
              <button type="button" class="quick-pill" (click)="autocompletar('emily.johnson@hotmail.com', 'Cliente123*', 'CLIENTE')">Emily Johnson</button>
              <button type="button" class="quick-pill" (click)="autocompletar('lucas.muller@gmail.com', 'Cliente123*', 'CLIENTE')">Lucas Müller</button>
              <button type="button" class="quick-pill" (click)="autocompletar('carlos.fernandez@yahoo.com', 'Cliente123*', 'CLIENTE')">Carlos Fernández</button>
            </div>
          </div>

          <!-- Alerta de error -->
          <div *ngIf="errorMensaje" class="error-alert animate-fade-in">
            <app-icon name="alert" [size]="18"></app-icon>
            <span>{{ errorMensaje }}</span>
          </div>

          <!-- Mensaje de éxito -->
          <div *ngIf="exitoMensaje" class="success-alert animate-fade-in">
            <app-icon name="check" [size]="18"></app-icon>
            <span>{{ exitoMensaje }}</span>
          </div>

          <!-- FORMULARIO DE LOGIN -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label">
                {{ tipoIngreso === 'PERSONAL' ? 'Usuario del sistema' : 'Correo electrónico' }}
              </label>
              <div class="input-with-icon">
                <app-icon [name]="tipoIngreso === 'PERSONAL' ? 'user' : 'search'" [size]="16" class="input-icon"></app-icon>
                <input
                  type="text"
                  class="form-input"
                  [placeholder]="tipoIngreso === 'PERSONAL' ? 'Ej: admin u operador' : 'cliente@correo.com'"
                  formControlName="identificador" />
              </div>
              <span *ngIf="loginForm.get('identificador')?.touched && loginForm.get('identificador')?.invalid" class="field-error">
                Este campo es obligatorio
              </span>
            </div>

            <div class="form-group">
              <label class="form-label">Contraseña</label>
              <div class="input-with-icon">
                <app-icon name="shield" [size]="16" class="input-icon"></app-icon>
                <input
                  type="password"
                  class="form-input"
                  placeholder="••••••••"
                  formControlName="contrasena" />
              </div>
              <span *ngIf="loginForm.get('contrasena')?.touched && loginForm.get('contrasena')?.invalid" class="field-error">
                La contraseña es obligatoria
              </span>
            </div>

            <button type="submit" class="submit-btn" [disabled]="loginForm.invalid || cargando">
              <span *ngIf="cargando" class="spinner"></span>
              <span *ngIf="!cargando">Ingresar al Sistema</span>
              <app-icon *ngIf="!cargando" name="chevron-right" [size]="16"></app-icon>
            </button>
          </form>

          <div class="form-footer">
            <button type="button" class="btn-link" (click)="abrirModalRegistro()">
              ¿Aún no tienes cuenta? <strong>Regístrate como Cliente</strong>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE REGISTRO DE CLIENTE -->
    <div class="modal-backdrop animate-fade-in" *ngIf="mostrarRegistroModal">
      <div class="modal-card animate-slide-up">
        <div class="modal-header">
          <div>
            <h3>Crear Cuenta de Cliente</h3>
            <p class="modal-subtitle">Regístrate para reservar salidas turísticas y configurar tus preferencias.</p>
          </div>
          <button type="button" class="btn-close" (click)="cerrarModalRegistro()">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>

        <form [formGroup]="registroForm" (ngSubmit)="onRegistroSubmit()">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Nombres *</label>
              <input type="text" class="form-input" placeholder="Ej: Santiago" formControlName="nombres" />
            </div>

            <div class="form-group">
              <label class="form-label">Apellidos *</label>
              <input type="text" class="form-input" placeholder="Ej: Aguirre Osorio" formControlName="apellidos" />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Tipo de Documento *</label>
              <select class="form-select" formControlName="tipoDocumento">
                <option value="CC">Cédula de Ciudadanía (CC)</option>
                <option value="CE">Cédula de Extranjería (CE)</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="TI">Tarjeta de Identidad (TI)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Número de Documento *</label>
              <input type="text" class="form-input" placeholder="Ej: 1094900123" formControlName="numeroDocumento" />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Correo Electrónico *</label>
              <input type="email" class="form-input" placeholder="tucorreo@dominio.com" formControlName="correo" />
            </div>

            <div class="form-group">
              <label class="form-label">Teléfono (Celular Colombia 10 dígitos) *</label>
              <input type="text" class="form-input" placeholder="Ej: 3101234567" formControlName="telefono" />
            </div>
          </div>

          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label">Fecha Nacimiento *</label>
              <input type="date" class="form-input" formControlName="fechaNacimiento" />
            </div>

            <div class="form-group">
              <label class="form-label">Ciudad de Origen</label>
              <input type="text" class="form-input" placeholder="Ej: Armenia, Bogotá" formControlName="ciudadOrigen" />
            </div>

            <div class="form-group">
              <label class="form-label">Contraseña de Acceso *</label>
              <input type="password" class="form-input" placeholder="Mínimo 6 caracteres" formControlName="contrasena" />
            </div>
          </div>

          <div class="modal-section-title">Preferencias de Perfil y Notificaciones</div>

          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label">Idioma Preferido</label>
              <select class="form-select" formControlName="idiomaPreferido">
                <option value="ESPAÑOL">Español</option>
                <option value="INGLES">Inglés</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Canal Notificaciones</label>
              <select class="form-select" formControlName="canalPreferido">
                <option value="CORREO">Correo Electrónico</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="SMS">SMS</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Recordatorios (Anticipación)</label>
              <select class="form-select" formControlName="anticipacionDias">
                <option [ngValue]="1">1 día antes</option>
                <option [ngValue]="3">3 días antes</option>
                <option [ngValue]="7">7 días antes</option>
              </select>
            </div>
          </div>

          <div class="checkbox-row">
            <input type="checkbox" id="aceptaPromo" formControlName="aceptaPromocionesBool" />
            <label for="aceptaPromo">Deseo recibir promociones y novedades sobre tours en el Quindío</label>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="cerrarModalRegistro()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="registroForm.invalid || registrando">
              <span *ngIf="registrando" class="spinner"></span>
              <span *ngIf="!registrando">Crear Cuenta e Iniciar Sesión</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      min-height: 100vh;
      background: #071911;
    }

    // Panel Izquierdo
    .brand-panel {
      flex: 1.1;
      background: linear-gradient(135deg, #071911 0%, #0B2D1F 50%, #082418 100%);
      color: #FFFFFF;
      padding: 60px 50px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      border-right: 1px solid rgba(255, 255, 255, 0.08);

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 100 100'%3E%3Cpath d='M50 5 C55 25 70 35 90 40 C70 45 55 55 50 75 C45 55 30 45 10 40 C30 35 45 25 50 5 Z M50 20 C52 32 60 38 75 40 C60 42 52 48 50 60 C48 48 40 42 25 40 C40 38 48 32 50 20 Z' fill='%23ffffff' fill-opacity='0.02'/%3E%3Cpath d='M50 5 L50 75' stroke='%23ffffff' stroke-opacity='0.015' stroke-width='0.75' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: repeat;
        background-size: 160px 160px;
        pointer-events: none;
        z-index: 1;
      }

      &::before {
        content: '';
        position: absolute;
        top: -20%;
        left: -20%;
        width: 70%;
        height: 70%;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 70%);
        pointer-events: none;
      }
    }

    .brand-header {
      display: flex;
      align-items: center;
      gap: 14px;
      position: relative;
      z-index: 2;

      .brand-logo-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(16, 185, 129, 0.2);
        border: 1px solid rgba(16, 185, 129, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #10B981;
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
      }

      .brand-name {
        font-family: var(--font-brand, 'Caveat', cursive);
        font-size: 2.15rem;
        font-weight: 700;
        letter-spacing: -0.01em;
        color: #FFFFFF;
        line-height: 1;
      }
    }

    .brand-hero {
      margin: 40px 0;
      position: relative;
      z-index: 2;

      .hero-badge {
        display: inline-block;
        padding: 5px 14px;
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 999px;
        color: #34D399;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 20px;
      }

      .hero-title {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 2.75rem;
        font-weight: 800;
        line-height: 1.15;
        letter-spacing: -0.03em;
        color: #FFFFFF;
        margin-bottom: 18px;
      }

      .hero-subtitle {
        font-size: 1.0625rem;
        color: #D1D5DB;
        line-height: 1.6;
        max-width: 480px;
        margin-bottom: 30px;
      }
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 14px;

      .feature-item {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #E5E7EB;
        font-size: 0.9375rem;

        .feature-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .brand-quote {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 24px;
      position: relative;
      z-index: 2;

      .quote-text {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.125rem;
        font-weight: 600;
        font-style: italic;
        color: #A7F3D0;
        margin-bottom: 4px;
      }

      .quote-sub {
        font-size: 0.8125rem;
        color: #9CA3AF;
      }
    }

    // Panel Derecho
    .form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: radial-gradient(circle at center, #0C2117 0%, #071911 100%);
    }

    .form-card {
      width: 100%;
      max-width: 440px;
      background: rgba(16, 28, 22, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 40px 36px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(16, 185, 129, 0.1);
      color: #FFFFFF;
    }

    .form-header {
      margin-bottom: 24px;

      h2 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.625rem;
        font-weight: 700;
        color: #FFFFFF;
        letter-spacing: -0.02em;
        margin-bottom: 6px;
      }

      p {
        font-size: 0.875rem;
        color: #9CA3AF;
        margin: 0;
      }
    }

    .tab-selector {
      display: flex;
      background: rgba(0, 0, 0, 0.3);
      padding: 4px;
      border-radius: 12px;
      margin-bottom: 16px;
      border: 1px solid rgba(255, 255, 255, 0.06);

      .tab-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 9px 12px;
        font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
        font-size: 0.8125rem;
        font-weight: 600;
        color: #D1D5DB;
        background: transparent;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: #FFFFFF;
        }

        &.active {
          background: rgba(16, 185, 129, 0.25);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
      }
    }

    .quick-access-box {
      background: rgba(16, 185, 129, 0.08);
      border: 1px dashed rgba(16, 185, 129, 0.25);
      border-radius: 12px;
      padding: 10px 14px;
      margin-bottom: 20px;

      .quick-title {
        display: block;
        font-size: 0.75rem;
        color: #9CA3AF;
        margin-bottom: 6px;
        font-weight: 600;
      }

      .quick-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;

        .quick-pill {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #E5E7EB;
          font-size: 0.75rem;
          padding: 4px 10px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #10B981;
            color: #FFFFFF;
            border-color: #10B981;
          }
        }
      }
    }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #FCA5A5;
      border-radius: 10px;
      font-size: 0.8125rem;
      margin-bottom: 18px;
    }

    .success-alert {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #6EE7B7;
      border-radius: 10px;
      font-size: 0.8125rem;
      margin-bottom: 18px;
    }

    .form-group {
      margin-bottom: 18px;

      .form-label {
        display: block;
        font-size: 0.8125rem;
        font-weight: 600;
        color: #D1D5DB;
        margin-bottom: 6px;
      }

      .input-with-icon {
        position: relative;
        display: flex;
        align-items: center;

        .input-icon {
          position: absolute;
          left: 14px;
          color: #9CA3AF;
          pointer-events: none;
        }

        .form-input {
          width: 100%;
          padding: 12px 14px 12px 40px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: #FFFFFF;
          font-size: 0.875rem;
          outline: none;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.05);
          transition: all 0.2s;

          &:focus {
            border-color: #10B981;
            background: rgba(255, 255, 255, 0.12);
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2), 0 0 0 3px rgba(16, 185, 129, 0.25);
          }

          &::placeholder {
            color: #9CA3AF;
          }
        }
      }

      .field-error {
        display: block;
        color: #F87171;
        font-size: 0.75rem;
        margin-top: 4px;
      }
    }

    .submit-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 13px;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #FFFFFF;
      font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
      font-size: 0.9375rem;
      font-weight: 700;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 18px rgba(16, 185, 129, 0.35);

      &:hover:not(:disabled) {
        transform: translateY(-2px) scale(1.01);
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.45);
        background: linear-gradient(135deg, #34D399 0%, #10B981 100%);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .form-footer {
      text-align: center;
      margin-top: 20px;

      .btn-link {
        background: none;
        border: none;
        color: #A7F3D0;
        font-size: 0.8125rem;
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
          color: #FFFFFF;
          text-decoration: underline;
        }
      }
    }

    // Modal de Registro
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 20px;
    }

    .modal-card {
      width: 100%;
      max-width: 640px;
      max-height: 90vh;
      overflow-y: auto;
      background: #0E1A14;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
      color: #FFFFFF;

      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 3px;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;

      h3 {
        font-family: var(--font-heading, 'Outfit', sans-serif);
        font-size: 1.5rem;
        font-weight: 700;
        color: #FFFFFF;
        margin-bottom: 4px;
      }

      .modal-subtitle {
        font-size: 0.875rem;
        color: #9CA3AF;
        margin: 0;
      }

      .btn-close {
        background: transparent;
        border: none;
        color: #9CA3AF;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        transition: color 0.2s;

        &:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
    }

    .modal-section-title {
      font-size: 0.8125rem;
      font-weight: 700;
      color: #34D399;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 16px 0 12px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 18px 0 24px;

      input[type="checkbox"] {
        accent-color: #10B981;
        width: 18px;
        height: 18px;
      }

      label {
        font-size: 0.8125rem;
        color: #D1D5DB;
        cursor: pointer;
      }
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  tipoIngreso: 'PERSONAL' | 'CLIENTE' = 'PERSONAL';
  cargando = false;
  registrando = false;
  errorMensaje: string | null = null;
  exitoMensaje: string | null = null;
  mostrarRegistroModal = false;

  loginForm = this.fb.group({
    identificador: ['', Validators.required],
    contrasena: ['', Validators.required]
  });

  registroForm = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    tipoDocumento: ['CC', Validators.required],
    numeroDocumento: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    telefono: [''],
    ciudadOrigen: [''],
    contrasena: ['', [Validators.required, Validators.minLength(6)]],
    idiomaPreferido: ['ESPAÑOL'],
    canalPreferido: ['CORREO'],
    anticipacionDias: [3],
    aceptaPromocionesBool: [true]
  });

  cambiarTipo(tipo: 'PERSONAL' | 'CLIENTE'): void {
    this.tipoIngreso = tipo;
    this.errorMensaje = null;
    this.loginForm.reset();
  }

  autocompletar(user: string, pass: string, tipo: 'PERSONAL' | 'CLIENTE'): void {
    this.tipoIngreso = tipo;
    this.errorMensaje = null;
    this.loginForm.patchValue({
      identificador: user,
      contrasena: pass
    });
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
          this.errorMensaje = 'Credenciales incorrectas. Verifique su usuario o correo y contraseña.';
        } else if (err.status === 403) {
          this.errorMensaje = 'Acceso denegado o usuario inactivo.';
        } else {
          this.errorMensaje = 'Error de conexión. Intente nuevamente en unos momentos.';
        }
      }
    });
  }

  abrirModalRegistro(): void {
    this.mostrarRegistroModal = true;
  }

  cerrarModalRegistro(): void {
    this.mostrarRegistroModal = false;
    this.registroForm.reset({
      tipoDocumento: 'CC',
      idiomaPreferido: 'ESPAÑOL',
      canalPreferido: 'CORREO',
      anticipacionDias: 3,
      aceptaPromocionesBool: true
    });
  }

  onRegistroSubmit(): void {
    if (this.registroForm.invalid) return;

    this.registrando = true;
    this.errorMensaje = null;

    const v = this.registroForm.value;
    this.authService.registroCliente({
      nombres: v.nombres!,
      apellidos: v.apellidos!,
      tipoDocumento: v.tipoDocumento!,
      numeroDocumento: v.numeroDocumento!,
      correo: v.correo!,
      telefono: v.telefono || undefined,
      ciudadOrigen: v.ciudadOrigen || undefined,
      contrasena: v.contrasena!,
      idiomaPreferido: v.idiomaPreferido || 'ESPAÑOL',
      canalPreferido: v.canalPreferido || 'CORREO',
      anticipacionDias: v.anticipacionDias || 3,
      aceptaPromociones: v.aceptaPromocionesBool ? 'SI' : 'NO'
    }).subscribe({
      next: () => {
        this.registrando = false;
        this.mostrarRegistroModal = false;
        this.router.navigate(['/salidas']);
      },
      error: (err) => {
        this.registrando = false;
        if (err.status === 400) {
          this.errorMensaje = err.error?.mensaje || 'Datos de registro inválidos. Verifique la información ingresada.';
        } else if (err.status === 409) {
          this.errorMensaje = 'Ya existe una cuenta con este correo o documento.';
        } else {
          this.errorMensaje = 'Error de conexión. Intente nuevamente en unos momentos.';
        }
      }
    });
  }
}
