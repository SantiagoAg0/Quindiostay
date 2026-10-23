package co.edu.uniquindio.quindiostay.dto.reportes;

import java.time.LocalDate;
import java.time.LocalTime;

public record R2SalidaProximaFila(
        Long idSalida,
        LocalDate fecha,
        LocalTime horaInicio,
        Short cupo,
        Long idTour,
        Long idGuia
) {}
