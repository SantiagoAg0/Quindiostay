package co.edu.uniquindio.quindiostay.dto.tours;

import co.edu.uniquindio.quindiostay.domain.enums.Dificultad;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CrearTourRequest(
        @NotBlank(message = "El nombre del tour es obligatorio")
        String nombre,

        String descripcion,

        @NotNull(message = "La duración en horas es obligatoria")
        @DecimalMin(value = "0.5", message = "La duración mínima es 0.5 horas")
        BigDecimal duracionHoras,

        @NotNull(message = "La dificultad es obligatoria")
        Dificultad dificultad,

        @NotNull(message = "La edad mínima es obligatoria")
        Short edadMinima,

        @NotNull(message = "El precio por persona es obligatorio")
        @DecimalMin(value = "1.0", message = "El precio debe ser mayor a cero")
        BigDecimal precioPersona,

        @NotNull(message = "La categoría es obligatoria")
        Long idCategoria,

        @NotNull(message = "El prestador es obligatorio")
        Long idPrestador
) {}
