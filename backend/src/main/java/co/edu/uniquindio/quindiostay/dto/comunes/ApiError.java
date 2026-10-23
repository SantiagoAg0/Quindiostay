package co.edu.uniquindio.quindiostay.dto.comunes;

import java.time.LocalDateTime;
import java.util.List;

public record ApiError(
        LocalDateTime fecha,
        int estado,
        String mensaje,
        String ruta,
        List<String> detalles
) {
    public ApiError(int estado, String mensaje, String ruta) {
        this(LocalDateTime.now(), estado, mensaje, ruta, List.of());
    }

    public ApiError(int estado, String mensaje, String ruta, List<String> detalles) {
        this(LocalDateTime.now(), estado, mensaje, ruta, detalles);
    }
}
