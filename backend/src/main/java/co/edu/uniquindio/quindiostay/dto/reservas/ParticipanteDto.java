package co.edu.uniquindio.quindiostay.dto.reservas;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ParticipanteDto(
        Long idParticipante,
        @NotBlank(message = "El nombre del participante es obligatorio")
        String nombre,
        @NotNull(message = "La edad del participante es obligatoria")
        @Min(value = 0, message = "La edad no puede ser negativa")
        Short edad
) {}
