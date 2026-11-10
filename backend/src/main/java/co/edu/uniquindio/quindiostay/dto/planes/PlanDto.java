package co.edu.uniquindio.quindiostay.dto.planes;

import co.edu.uniquindio.quindiostay.domain.enums.EstadoPlan;
import co.edu.uniquindio.quindiostay.domain.enums.TipoPlan;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PlanDto(
        Long idPlan,
        String nombre,
        String descripcion,
        TipoPlan tipo,
        BigDecimal precio,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        EstadoPlan estado,
        Long idPrestador,
        String prestadorNombre
) {}
