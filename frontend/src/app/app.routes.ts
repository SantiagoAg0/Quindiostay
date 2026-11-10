import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { ShellComponent } from './layout/shell.component';
import { authGuard } from './core/auth/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { SalidasListaComponent } from './features/salidas/salidas-lista.component';
import { ToursListaComponent } from './features/tours/tours-lista.component';
import { GuiasListaComponent } from './features/guias/guias-lista.component';
import { ReservasListaComponent } from './features/reservas/reservas-lista.component';
import { PagosListaComponent } from './features/pagos/pagos-lista.component';
import { PrestadoresListaComponent } from './features/prestadores/prestadores-lista.component';
import { PlanesListaComponent } from './features/planes/planes-lista.component';
import { ClientesListaComponent } from './features/clientes/clientes-lista.component';
import { NotificacionesListaComponent } from './features/notificaciones/notificaciones-lista.component';
import { UsuariosListaComponent } from './features/usuarios/usuarios-lista.component';
import { ReportesIndiceComponent } from './features/reportes/reportes-indice.component';
import { ReporteGuiasSalidasComponent } from './features/reportes/reporte-guias-salidas.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'salidas', component: SalidasListaComponent },
      { path: 'tours', component: ToursListaComponent },
      { path: 'guias', component: GuiasListaComponent },
      { path: 'reservas', component: ReservasListaComponent },
      { path: 'pagos', component: PagosListaComponent },
      { path: 'prestadores', component: PrestadoresListaComponent },
      { path: 'planes', component: PlanesListaComponent },
      { path: 'clientes', component: ClientesListaComponent },
      { path: 'notificaciones', component: NotificacionesListaComponent },
      { path: 'usuarios', component: UsuariosListaComponent },
      { path: 'reportes', component: ReportesIndiceComponent },
      { path: 'reportes/guias-mas-salidas', component: ReporteGuiasSalidasComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
