package co.edu.uniquindio.quindiostay.dto.reportes;

import java.math.BigDecimal;

public record R8PrestadorCancelacionesFila(
        String prestador,
        String municipio,
        Long reservasCanceladas,
        BigDecimal valorCancelado
) {}
