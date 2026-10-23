package co.edu.uniquindio.quindiostay.dto.tours;

import co.edu.uniquindio.quindiostay.domain.enums.EstadoSalida;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record SalidaTourRequest(
        @NotNull(message = "El tour es obligatorio")
        Long idTour,

        @NotNull(message = "La fecha es obligatoria")
        LocalDate fecha,

        @NotNull(message = "La hora de inicio es obligatoria")
        LocalTime horaInicio,

        @NotNull(message = "El guía es obligatorio")
        Long idGuia,

        @NotNull(message = "El idioma es obligatorio")
        Long idIdioma,

        @NotNull(message = "El cupo es obligatorio")
        @Min(value = 1, message = "El cupo debe ser mayor a 0")
        Short cupo,

        EstadoSalida estado
) {}
