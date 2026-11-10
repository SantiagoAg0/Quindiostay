package co.edu.uniquindio.quindiostay.dto.planes;

import co.edu.uniquindio.quindiostay.domain.enums.EstadoPlan;
import co.edu.uniquindio.quindiostay.domain.enums.TipoPlan;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CrearPlanRequest(
        @NotBlank(message = "El nombre del plan es obligatorio")
        String nombre,

        String descripcion,

        @NotNull(message = "El tipo de plan es obligatorio")
        TipoPlan tipo,

        @NotNull(message = "El precio es obligatorio")
        @DecimalMin(value = "1.0", message = "El precio debe ser mayor a cero")
        BigDecimal precio,

        @NotNull(message = "La fecha de inicio es obligatoria")
        LocalDate fechaInicio,

        @NotNull(message = "La fecha de fin es obligatoria")
        LocalDate fechaFin,

        @NotNull(message = "El estado del plan es obligatorio")
        EstadoPlan estado,

        @NotNull(message = "El prestador es obligatorio")
        Long idPrestador
) {}
