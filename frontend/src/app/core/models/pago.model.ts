export type MetodoPago = 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'PSE' | 'TRANSFERENCIA' | 'EFECTIVO';
export type EstadoPago = 'EXITOSO' | 'FALLIDO' | 'PENDIENTE' | 'REEMBOLSADO';

export interface CrearPagoRequest {
  idReserva: number;
  monto: number;
  metodo: MetodoPago;
  referenciaTransaccion?: string;
}

export interface PagoDetalleDto {
  idPago: number;
  idReserva: number;
  fechaPago: string;
  monto: number;
  metodo: MetodoPago;
  estado: EstadoPago;
  referenciaTransaccion?: string;
  clienteNombre: string;
  tourNombre: string;
}
