package co.edu.uniquindio.quindiostay.controller;

import co.edu.uniquindio.quindiostay.dto.planes.CrearPlanRequest;
import co.edu.uniquindio.quindiostay.dto.planes.PlanDto;
import co.edu.uniquindio.quindiostay.service.PlanService;
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
@RequestMapping("/api/planes")
@RequiredArgsConstructor
@Tag(name = "Planes", description = "CRUD de planes turísticos ofrecidos por prestadores")
public class PlanController {

    private final PlanService planService;

    @GetMapping
    @Operation(summary = "Listar planes turísticos")
    public ResponseEntity<List<PlanDto>> listar(@RequestParam(required = false) Long idPrestador) {
        return ResponseEntity.ok(planService.listar(idPrestador));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener plan por ID")
    public ResponseEntity<PlanDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(planService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Crear nuevo plan")
    public ResponseEntity<PlanDto> crear(@Valid @RequestBody CrearPlanRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planService.crear(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Actualizar plan")
    public ResponseEntity<PlanDto> actualizar(@PathVariable Long id, @Valid @RequestBody CrearPlanRequest req) {
        return ResponseEntity.ok(planService.actualizar(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Eliminar plan")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        planService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
