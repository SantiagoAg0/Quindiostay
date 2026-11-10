package co.edu.uniquindio.quindiostay.controller;

import co.edu.uniquindio.quindiostay.domain.enums.Dificultad;
import co.edu.uniquindio.quindiostay.dto.reportes.*;
import co.edu.uniquindio.quindiostay.service.ReporteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR')")
@Tag(name = "Reportes", description = "Reportes estadísticos y operativos con exportación a PDF")
public class ReporteController {

    private final ReporteService reporteService;

    @GetMapping("/catalogo-tours")
    @Operation(summary = "Reporte R1: Catálogo de tours por dificultad y precio")
    public ResponseEntity<List<R1TourCatalogoFila>> r1(
            @RequestParam(required = false) Dificultad dificultad,
            @RequestParam(required = false) BigDecimal precioMax
    ) {
        return ResponseEntity.ok(reporteService.obtenerReporteR1(dificultad, precioMax));
    }

    @GetMapping("/salidas-proximas")
    @Operation(summary = "Reporte R2: Salidas programadas próximas (próximos 30 días)")
    public ResponseEntity<List<R2SalidaProximaFila>> r2(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        return ResponseEntity.ok(reporteService.obtenerReporteR2(desde, hasta));
    }

    @GetMapping("/pagos-pendientes")
    @Operation(summary = "Reporte R3: Pagos fallidos y pendientes (Cartera)")
    public ResponseEntity<List<R3PagoPendienteFila>> r3() {
        return ResponseEntity.ok(reporteService.obtenerReporteR3());
    }

    @GetMapping("/participantes-mes")
    @Operation(summary = "Reporte R4: Tours con más participantes por mes (con gráfico)")
    public ResponseEntity<List<R4TourParticipantesMesFila>> r4() {
        return ResponseEntity.ok(reporteService.obtenerReporteR4());
    }

    @GetMapping("/guias-mas-salidas")
    @Operation(summary = "Reporte R5: Guías con más salidas realizadas")
    public ResponseEntity<List<R5GuiaSalidasFila>> guiasMasSalidas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false, defaultValue = "1") Integer minimo
    ) {
        return ResponseEntity.ok(reporteService.obtenerReporteGuiasMasSalidas(desde, hasta, minimo));
    }

    @GetMapping("/ocupacion-categoria")
    @Operation(summary = "Reporte R6: Ocupación promedio por categoría de tour (con gráfico)")
    public ResponseEntity<List<R6OcupacionCategoriaFila>> r6() {
        return ResponseEntity.ok(reporteService.obtenerReporteR6());
    }

    @GetMapping("/ingreso-mensual")
    @Operation(summary = "Reporte R7: Ingresos mensuales por método de pago (con gráfico)")
    public ResponseEntity<List<R7IngresoMensualFila>> r7() {
        return ResponseEntity.ok(reporteService.obtenerReporteR7());
    }

    @GetMapping("/prestador-cancelaciones")
    @Operation(summary = "Reporte R8: Prestadores con más cancelaciones")
    public ResponseEntity<List<R8PrestadorCancelacionesFila>> r8() {
        return ResponseEntity.ok(reporteService.obtenerReporteR8());
    }

    @GetMapping("/guias-sin-salidas")
    @Operation(summary = "Reporte R9: Guías sin salidas en un periodo")
    public ResponseEntity<List<R9GuiaSinSalidasFila>> r9(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        return ResponseEntity.ok(reporteService.obtenerReporteR9(desde, hasta));
    }

    @GetMapping("/clientes-alto-gasto")
    @Operation(summary = "Reporte R10: Clientes de alto gasto que aceptan promociones")
    public ResponseEntity<List<R10ClienteAltoGastoFila>> r10() {
        return ResponseEntity.ok(reporteService.obtenerReporteR10());
    }

    @GetMapping("/{codigo}/pdf")
    @Operation(summary = "Exportar reporte a PDF oficial con OpenPDF")
    public ResponseEntity<byte[]> exportarPdf(@PathVariable String codigo) {
        byte[] pdfBytes = reporteService.exportarPdf(codigo);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"reporte_" + codigo.toLowerCase() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
