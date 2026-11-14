package co.edu.uniquindio.quindiostay.controller;

import co.edu.uniquindio.quindiostay.domain.enums.EstadoPago;
import co.edu.uniquindio.quindiostay.dto.pagos.CrearPagoRequest;
import co.edu.uniquindio.quindiostay.dto.pagos.PagoDetalleDto;
import co.edu.uniquindio.quindiostay.service.PagoService;
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
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
@Tag(name = "Pagos", description = "Gestion de pagos y reembolsos")
public class PagoController {

    private final PagoService pagoService;

    @GetMapping
    @Operation(summary = "Listar pagos (filtrados opcionalmente por reserva o estado)")
    public ResponseEntity<List<PagoDetalleDto>> listar(
            @RequestParam(required = false) Long idReserva,
            @RequestParam(required = false) EstadoPago estado
    ) {
        return ResponseEntity.ok(pagoService.listar(idReserva, estado));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR', 'ENCARGADO_PRESTADOR', 'CLIENTE')")
    @Operation(summary = "Registrar un abono o pago completo para una reserva")
    public ResponseEntity<PagoDetalleDto> registrar(@Valid @RequestBody CrearPagoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoService.registrarPago(request));
    }

    @PostMapping("/{id}/reembolsar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_PLATAFORMA', 'OPERADOR')")
    @Operation(summary = "Procesar reembolso de un pago (si la reserva esta cancelada)")
    public ResponseEntity<PagoDetalleDto> reembolsar(@PathVariable Long id) {
        return ResponseEntity.ok(pagoService.reembolsar(id));
    }
}
