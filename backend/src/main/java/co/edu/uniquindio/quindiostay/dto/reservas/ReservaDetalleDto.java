package co.edu.uniquindio.quindiostay.dto.reservas;

import co.edu.uniquindio.quindiostay.domain.enums.CanalReserva;
import co.edu.uniquindio.quindiostay.domain.enums.EstadoReserva;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ReservaDetalleDto(
        Long idReserva,
        LocalDate fechaCreacion,
        LocalDate fechaServicio,
        EstadoReserva estado,
        BigDecimal valorTotal,
        BigDecimal totalPagado,
        BigDecimal saldoPendiente,
        CanalReserva canal,
        Long idCliente,
        String clienteNombreCompleto,
        String clienteCorreo,
        Long idSalida,
        Long idTour,
        String tourNombre,
        String tourDificultad,
        String guiaNombre,
        String idiomaNombre,
        Long idPlan,
        String planNombre,
        List<ParticipanteDto> participantes
) {}
