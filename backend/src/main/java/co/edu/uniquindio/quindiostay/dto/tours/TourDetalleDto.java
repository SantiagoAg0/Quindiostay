package co.edu.uniquindio.quindiostay.dto.tours;

import co.edu.uniquindio.quindiostay.domain.enums.Dificultad;
import java.math.BigDecimal;

public record TourDetalleDto(
        Long idTour,
        String nombre,
        String descripcion,
        BigDecimal duracionHoras,
        Dificultad dificultad,
        Short edadMinima,
        BigDecimal precioPersona,
        Long idCategoria,
        String categoriaNombre,
        Long idPrestador,
        String prestadorNombre
) {}
