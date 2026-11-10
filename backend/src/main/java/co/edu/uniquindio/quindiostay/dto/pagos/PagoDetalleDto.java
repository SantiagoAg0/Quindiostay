package co.edu.uniquindio.quindiostay.dto.pagos;

import co.edu.uniquindio.quindiostay.domain.enums.EstadoPago;
import co.edu.uniquindio.quindiostay.domain.enums.MetodoPago;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PagoDetalleDto(
        Long idPago,
        Long idReserva,
        LocalDateTime fechaPago,
        BigDecimal monto,
        MetodoPago metodo,
        EstadoPago estado,
        String referenciaTransaccion,
        String clienteNombre,
        String tourNombre
) {}
