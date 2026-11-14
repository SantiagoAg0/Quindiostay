package co.edu.uniquindio.quindiostay.controller;

import co.edu.uniquindio.quindiostay.dto.notificaciones.CrearNotificacionRequest;
import co.edu.uniquindio.quindiostay.dto.notificaciones.NotificacionDto;
import co.edu.uniquindio.quindiostay.service.NotificacionService;
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
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
@Tag(name = "Notificaciones", description = "Gestion e historial de notificaciones y recordatorios")
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping
    @Operation(summary = "Listar notificaciones (del cliente actual o filtradas)")
    public ResponseEntity<List<NotificacionDto>> listar(@RequestParam(required = false) Long idCliente) {
        return ResponseEntity.ok(notificacionService.listar(idCliente));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Crear/programar nueva notificacion")
    public ResponseEntity<NotificacionDto> crear(@Valid @RequestBody CrearNotificacionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notificacionService.crear(req));
    }

    @PutMapping("/{id}/leida")
    @Operation(summary = "Marcar notificacion como leida")
    public ResponseEntity<NotificacionDto> marcarLeida(@PathVariable Long id) {
        return ResponseEntity.ok(notificacionService.marcarLeida(id));
    }
}
