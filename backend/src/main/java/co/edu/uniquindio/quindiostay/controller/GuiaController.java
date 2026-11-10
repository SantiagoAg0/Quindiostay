package co.edu.uniquindio.quindiostay.controller;

import co.edu.uniquindio.quindiostay.dto.tours.CrearGuiaRequest;
import co.edu.uniquindio.quindiostay.dto.tours.GuiaDetalleDto;
import co.edu.uniquindio.quindiostay.service.GuiaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/guias-gestion")
@RequiredArgsConstructor
@Tag(name = "Gestión de Guías", description = "CRUD de guías e idiomas asociados")
public class GuiaController {

    private final GuiaService guiaService;

    @GetMapping
    @Operation(summary = "Listar todos los guías con idiomas detallados")
    public ResponseEntity<List<GuiaDetalleDto>> listar() {
        return ResponseEntity.ok(guiaService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener guía por ID con sus idiomas")
    public ResponseEntity<GuiaDetalleDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(guiaService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Crear nuevo guía")
    public ResponseEntity<GuiaDetalleDto> crear(@Valid @RequestBody CrearGuiaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(guiaService.crear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Actualizar guía y sus idiomas")
    public ResponseEntity<GuiaDetalleDto> actualizar(@PathVariable Long id, @Valid @RequestBody CrearGuiaRequest request) {
        return ResponseEntity.ok(guiaService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Eliminar guía")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        guiaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
