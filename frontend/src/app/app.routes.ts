import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { ShellComponent } from './layout/shell.component';
import { authGuard } from './core/auth/auth.guard';
import { SalidasListaComponent } from './features/salidas/salidas-lista.component';
import { ReportesIndiceComponent } from './features/reportes/reportes-indice.component';
import { ReporteGuiasSalidasComponent } from './features/reportes/reporte-guias-salidas.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PlaceholderComponent } from './features/placeholders/placeholder.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'salidas', pathMatch: 'full' },
      { path: 'salidas', component: SalidasListaComponent },
      { path: 'reportes', component: ReportesIndiceComponent },
      { path: 'reportes/guias-mas-salidas', component: ReporteGuiasSalidasComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'tours', component: PlaceholderComponent },
      { path: 'guias', component: PlaceholderComponent },
      { path: 'reservas', component: PlaceholderComponent },
      { path: 'pagos', component: PlaceholderComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
