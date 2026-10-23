package co.edu.uniquindio.quindiostay.dto.reportes;

import java.math.BigDecimal;

public record R6OcupacionCategoriaFila(
        String categoria,
        Long salidasRealizadas,
        BigDecimal ocupacionPromedio
) {}
