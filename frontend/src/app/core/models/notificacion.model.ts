export type TipoNotificacion = 'RECORDATORIO_RESERVA' | 'CONFIRMACION_RESERVA' | 'CONFIRMACION_PAGO' | 'CAMBIO_ESTADO' | 'PROMOCION';
export type CanalNotificacion = 'CORREO' | 'SMS' | 'WHATSAPP';
export type EstadoNotificacion = 'PENDIENTE' | 'ENVIADA' | 'FALLIDA' | 'LEIDA';

export interface NotificacionDto {
  idNotificacion: number;
  tipo: TipoNotificacion;
  canal: CanalNotificacion;
  mensaje: string;
  fechaProgramada: string;
  fechaEnvioReal?: string;
  estado: EstadoNotificacion;
  idCliente: number;
  clienteNombre: string;
  idReserva?: number;
}

export interface CrearNotificacionRequest {
  tipo: TipoNotificacion;
  canal: CanalNotificacion;
  mensaje: string;
  fechaProgramada: string;
  idCliente: number;
  idReserva?: number;
}
