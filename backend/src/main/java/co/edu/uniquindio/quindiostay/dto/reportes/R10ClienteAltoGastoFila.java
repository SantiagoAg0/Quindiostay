package co.edu.uniquindio.quindiostay.dto.reportes;

import co.edu.uniquindio.quindiostay.domain.enums.CanalPreferido;
import java.math.BigDecimal;

public record R10ClienteAltoGastoFila(
        String cliente,
        String ciudadOrigen,
        CanalPreferido canalPreferido,
        BigDecimal totalGastado,
        Long numeroReservas
) {}
