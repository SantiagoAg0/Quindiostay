package co.edu.uniquindio.quindiostay.dto.reportes;

import co.edu.uniquindio.quindiostay.domain.enums.EstadoPago;
import co.edu.uniquindio.quindiostay.domain.enums.MetodoPago;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record R3PagoPendienteFila(
        Long idPago,
        Long idReserva,
        LocalDateTime fechaPago,
        BigDecimal monto,
        MetodoPago metodo,
        EstadoPago estado
) {}
