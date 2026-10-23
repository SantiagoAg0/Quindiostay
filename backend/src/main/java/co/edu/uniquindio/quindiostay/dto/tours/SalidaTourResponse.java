package co.edu.uniquindio.quindiostay.dto.tours;

import co.edu.uniquindio.quindiostay.domain.enums.EstadoSalida;
import java.time.LocalDate;
import java.time.LocalTime;

public record SalidaTourResponse(
        Long idSalida,
        TourResumen tour,
        GuiaResumen guia,
        IdiomaResumen idioma,
        LocalDate fecha,
        LocalTime horaInicio,
        LocalTime horaFin,
        Short cupo,
        long cuposOcupados,
        long cuposDisponibles,
        EstadoSalida estado
) {}
