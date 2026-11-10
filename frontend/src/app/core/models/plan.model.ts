export type TipoPlan = 'BASICO' | 'ESTANDAR' | 'PREMIUM' | 'TODO_INCLUIDO';
export type EstadoPlan = 'ACTIVO' | 'INACTIVO';

export interface PlanDto {
  idPlan: number;
  nombre: string;
  descripcion: string;
  tipo: TipoPlan;
  precio: number;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPlan;
  idPrestador: number;
  prestadorNombre: string;
}

export interface CrearPlanRequest {
  nombre: string;
  descripcion: string;
  tipo: TipoPlan;
  precio: number;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPlan;
  idPrestador: number;
}
