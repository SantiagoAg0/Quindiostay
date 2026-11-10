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

export interface RegistroClienteRequest {
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  correo: string;
  telefono?: string;
  fechaNacimiento?: string;
  ciudadOrigen?: string;
  contrasena: string;
  idiomaPreferido?: string;
  canalPreferido?: string;
  anticipacionDias?: number;
  aceptaPromociones?: string;
}

export interface UsuarioSistemaDto {
  idUsuario: number;
  nombreUsuario: string;
  estado: 'ACTIVO' | 'BLOQUEADO';
  idRol: number;
  rolNombre: string;
  idPrestador: number | null;
  prestadorNombre: string | null;
}

export interface RolDto {
  idRol: number;
  nombre: string;
}
