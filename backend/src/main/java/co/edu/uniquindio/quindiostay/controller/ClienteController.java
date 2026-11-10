package co.edu.uniquindio.quindiostay.controller;

import co.edu.uniquindio.quindiostay.dto.clientes.ActualizarPerfilRequest;
import co.edu.uniquindio.quindiostay.dto.clientes.ClienteDto;
import co.edu.uniquindio.quindiostay.service.ClienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
@Tag(name = "Clientes", description = "Gestión de clientes y perfil de preferencias")
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Listar clientes registrados")
    public ResponseEntity<List<ClienteDto>> listar() {
        return ResponseEntity.ok(clienteService.listar());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Obtener cliente por ID")
    public ResponseEntity<ClienteDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.obtenerPorId(id));
    }

    @GetMapping("/mi-perfil")
    @Operation(summary = "Obtener perfil del cliente actualmente autenticado")
    public ResponseEntity<ClienteDto> obtenerMiPerfil() {
        return ResponseEntity.ok(clienteService.obtenerMiPerfil());
    }

    @PutMapping("/mi-perfil")
    @Operation(summary = "Actualizar perfil y preferencias del cliente actualmente autenticado")
    public ResponseEntity<ClienteDto> actualizarMiPerfil(@Valid @RequestBody ActualizarPerfilRequest req) {
        ClienteDto mi = clienteService.obtenerMiPerfil();
        return ResponseEntity.ok(clienteService.actualizarPerfil(mi.idCliente(), req));
    }

    @PutMapping("/{id}/perfil")
    @PreAuthorize("hasRole('ADMINISTRADOR_PLATAFORMA')")
    @Operation(summary = "Actualizar perfil de cliente por ID (Admin)")
    public ResponseEntity<ClienteDto> actualizarPerfil(@PathVariable Long id, @Valid @RequestBody ActualizarPerfilRequest req) {
        return ResponseEntity.ok(clienteService.actualizarPerfil(id, req));
    }
}
