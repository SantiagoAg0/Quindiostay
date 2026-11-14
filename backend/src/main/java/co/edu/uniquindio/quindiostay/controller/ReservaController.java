package co.edu.uniquindio.quindiostay.controller;

import co.edu.uniquindio.quindiostay.domain.enums.EstadoReserva;
import co.edu.uniquindio.quindiostay.dto.reservas.CrearReservaRequest;
import co.edu.uniquindio.quindiostay.dto.reservas.ReservaDetalleDto;
import co.edu.uniquindio.quindiostay.service.ReservaService;
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
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
@Tag(name = "Reservas", description = "Gestion de reservas de tours y participantes")
public class ReservaController {

    private final ReservaService reservaService;

    @GetMapping
    @Operation(summary = "Listar reservas (filtradas por rol de usuario o cliente)")
    public ResponseEntity<List<ReservaDetalleDto>> listar(@RequestParam(required = false) Long idCliente) {
        return ResponseEntity.ok(reservaService.listar(idCliente));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle completo de una reserva")
    public ResponseEntity<ReservaDetalleDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(reservaService.obtenerPorId(id));
    }

    @PostMapping
    @Operation(summary = "Crear nueva reserva de tour con participantes")
    public ResponseEntity<ReservaDetalleDto> crear(@Valid @RequestBody CrearReservaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservaService.crear(request));
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR')")
    @Operation(summary = "Cambiar estado de la reserva (solo personal interno)")
    public ResponseEntity<ReservaDetalleDto> cambiarEstado(@PathVariable Long id, @RequestParam EstadoReserva nuevoEstado) {
        return ResponseEntity.ok(reservaService.cambiarEstado(id, nuevoEstado));
    }

    @PostMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar reserva y calcular reembolso segun RN08")
    public ResponseEntity<ReservaDetalleDto> cancelar(@PathVariable Long id, @RequestParam(required = false, defaultValue = "Cancelacion solicitada") String motivo) {
        return ResponseEntity.ok(reservaService.cancelarReserva(id, motivo));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modificar participantes de una reserva en estado PENDIENTE")
    public ResponseEntity<ReservaDetalleDto> modificar(
            @PathVariable Long id,
            @RequestBody List<co.edu.uniquindio.quindiostay.dto.reservas.ParticipanteDto> participantes
    ) {
        return ResponseEntity.ok(reservaService.modificar(id, participantes));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una reserva en estado PENDIENTE sin pagos")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        reservaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
