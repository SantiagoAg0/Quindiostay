package co.edu.uniquindio.quindiostay.controller;

import co.edu.uniquindio.quindiostay.dto.tours.CategoriaTourDto;
import co.edu.uniquindio.quindiostay.dto.tours.CrearTourRequest;
import co.edu.uniquindio.quindiostay.dto.tours.TourDetalleDto;
import co.edu.uniquindio.quindiostay.service.TourService;
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
@RequestMapping("/api/tours-gestion")
@RequiredArgsConstructor
@Tag(name = "Gestión de Tours", description = "CRUD de tours y categorías")
public class TourController {

    private final TourService tourService;

    @GetMapping
    @Operation(summary = "Listar tours con detalles completos")
    public ResponseEntity<List<TourDetalleDto>> listar() {
        return ResponseEntity.ok(tourService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener tour por ID")
    public ResponseEntity<TourDetalleDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(tourService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Crear un nuevo tour")
    public ResponseEntity<TourDetalleDto> crear(@Valid @RequestBody CrearTourRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tourService.crear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Actualizar tour")
    public ResponseEntity<TourDetalleDto> actualizar(@PathVariable Long id, @Valid @RequestBody CrearTourRequest request) {
        return ResponseEntity.ok(tourService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Eliminar tour")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        tourService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/categorias")
    @Operation(summary = "Listar categorías de tours")
    public ResponseEntity<List<CategoriaTourDto>> listarCategorias() {
        return ResponseEntity.ok(tourService.listarCategorias());
    }
}
