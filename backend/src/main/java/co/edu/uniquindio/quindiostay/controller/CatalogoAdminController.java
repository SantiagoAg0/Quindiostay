package co.edu.uniquindio.quindiostay.controller;

import co.edu.uniquindio.quindiostay.dto.catalogos.CatalogosRequests.*;
import co.edu.uniquindio.quindiostay.dto.prestadores.MunicipioDto;
import co.edu.uniquindio.quindiostay.dto.prestadores.TipoPrestadorDto;
import co.edu.uniquindio.quindiostay.dto.tours.CategoriaTourDto;
import co.edu.uniquindio.quindiostay.dto.tours.IdiomaResumen;
import co.edu.uniquindio.quindiostay.dto.usuarios.RolDto;
import co.edu.uniquindio.quindiostay.service.CatalogoAdminService;
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
@RequestMapping("/api/catalogos")
@RequiredArgsConstructor
@Tag(name = "Catálogos Administrativos", description = "CRUD de entidades de catálogo: municipios, tipos de prestador, roles, categorías e idiomas")
public class CatalogoAdminController {

    private final CatalogoAdminService catalogoAdminService;

    // --- MUNICIPIOS ---
    @GetMapping("/municipios")
    @Operation(summary = "Listar municipios")
    public ResponseEntity<List<MunicipioDto>> listarMunicipios() {
        return ResponseEntity.ok(catalogoAdminService.listarMunicipios());
    }

    @PostMapping("/municipios")
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Crear municipio (Admin)")
    public ResponseEntity<MunicipioDto> crearMunicipio(@Valid @RequestBody MunicipioRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogoAdminService.crearMunicipio(req));
    }

    @PutMapping("/municipios/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Modificar municipio (Admin)")
    public ResponseEntity<MunicipioDto> modificarMunicipio(@PathVariable Long id, @Valid @RequestBody MunicipioRequest req) {
        return ResponseEntity.ok(catalogoAdminService.modificarMunicipio(id, req));
    }

    @DeleteMapping("/municipios/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Eliminar municipio (Admin, 409 si está en uso)")
    public ResponseEntity<Void> eliminarMunicipio(@PathVariable Long id) {
        catalogoAdminService.eliminarMunicipio(id);
        return ResponseEntity.noContent().build();
    }

    // --- TIPOS DE PRESTADOR ---
    @GetMapping("/tipos-prestador")
    @Operation(summary = "Listar tipos de prestador")
    public ResponseEntity<List<TipoPrestadorDto>> listarTiposPrestador() {
        return ResponseEntity.ok(catalogoAdminService.listarTiposPrestador());
    }

    @PostMapping("/tipos-prestador")
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Crear tipo de prestador (Admin)")
    public ResponseEntity<TipoPrestadorDto> crearTipoPrestador(@Valid @RequestBody TipoPrestadorRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogoAdminService.crearTipoPrestador(req));
    }

    @PutMapping("/tipos-prestador/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Modificar tipo de prestador (Admin)")
    public ResponseEntity<TipoPrestadorDto> modificarTipoPrestador(@PathVariable Long id, @Valid @RequestBody TipoPrestadorRequest req) {
        return ResponseEntity.ok(catalogoAdminService.modificarTipoPrestador(id, req));
    }

    @DeleteMapping("/tipos-prestador/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Eliminar tipo de prestador (Admin, 409 si está en uso)")
    public ResponseEntity<Void> eliminarTipoPrestador(@PathVariable Long id) {
        catalogoAdminService.eliminarTipoPrestador(id);
        return ResponseEntity.noContent().build();
    }

    // --- ROLES ---
    @GetMapping("/roles")
    @Operation(summary = "Listar roles del sistema")
    public ResponseEntity<List<RolDto>> listarRoles() {
        return ResponseEntity.ok(catalogoAdminService.listarRoles());
    }

    @PostMapping("/roles")
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Crear rol (Admin)")
    public ResponseEntity<RolDto> crearRol(@Valid @RequestBody RolRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogoAdminService.crearRol(req));
    }

    @PutMapping("/roles/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Modificar rol (Admin)")
    public ResponseEntity<RolDto> modificarRol(@PathVariable Long id, @Valid @RequestBody RolRequest req) {
        return ResponseEntity.ok(catalogoAdminService.modificarRol(id, req));
    }

    @DeleteMapping("/roles/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Eliminar rol (Admin, 409 si está en uso)")
    public ResponseEntity<Void> eliminarRol(@PathVariable Long id) {
        catalogoAdminService.eliminarRol(id);
        return ResponseEntity.noContent().build();
    }

    // --- CATEGORIAS TOUR ---
    @GetMapping("/categorias-tour")
    @Operation(summary = "Listar categorías de tour")
    public ResponseEntity<List<CategoriaTourDto>> listarCategoriasTour() {
        return ResponseEntity.ok(catalogoAdminService.listarCategoriasTour());
    }

    @PostMapping("/categorias-tour")
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Crear categoría de tour (Admin)")
    public ResponseEntity<CategoriaTourDto> crearCategoriaTour(@Valid @RequestBody CategoriaTourRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogoAdminService.crearCategoriaTour(req));
    }

    @PutMapping("/categorias-tour/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Modificar categoría de tour (Admin)")
    public ResponseEntity<CategoriaTourDto> modificarCategoriaTour(@PathVariable Long id, @Valid @RequestBody CategoriaTourRequest req) {
        return ResponseEntity.ok(catalogoAdminService.modificarCategoriaTour(id, req));
    }

    @DeleteMapping("/categorias-tour/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Eliminar categoría de tour (Admin, 409 si está en uso)")
    public ResponseEntity<Void> eliminarCategoriaTour(@PathVariable Long id) {
        catalogoAdminService.eliminarCategoriaTour(id);
        return ResponseEntity.noContent().build();
    }

    // --- IDIOMAS ---
    @GetMapping("/idiomas")
    @Operation(summary = "Listar idiomas")
    public ResponseEntity<List<IdiomaResumen>> listarIdiomas() {
        return ResponseEntity.ok(catalogoAdminService.listarIdiomas());
    }

    @PostMapping("/idiomas")
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Crear idioma (Admin)")
    public ResponseEntity<IdiomaResumen> crearIdioma(@Valid @RequestBody IdiomaRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogoAdminService.crearIdioma(req));
    }

    @PutMapping("/idiomas/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Modificar idioma (Admin)")
    public ResponseEntity<IdiomaResumen> modificarIdioma(@PathVariable Long id, @Valid @RequestBody IdiomaRequest req) {
        return ResponseEntity.ok(catalogoAdminService.modificarIdioma(id, req));
    }

    @DeleteMapping("/idiomas/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Eliminar idioma (Admin, 409 si está en uso)")
    public ResponseEntity<Void> eliminarIdioma(@PathVariable Long id) {
        catalogoAdminService.eliminarIdioma(id);
        return ResponseEntity.noContent().build();
    }
}
