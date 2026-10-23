export interface LoginRequest {
  tipoIngreso: 'PERSONAL' | 'CLIENTE';
  identificador: string;
  contrasena: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  nombre: string;
  rol: string;
  idPrestador: number | null;
}

export interface UsuarioActual {
  nombre: string;
  rol: string;
  idPrestador: number | null;
}
