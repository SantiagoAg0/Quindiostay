package co.edu.uniquindio.quindiostay.controller;

import co.edu.uniquindio.quindiostay.service.PlantillaPdfService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/plantillas")
@RequiredArgsConstructor
@Tag(name = "Plantillas PDF", description = "Generación y descarga de documentos oficiales en PDF")
public class PlantillaController {

    private final PlantillaPdfService plantillaPdfService;

    @GetMapping("/reserva/{id}")
    @Operation(summary = "Comprobante oficial de reserva (Voucher)")
    public ResponseEntity<byte[]> comprobanteReserva(@PathVariable Long id) {
        byte[] pdf = plantillaPdfService.generarComprobanteReserva(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Comprobante_Reserva_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/pago/{id}")
    @Operation(summary = "Comprobante de pago / recibo oficial")
    public ResponseEntity<byte[]> comprobantePago(@PathVariable Long id) {
        byte[] pdf = plantillaPdfService.generarComprobantePago(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Comprobante_Pago_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/factura/{id}")
    @Operation(summary = "Factura de reserva (alias oficial)")
    public ResponseEntity<byte[]> facturaReserva(@PathVariable Long id) {
        return comprobanteReserva(id);
    }

    @GetMapping("/autorizacion-menor/{idReserva}")
    @Operation(summary = "Formato de autorización de actividad para menores de edad")
    public ResponseEntity<byte[]> autorizacionMenor(@PathVariable Long idReserva) {
        byte[] pdf = plantillaPdfService.generarAutorizacionMenor(idReserva);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Autorizacion_Menores_Reserva_" + idReserva + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/datos-personales/{idCliente}")
    @Operation(summary = "Consentimiento de tratamiento de datos personales (Habeas Data)")
    public ResponseEntity<byte[]> tratamientoDatos(@PathVariable Long idCliente) {
        byte[] pdf = plantillaPdfService.generarDatosPersonales(idCliente);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Tratamiento_Datos_Cliente_" + idCliente + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
