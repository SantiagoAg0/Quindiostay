export interface ClienteDto {
  idCliente: number;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
  ciudadOrigen: string;
  tienePerfil: boolean;
  idiomaPreferido?: string;
  canalPreferido?: string;
  anticipacionDias?: number;
  aceptaPromociones?: string;
}

export interface ActualizarPerfilRequest {
  telefono?: string;
  ciudadOrigen?: string;
  idiomaPreferido: string;
  canalPreferido: string;
  anticipacionDias: number;
  aceptaPromociones: string;
}
