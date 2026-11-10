export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';
export type CanalReserva = 'WEB' | 'APP_MOVIL' | 'TELEFONO' | 'MOSTRADOR' | 'AGENCIA_INTERMEDIARIA';

export interface ParticipanteDto {
  idParticipante?: number;
  nombre: string;
  edad: number;
}

export interface CrearReservaRequest {
  idSalida: number;
  idPlan: number;
  idCliente?: number;
  canal: CanalReserva;
  participantes: ParticipanteDto[];
}

export interface ReservaDetalleDto {
  idReserva: number;
  fechaCreacion: string;
  fechaServicio: string;
  estado: EstadoReserva;
  valorTotal: number;
  totalPagado: number;
  saldoPendiente: number;
  canal: CanalReserva;
  idCliente: number;
  clienteNombreCompleto: string;
  clienteCorreo: string;
  idSalida: number;
  idTour: number;
  tourNombre: string;
  tourDificultad: string;
  guiaNombre: string;
  idiomaNombre: string;
  idPlan: number;
  planNombre: string;
  participantes: ParticipanteDto[];
}
