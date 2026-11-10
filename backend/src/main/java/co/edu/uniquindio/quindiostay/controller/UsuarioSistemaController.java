package co.edu.uniquindio.quindiostay.controller;

import co.edu.uniquindio.quindiostay.domain.enums.EstadoUsuario;
import co.edu.uniquindio.quindiostay.dto.usuarios.CrearUsuarioRequest;
import co.edu.uniquindio.quindiostay.dto.usuarios.RolDto;
import co.edu.uniquindio.quindiostay.dto.usuarios.UsuarioSistemaDto;
import co.edu.uniquindio.quindiostay.service.UsuarioSistemaService;
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
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
@Tag(name = "Usuarios del Sistema", description = "CRUD de usuarios internos (Solo Administrador)")
public class UsuarioSistemaController {

    private final UsuarioSistemaService usuarioSistemaService;

    @GetMapping
    @Operation(summary = "Listar usuarios del sistema")
    public ResponseEntity<List<UsuarioSistemaDto>> listar() {
        return ResponseEntity.ok(usuarioSistemaService.listar());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID")
    public ResponseEntity<UsuarioSistemaDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioSistemaService.obtenerPorId(id));
    }

    @PostMapping
    @Operation(summary = "Crear nuevo usuario del sistema")
    public ResponseEntity<UsuarioSistemaDto> crear(@Valid @RequestBody CrearUsuarioRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioSistemaService.crear(req));
    }

    @PutMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado de usuario (ACTIVO / BLOQUEADO)")
    public ResponseEntity<UsuarioSistemaDto> cambiarEstado(@PathVariable Long id, @RequestParam EstadoUsuario nuevoEstado) {
        return ResponseEntity.ok(usuarioSistemaService.cambiarEstado(id, nuevoEstado));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar usuario del sistema")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        usuarioSistemaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/roles")
    @Operation(summary = "Listar roles del sistema")
    public ResponseEntity<List<RolDto>> listarRoles() {
        return ResponseEntity.ok(usuarioSistemaService.listarRoles());
    }
}
