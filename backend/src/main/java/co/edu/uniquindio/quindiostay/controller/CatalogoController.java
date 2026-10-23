package co.edu.uniquindio.quindiostay.controller;

import co.edu.uniquindio.quindiostay.dto.tours.GuiaResumen;
import co.edu.uniquindio.quindiostay.dto.tours.IdiomaResumen;
import co.edu.uniquindio.quindiostay.dto.tours.TourResumen;
import co.edu.uniquindio.quindiostay.service.CatalogoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Catálogos", description = "Listados de tours, guías e idiomas para selección")
public class CatalogoController {

    private final CatalogoService catalogoService;

    @GetMapping("/tours")
    @Operation(summary = "Listar tours para desplegable")
    public ResponseEntity<List<TourResumen>> listarTours() {
        return ResponseEntity.ok(catalogoService.listarTours());
    }

    @GetMapping("/guias")
    @Operation(summary = "Listar guías para desplegable")
    public ResponseEntity<List<GuiaResumen>> listarGuias() {
        return ResponseEntity.ok(catalogoService.listarGuias());
    }

    @GetMapping("/idiomas")
    @Operation(summary = "Listar todos los idiomas")
    public ResponseEntity<List<IdiomaResumen>> listarIdiomas() {
        return ResponseEntity.ok(catalogoService.listarIdiomas());
    }

    @GetMapping("/guias/{id}/idiomas")
    @Operation(summary = "Listar idiomas hablados por un guía específico")
    public ResponseEntity<List<IdiomaResumen>> listarIdiomasPorGuia(@PathVariable Long id) {
        return ResponseEntity.ok(catalogoService.listarIdiomasPorGuia(id));
    }
}
