package co.edu.uniquindio.quindiostay.dto.notificaciones;

import co.edu.uniquindio.quindiostay.domain.enums.CanalNotificacion;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoNotificacion;
import co.edu.uniquindio.quindiostay.domain.enums.TipoNotificacion;
import java.time.LocalDate;

public record NotificacionDto(
        Long idNotificacion,
        TipoNotificacion tipo,
        CanalNotificacion canal,
        String mensaje,
        LocalDate fechaProgramada,
        LocalDate fechaEnvioReal,
        EstadoNotificacion estado,
        Long idCliente,
        String clienteNombre,
        Long idReserva
) {}
