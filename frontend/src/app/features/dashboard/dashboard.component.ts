import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <h1>Panel de Control · QuindíoStay</h1>
      <p>Bienvenido al módulo de gestión de tours y salidas.</p>
    </div>
  `
})
export class DashboardComponent {}
