import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, UsuarioActual } from '../models/usuario.model';
import { guardarToken, obtenerToken, eliminarToken, guardarUsuario, obtenerUsuario } from './token.storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = '/api/auth';
  private currentUserSignal = signal<LoginResponse | null>(obtenerUsuario());

  readonly usuarioActual = computed(() => this.currentUserSignal());
  readonly estaAutenticado = computed(() => !!this.currentUserSignal() && !!obtenerToken());
  readonly rol = computed(() => this.currentUserSignal()?.rol ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((res) => {
        guardarToken(res.token);
        guardarUsuario(res);
        this.currentUserSignal.set(res);
      })
    );
  }

  logout(): void {
    eliminarToken();
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return obtenerToken();
  }

  getMe(): Observable<UsuarioActual> {
    return this.http.get<UsuarioActual>(`${this.apiUrl}/me`);
  }
}
