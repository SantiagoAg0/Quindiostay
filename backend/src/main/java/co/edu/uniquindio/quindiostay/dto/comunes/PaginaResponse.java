package co.edu.uniquindio.quindiostay.dto.comunes;

import org.springframework.data.domain.Page;
import java.util.List;

public record PaginaResponse<T>(
        List<T> contenido,
        int paginaActual,
        int totalPaginas,
        long totalElementos,
        int tamano
) {
    public static <T> PaginaResponse<T> from(Page<T> page) {
        return new PaginaResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getTotalPages(),
                page.getTotalElements(),
                page.getSize()
        );
    }
}
