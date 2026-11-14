package co.edu.uniquindio.quindiostay.dto.tours;

import co.edu.uniquindio.quindiostay.domain.enums.Dificultad;
import java.math.BigDecimal;

public record TourResumen(
        Long idTour,
        String nombre,
        BigDecimal duracionHoras,
        Dificultad dificultad,
        BigDecimal precioPersona,
        Long idPrestador,
        String nombrePrestador
) {
    public TourResumen(Long idTour, String nombre, BigDecimal duracionHoras, Dificultad dificultad, BigDecimal precioPersona) {
        this(idTour, nombre, duracionHoras, dificultad, precioPersona, null, null);
    }
}
