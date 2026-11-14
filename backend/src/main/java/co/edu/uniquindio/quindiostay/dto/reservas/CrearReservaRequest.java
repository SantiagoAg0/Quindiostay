package co.edu.uniquindio.quindiostay.dto.reservas;

import co.edu.uniquindio.quindiostay.domain.enums.CanalReserva;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

public record CrearReservaRequest(
        Long idSalida,          // Opcional si es reserva de solo plan (RF04)
        Long idPlan,            // Opcional si se deduce automáticamente del operador de la salida
        Long idCliente,         // Opcional si viene de usuario autenticado como CLIENTE
        CanalReserva canal,     // Opcional (por defecto WEB)
        LocalDate fechaServicio,// Opcional para reserva solo plan
        @Valid
        List<ParticipanteDto> participantes
) {}
