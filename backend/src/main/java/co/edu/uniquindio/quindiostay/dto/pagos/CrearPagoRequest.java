package co.edu.uniquindio.quindiostay.dto.pagos;

import co.edu.uniquindio.quindiostay.domain.enums.MetodoPago;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CrearPagoRequest(
        @NotNull(message = "El id de la reserva es obligatorio")
        Long idReserva,

        @NotNull(message = "El monto es obligatorio")
        @DecimalMin(value = "100.0", message = "El monto mínimo de pago es $100")
        BigDecimal monto,

        @NotNull(message = "El método de pago es obligatorio")
        MetodoPago metodo,

        String referenciaTransaccion
) {}
