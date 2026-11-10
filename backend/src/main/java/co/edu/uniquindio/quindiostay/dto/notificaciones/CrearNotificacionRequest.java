package co.edu.uniquindio.quindiostay.dto.notificaciones;

import co.edu.uniquindio.quindiostay.domain.enums.CanalNotificacion;
import co.edu.uniquindio.quindiostay.domain.enums.TipoNotificacion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CrearNotificacionRequest(
        @NotNull(message = "El tipo de notificación es obligatorio")
        TipoNotificacion tipo,

        @NotNull(message = "El canal es obligatorio")
        CanalNotificacion canal,

        @NotBlank(message = "El mensaje es obligatorio")
        String mensaje,

        @NotNull(message = "La fecha programada es obligatoria")
        LocalDate fechaProgramada,

        @NotNull(message = "El cliente es obligatorio")
        Long idCliente,

        Long idReserva
) {}
