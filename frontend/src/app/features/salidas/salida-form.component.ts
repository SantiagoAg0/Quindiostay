import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SalidasService } from './salidas.service';
import { SalidaTour, SalidaTourRequest } from '../../core/models/salida-tour.model';
import { TourResumen } from '../../core/models/tour.model';
import { GuiaResumen } from '../../core/models/guia.model';
import { IdiomaResumen } from '../../core/models/idioma.model';

@Component({
  selector: 'app-salida-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="drawer-overlay" (click)="cerrar.emit()"></div>
    <div class="drawer-content">
      <div class="drawer-header">
        <div>
          <h3>{{ esEdicion ? 'Editar salida de tour' : 'Nueva salida de tour' }}</h3>
          <p>{{ esEdicion ? 'Modifica los datos de la salida programada' : 'Programa una nueva salida con su guía e idioma' }}</p>
        </div>
        <button class="close-btn" (click)="cerrar.emit()">✕</button>
      </div>

      <div *ngIf="errorMensaje" class="error-banner">
        {{ errorMensaje }}
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="drawer-form">
        <!-- Tour -->
        <div class="form-group">
          <label class="form-label">Tour <span class="req">*</span></label>
          <select formControlName="idTour" class="form-select">
            <option [ngValue]="null" disabled>Selecciona un tour</option>
            <option *ngFor="let t of tours" [ngValue]="t.idTour">
              {{ t.nombre }} ({{ t.duracionHoras }}h · $ {{ t.precioPersona | number }})
            </option>
          </select>
        </div>

        <!-- Fecha y Hora -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Fecha <span class="req">*</span></label>
            <input type="date" formControlName="fecha" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Hora inicio <span class="req">*</span></label>
            <input type="time" formControlName="horaInicio" class="form-input" />
          </div>
        </div>

        <!-- Guía -->
        <div class="form-group">
          <label class="form-label">Guía turístico <span class="req">*</span></label>
          <select formControlName="idGuia" class="form-select" (change)="onGuiaChange()">
            <option [ngValue]="null" disabled>Selecciona un guía</option>
            <option *ngFor="let g of guias" [ngValue]="g.idGuia">
              {{ g.nombre }}
            </option>
          </select>
        </div>

        <!-- Idioma (filtrado por guía) -->
        <div class="form-group">
          <label class="form-label">Idioma de la salida <span class="req">*</span></label>
          <select formControlName="idIdioma" class="form-select" [disabled]="!idiomasGuia.length">
            <option [ngValue]="null" disabled>
              {{ idiomasGuia.length ? 'Selecciona un idioma' : 'Selecciona un guía primero' }}
            </option>
            <option *ngFor="let i of idiomasGuia" [ngValue]="i.idIdioma">
              {{ i.nombre }}
            </option>
          </select>
          <span class="hint" *ngIf="form.get('idGuia')?.value && !idiomasGuia.length">
            El guía seleccionado no tiene idiomas registrados.
          </span>
        </div>

        <!-- Cupo y Estado -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Cupo máximo <span class="req">*</span></label>
            <input type="number" formControlName="cupo" min="1" max="100" class="form-input" />
          </div>

          <div class="form-group" *ngIf="esEdicion">
            <label class="form-label">Estado</label>
            <select formControlName="estado" class="form-select">
              <option value="PROGRAMADA">Programada</option>
              <option value="REALIZADA">Realizada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
        </div>

        <div class="drawer-actions">
          <button type="button" class="btn-cancel" (click)="cerrar.emit()">
            Cancelar
          </button>
          <button type="submit" class="btn-submit" [disabled]="form.invalid || guardando">
            {{ guardando ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Crear salida') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .drawer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10, 10, 10, 0.4);
      z-index: 40;
      backdrop-filter: blur(2px);
    }
    .drawer-content {
      position: fixed;
      top: 0;
      right: 0;
      width: 480px;
      max-width: 90vw;
      height: 100vh;
      background: var(--white);
      z-index: 50;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
    }
    .drawer-header {
      padding: 24px;
      border-bottom: 1px solid var(--line);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      h3 { margin: 0 0 4px; font-size: 1.25rem; font-weight: 700; color: var(--ink); }
      p { margin: 0; font-size: 0.8125rem; color: var(--mute); }
      .close-btn {
        background: none;
        border: none;
        font-size: 1.25rem;
        color: var(--mute);
        cursor: pointer;
        padding: 4px;
      }
    }
    .error-banner {
      background: #FEE2E2;
      color: #B91C1C;
      padding: 12px 24px;
      font-size: 0.875rem;
      border-bottom: 1px solid #FCA5A5;
    }
    .drawer-form {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-row {
      display: flex;
      gap: 16px;
      .form-group { flex: 1; }
    }
    .form-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--ink);
      .req { color: #DC2626; }
    }
    .form-input, .form-select {
      padding: 10px 12px;
      border: 1px solid var(--line);
      border-radius: 10px;
      font-size: 0.875rem;
      font-family: inherit;
      color: var(--ink);
      &:focus {
        outline: none;
        border-color: var(--green);
        box-shadow: 0 0 0 3px rgba(27, 127, 71, 0.12);
      }
      &:disabled { background: var(--mist); cursor: not-allowed; }
    }
    .hint { font-size: 0.75rem; color: #DC2626; }
    .drawer-actions {
      margin-top: auto;
      padding-top: 24px;
      border-top: 1px solid var(--line);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn-cancel {
      padding: 10px 18px;
      background: var(--white);
      border: 1px solid var(--line);
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .btn-submit {
      padding: 10px 20px;
      background: var(--green);
      color: var(--white);
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      &:hover:not(:disabled) { background: #156637; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
  `]
})
export class SalidaFormComponent implements OnInit {
  @Input() salida: SalidaTour | null = null;
  @Input() tours: TourResumen[] = [];
  @Input() guias: GuiaResumen[] = [];
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private salidasService = inject(SalidasService);

  idiomasGuia: IdiomaResumen[] = [];
  guardando = false;
  errorMensaje: string | null = null;

  get esEdicion(): boolean {
    return !!this.salida;
  }

  form = this.fb.group({
    idTour: [null as number | null, [Validators.required]],
    fecha: ['', [Validators.required]],
    horaInicio: ['', [Validators.required]],
    idGuia: [null as number | null, [Validators.required]],
    idIdioma: [null as number | null, [Validators.required]],
    cupo: [12, [Validators.required, Validators.min(1)]],
    estado: ['PROGRAMADA']
  });

  ngOnInit(): void {
    if (this.salida) {
      this.form.patchValue({
        idTour: this.salida.tour.idTour,
        fecha: this.salida.fecha,
        horaInicio: this.salida.horaInicio.substring(0, 5),
        idGuia: this.salida.guia.idGuia,
        idIdioma: this.salida.idioma.idIdioma,
        cupo: this.salida.cupo,
        estado: this.salida.estado
      });
      this.cargarIdiomasPorGuia(this.salida.guia.idGuia, this.salida.idioma.idIdioma);
    }
  }

  onGuiaChange(): void {
    const idGuia = this.form.get('idGuia')?.value;
    if (idGuia) {
      this.form.patchValue({ idIdioma: null });
      this.cargarIdiomasPorGuia(idGuia);
    } else {
      this.idiomasGuia = [];
    }
  }

  cargarIdiomasPorGuia(idGuia: number, idIdiomaPreseleccionado?: number): void {
    this.salidasService.listarIdiomasPorGuia(idGuia).subscribe({
      next: (idiomas) => {
        this.idiomasGuia = idiomas;
        if (idIdiomaPreseleccionado) {
          this.form.patchValue({ idIdioma: idIdiomaPreseleccionado });
        } else if (idiomas.length === 1) {
          this.form.patchValue({ idIdioma: idiomas[0].idIdioma });
        }
      }
    });
  }

  guardar(): void {
    if (this.form.invalid) return;

    this.guardando = true;
    this.errorMensaje = null;
    const val = this.form.value;

    let hora = val.horaInicio!;
    if (hora.length === 5) hora += ':00';

    const req: SalidaTourRequest = {
      idTour: val.idTour!,
      fecha: val.fecha!,
      horaInicio: hora,
      idGuia: val.idGuia!,
      idIdioma: val.idIdioma!,
      cupo: val.cupo!,
      estado: val.estado as any
    };

    const action = this.esEdicion
      ? this.salidasService.modificar(this.salida!.idSalida, req)
      : this.salidasService.crear(req);

    action.subscribe({
      next: () => {
        this.guardando = false;
        this.guardado.emit();
      },
      error: (err) => {
        this.guardando = false;
        this.errorMensaje = err.error?.mensaje || 'Error al guardar la salida';
      }
    });
  }
}
