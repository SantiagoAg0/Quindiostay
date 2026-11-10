package co.edu.uniquindio.quindiostay.dto.tours;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CrearGuiaRequest(
        @NotBlank(message = "El nombre del guía es obligatorio")
        String nombre,

        @NotBlank(message = "El documento es obligatorio")
        String documento,

        @NotBlank(message = "La tarjeta profesional es obligatoria")
        String tarjetaProfesional,

        @NotEmpty(message = "El guía debe hablar al menos un idioma")
        List<Long> idiomasIds
) {}
