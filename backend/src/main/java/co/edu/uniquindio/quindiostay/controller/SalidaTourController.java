package co.edu.uniquindio.quindiostay.controller;

import co.edu.uniquindio.quindiostay.domain.enums.EstadoSalida;
import co.edu.uniquindio.quindiostay.dto.comunes.PaginaResponse;
import co.edu.uniquindio.quindiostay.dto.tours.SalidaTourRequest;
import co.edu.uniquindio.quindiostay.dto.tours.SalidaTourResponse;
import co.edu.uniquindio.quindiostay.service.SalidaTourService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/salidas")
@RequiredArgsConstructor
@Tag(name = "Salidas de Tour", description = "Gestión de salidas programadas de tours")
public class SalidaTourController {

    private final SalidaTourService salidaTourService;

    @GetMapping
    @Operation(summary = "Listar salidas con filtros y paginación")
    public ResponseEntity<PaginaResponse<SalidaTourResponse>> buscar(
            @RequestParam(required = false) Long idTour,
            @RequestParam(required = false) EstadoSalida estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) String texto,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(salidaTourService.buscar(idTour, estado, fecha, texto, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de una salida")
    public ResponseEntity<SalidaTourResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(salidaTourService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Crear nueva salida de tour")
    public ResponseEntity<SalidaTourResponse> crear(@Valid @RequestBody SalidaTourRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(salidaTourService.crear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Modificar salida de tour")
    public ResponseEntity<SalidaTourResponse> modificar(
            @PathVariable Long id,
            @Valid @RequestBody SalidaTourRequest request
    ) {
        return ResponseEntity.ok(salidaTourService.modificar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Eliminar salida de tour sin reservas")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        salidaTourService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/cancelar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Cancelar salida de tour")
    public ResponseEntity<SalidaTourResponse> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(salidaTourService.cancelar(id));
    }
}
