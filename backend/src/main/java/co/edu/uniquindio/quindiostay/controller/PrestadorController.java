package co.edu.uniquindio.quindiostay.controller;

import co.edu.uniquindio.quindiostay.dto.prestadores.CrearPrestadorRequest;
import co.edu.uniquindio.quindiostay.dto.prestadores.MunicipioDto;
import co.edu.uniquindio.quindiostay.dto.prestadores.PrestadorDto;
import co.edu.uniquindio.quindiostay.dto.prestadores.TipoPrestadorDto;
import co.edu.uniquindio.quindiostay.service.PrestadorService;
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
@RequestMapping("/api/prestadores")
@RequiredArgsConstructor
@Tag(name = "Prestadores", description = "CRUD de prestadores turísticos y catálogos de municipios/tipos")
public class PrestadorController {

    private final PrestadorService prestadorService;

    @GetMapping
    @Operation(summary = "Listar prestadores turísticos")
    public ResponseEntity<List<PrestadorDto>> listar() {
        return ResponseEntity.ok(prestadorService.listar());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener prestador por ID")
    public ResponseEntity<PrestadorDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(prestadorService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Crear nuevo prestador (Solo Administrador)")
    public ResponseEntity<PrestadorDto> crear(@Valid @RequestBody CrearPrestadorRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(prestadorService.crear(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Actualizar prestador")
    public ResponseEntity<PrestadorDto> actualizar(@PathVariable Long id, @Valid @RequestBody CrearPrestadorRequest req) {
        return ResponseEntity.ok(prestadorService.actualizar(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Eliminar prestador")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        prestadorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/municipios")
    @Operation(summary = "Listar los 12 municipios del Quindío con código DANE")
    public ResponseEntity<List<MunicipioDto>> listarMunicipios() {
        return ResponseEntity.ok(prestadorService.listarMunicipios());
    }

    @GetMapping("/tipos")
    @Operation(summary = "Listar tipos de prestador turístico")
    public ResponseEntity<List<TipoPrestadorDto>> listarTipos() {
        return ResponseEntity.ok(prestadorService.listarTiposPrestador());
    }
}
