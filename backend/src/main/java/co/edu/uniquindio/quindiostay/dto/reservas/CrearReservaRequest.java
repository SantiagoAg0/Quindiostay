package co.edu.uniquindio.quindiostay.dto.reservas;

import co.edu.uniquindio.quindiostay.domain.enums.CanalReserva;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CrearReservaRequest(
        @NotNull(message = "La salida es obligatoria")
        Long idSalida,

        @NotNull(message = "El plan es obligatorio")
        Long idPlan,

        Long idCliente, // Opcional si viene de usuario autenticado como CLIENTE

        @NotNull(message = "El canal de reserva es obligatorio")
        CanalReserva canal,

        @NotEmpty(message = "Debe registrar al menos un participante")
        @Valid
        List<ParticipanteDto> participantes
) {}
