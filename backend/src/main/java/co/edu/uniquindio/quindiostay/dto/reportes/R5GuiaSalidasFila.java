package co.edu.uniquindio.quindiostay.dto.reportes;

import java.math.BigDecimal;
import java.util.List;

public record R5GuiaSalidasFila(
        Long idGuia,
        String guia,
        List<String> idiomas,
        long totalSalidas,
        BigDecimal horasGuiadas
) {}
