package co.edu.uniquindio.quindiostay.dto.tours;

import co.edu.uniquindio.quindiostay.domain.enums.Dificultad;
import java.math.BigDecimal;

public record TourResumen(
        Long idTour,
        String nombre,
        BigDecimal duracionHoras,
        Dificultad dificultad,
        BigDecimal precioPersona
) {}
