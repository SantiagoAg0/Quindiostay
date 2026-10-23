package co.edu.uniquindio.quindiostay.dto.reportes;

import co.edu.uniquindio.quindiostay.domain.enums.MetodoPago;
import java.math.BigDecimal;

public record R7IngresoMensualFila(
        String mes,
        MetodoPago metodo,
        BigDecimal totalIngresos
) {}
