package co.edu.uniquindio.quindiostay.dto.reportes;

import co.edu.uniquindio.quindiostay.domain.enums.Dificultad;
import java.math.BigDecimal;

public record R1TourCatalogoFila(
        String nombre,
        Dificultad dificultad,
        BigDecimal duracionHoras,
        Short edadMinima,
        BigDecimal precioPersona
) {}
