import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <div class="main-container">
        <app-topbar></app-topbar>
        <main class="content bg-texture">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--mist);
    }
    .main-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 28px;
      position: relative;
    }
    .bg-texture {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 100 100'%3E%3Cpath d='M50 5 C55 25 70 35 90 40 C70 45 55 55 50 75 C45 55 30 45 10 40 C30 35 45 25 50 5 Z M50 20 C52 32 60 38 75 40 C60 42 52 48 50 60 C48 48 40 42 25 40 C40 38 48 32 50 20 Z' fill='%23113827' fill-opacity='0.025'/%3E%3Cpath d='M50 5 L50 75' stroke='%23113827' stroke-opacity='0.02' stroke-width='0.75' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: repeat;
      background-position: top left;
      background-size: 160px 160px;
    }
  `]
})
export class ShellComponent {}
