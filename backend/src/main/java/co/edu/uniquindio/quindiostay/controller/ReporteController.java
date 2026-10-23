package co.edu.uniquindio.quindiostay.controller;

import co.edu.uniquindio.quindiostay.dto.comunes.ApiError;
import co.edu.uniquindio.quindiostay.dto.reportes.R5GuiaSalidasFila;
import co.edu.uniquindio.quindiostay.service.ReporteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR')")
@Tag(name = "Reportes", description = "Reportes estadísticos y operativos")
public class ReporteController {

    private final ReporteService reporteService;

    @GetMapping("/guias-mas-salidas")
    @Operation(summary = "Reporte R5: Guías con más salidas realizadas")
    public ResponseEntity<List<R5GuiaSalidasFila>> guiasMasSalidas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false, defaultValue = "1") Integer minimo
    ) {
        return ResponseEntity.ok(reporteService.obtenerReporteGuiasMasSalidas(desde, hasta, minimo));
    }

    @GetMapping("/catalogo-tours")
    @Operation(summary = "Reporte R1: Catálogo de tours (Próximamente)")
    public ResponseEntity<ApiError> r1() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(new ApiError(501, "Reporte R1 no implementado (Entrega 3)", "/api/reportes/catalogo-tours"));
    }

    @GetMapping("/salidas-proximas")
    @Operation(summary = "Reporte R2: Salidas próximas (Próximamente)")
    public ResponseEntity<ApiError> r2() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(new ApiError(501, "Reporte R2 no implementado (Entrega 3)", "/api/reportes/salidas-proximas"));
    }

    @GetMapping("/pagos-pendientes")
    @Operation(summary = "Reporte R3: Pagos pendientes (Próximamente)")
    public ResponseEntity<ApiError> r3() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(new ApiError(501, "Reporte R3 no implementado (Entrega 3)", "/api/reportes/pagos-pendientes"));
    }

    @GetMapping("/participantes-mes")
    @Operation(summary = "Reporte R4: Participantes por mes (Próximamente)")
    public ResponseEntity<ApiError> r4() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(new ApiError(501, "Reporte R4 no implementado (Entrega 3)", "/api/reportes/participantes-mes"));
    }

    @GetMapping("/ocupacion-categoria")
    @Operation(summary = "Reporte R6: Ocupación por categoría (Próximamente)")
    public ResponseEntity<ApiError> r6() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(new ApiError(501, "Reporte R6 no implementado (Entrega 3)", "/api/reportes/ocupacion-categoria"));
    }

    @GetMapping("/ingreso-mensual")
    @Operation(summary = "Reporte R7: Ingreso mensual (Próximamente)")
    public ResponseEntity<ApiError> r7() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(new ApiError(501, "Reporte R7 no implementado (Entrega 3)", "/api/reportes/ingreso-mensual"));
    }

    @GetMapping("/prestador-cancelaciones")
    @Operation(summary = "Reporte R8: Cancelaciones por prestador (Próximamente)")
    public ResponseEntity<ApiError> r8() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(new ApiError(501, "Reporte R8 no implementado (Entrega 3)", "/api/reportes/prestador-cancelaciones"));
    }

    @GetMapping("/guias-sin-salidas")
    @Operation(summary = "Reporte R9: Guías sin salidas (Próximamente)")
    public ResponseEntity<ApiError> r9() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(new ApiError(501, "Reporte R9 no implementado (Entrega 3)", "/api/reportes/guias-sin-salidas"));
    }

    @GetMapping("/clientes-alto-gasto")
    @Operation(summary = "Reporte R10: Clientes con alto gasto (Próximamente)")
    public ResponseEntity<ApiError> r10() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(new ApiError(501, "Reporte R10 no implementado (Entrega 3)", "/api/reportes/clientes-alto-gasto"));
    }
}
