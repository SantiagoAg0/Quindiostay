export interface R1TourCatalogoFila {
  nombre: string;
  dificultad: string;
  duracionHoras: number;
  edadMinima: number;
  precioPersona: number;
}

export interface R2SalidaProximaFila {
  idSalida: number;
  fecha: string;
  horaInicio: string;
  cupo: number;
  idTour: number;
  idGuia: number;
}

export interface R3PagoPendienteFila {
  idPago: number;
  idReserva: number;
  fechaPago: string;
  monto: number;
  metodo: string;
  estado: string;
}

export interface R4TourParticipantesMesFila {
  mes: string;
  tour: string;
  totalParticipantes: number;
}

export interface R5GuiaSalidasFila {
  idGuia: number;
  guia: string;
  idiomas: string[];
  totalSalidas: number;
  horasGuiadas: number;
}

export interface R6OcupacionCategoriaFila {
  categoria: string;
  salidasRealizadas: number;
  ocupacionPromedio: number;
}

export interface R7IngresoMensualFila {
  mes: string;
  metodo: string;
  totalIngresos: number;
}

export interface R8PrestadorCancelacionesFila {
  prestador: string;
  municipio: string;
  reservasCanceladas: number;
  valorCancelado: number;
}

export interface R9GuiaSinSalidasFila {
  nombre: string;
  documento: string;
  tarjetaProfesional: string;
}

export interface R10ClienteAltoGastoFila {
  cliente: string;
  ciudadOrigen: string;
  canalPreferido: string;
  totalGastado: number;
  numeroReservas: number;
}
