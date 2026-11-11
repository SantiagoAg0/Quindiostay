import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { ShellComponent } from './layout/shell.component';
import { authGuard } from './core/auth/auth.guard';
import { rolGuard } from './core/auth/rol.guard';
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
      {
        path: 'guias',
        component: GuiasListaComponent,
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR'] }
      },
      { path: 'reservas', component: ReservasListaComponent },
      { path: 'pagos', component: PagosListaComponent },
      {
        path: 'prestadores',
        component: PrestadoresListaComponent,
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR_PLATAFORMA', 'ENCARGADO_PRESTADOR'] }
      },
      {
        path: 'planes',
        component: PlanesListaComponent,
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR_PLATAFORMA', 'ENCARGADO_PRESTADOR'] }
      },
      { path: 'clientes', component: ClientesListaComponent },
      { path: 'notificaciones', component: NotificacionesListaComponent },
      {
        path: 'usuarios',
        component: UsuariosListaComponent,
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR_PLATAFORMA'] }
      },
      {
        path: 'reportes',
        component: ReportesIndiceComponent,
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR'] }
      },
      {
        path: 'reportes/guias-mas-salidas',
        component: ReporteGuiasSalidasComponent,
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR'] }
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
