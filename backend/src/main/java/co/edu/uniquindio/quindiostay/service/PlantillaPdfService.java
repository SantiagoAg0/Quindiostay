package co.edu.uniquindio.quindiostay.service;

import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Cliente;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Pago;
import co.edu.uniquindio.quindiostay.domain.entity.nucleo.Reserva;
import co.edu.uniquindio.quindiostay.domain.entity.tours.Participante;
import co.edu.uniquindio.quindiostay.domain.entity.tours.ReservaTour;
import co.edu.uniquindio.quindiostay.exception.RecursoNoEncontradoException;
import co.edu.uniquindio.quindiostay.exception.ReglaNegocioException;
import co.edu.uniquindio.quindiostay.repository.*;
import co.edu.uniquindio.quindiostay.security.UsuarioPrincipal;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlantillaPdfService {

    private final ReservaRepository reservaRepository;
    private final ReservaTourRepository reservaTourRepository;
    private final ParticipanteRepository participanteRepository;
    private final PagoRepository pagoRepository;
    private final ClienteRepository clienteRepository;

    private static final Color VERDE_BOSQUE = new Color(11, 45, 31);
    private static final Color VERDE_CLARO  = new Color(243, 248, 244);
    private static final Color GRIS_BORDE   = new Color(226, 234, 228);
    private static final Color TEXTO_OSCURO = new Color(10, 16, 13);

    @Transactional(readOnly = true)
    public byte[] generarComprobanteReserva(Long idReserva) {
        Reserva reserva = reservaRepository.findById(idReserva)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva", idReserva));
        validarAccesoCliente(reserva.getCliente().getIdCliente());

        var reservaTourOpt = reservaTourRepository.findById(idReserva);
        List<Participante> participantes = participanteRepository.findByReservaTourIdReserva(idReserva);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 40, 40);

        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            agregarEncabezado(doc, "COMPROBANTE OFICIAL DE RESERVA", "Código: QS-RES-" + String.format("%05d", idReserva));

            PdfPTable tInfo = new PdfPTable(2);
            tInfo.setWidthPercentage(100);
            tInfo.setSpacingBefore(10);
            tInfo.setSpacingAfter(15);

            agregarCeldaClaveValor(tInfo, "Fecha de Expedición:", LocalDate.now().toString());
            agregarCeldaClaveValor(tInfo, "Estado de la Reserva:", reserva.getEstado().name());
            agregarCeldaClaveValor(tInfo, "Cliente Titular:", reserva.getCliente().getNombres() + " " + reserva.getCliente().getApellidos());
            agregarCeldaClaveValor(tInfo, "Documento / Correo:", reserva.getCliente().getTipoDocumento() + " " + reserva.getCliente().getNumeroDocumento() + " | " + reserva.getCliente().getCorreo());
            agregarCeldaClaveValor(tInfo, "Fecha de Servicio:", reserva.getFechaServicio().toString());
            agregarCeldaClaveValor(tInfo, "Canal de Reserva:", reserva.getCanal().name());

            if (reservaTourOpt.isPresent()) {
                var salida = reservaTourOpt.get().getSalida();
                agregarCeldaClaveValor(tInfo, "Tour Contratado:", salida.getTour().getNombre());
                agregarCeldaClaveValor(tInfo, "Prestador Operador:", salida.getTour().getPrestador().getNombreComercial());
                agregarCeldaClaveValor(tInfo, "Horario de Salida:", salida.getHoraInicio() + " (" + salida.getTour().getDuracionHoras() + " hrs)");
                agregarCeldaClaveValor(tInfo, "Guía & Idioma:", salida.getGuia().getNombre() + " (" + salida.getIdioma().getNombre() + ")");
            }

            if (reserva.getPlan() != null) {
                agregarCeldaClaveValor(tInfo, "Plan Asociado:", reserva.getPlan().getNombre() + " (" + reserva.getPlan().getTipo() + ")");
            }
            agregarCeldaClaveValor(tInfo, "Valor Total Liquidado:", "$ " + String.format("%,.2f", reserva.getValorTotal()));

            doc.add(tInfo);

            // Tabla de Pasajeros
            Paragraph pPax = new Paragraph("PASAJEROS / PARTICIPANTES REGISTRADOS", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, VERDE_BOSQUE));
            pPax.setSpacingBefore(10);
            pPax.setSpacingAfter(6);
            doc.add(pPax);

            PdfPTable tPax = new PdfPTable(3);
            tPax.setWidthPercentage(100);
            tPax.setWidths(new float[]{1, 4, 2});
            agregarEncabezadoTabla(tPax, List.of("#", "Nombre Completo", "Edad"));

            int i = 1;
            for (Participante p : participantes) {
                tPax.addCell(crearCeldaDato(String.valueOf(i++), false));
                tPax.addCell(crearCeldaDato(p.getNombre(), false));
                tPax.addCell(crearCeldaDato(p.getEdad() + " años " + (p.getEdad() < 18 ? "(Menor)" : "(Adulto)"), false));
            }
            doc.add(tPax);

            agregarPieLegal(doc, "Este comprobante certifica la validez de su reserva en la plataforma QuindíoStay. Presente este documento al guía al momento de la salida.");
            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF de reserva: " + e.getMessage(), e);
        }
        return baos.toByteArray();
    }

    @Transactional(readOnly = true)
    public byte[] generarComprobantePago(Long idPago) {
        Pago pago = pagoRepository.findById(idPago)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pago", idPago));
        validarAccesoCliente(pago.getReserva().getCliente().getIdCliente());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 40, 40);

        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            agregarEncabezado(doc, "RECIBO OFICIAL DE PAGO / ABONO", "Transacción: TX-PAG-" + String.format("%05d", idPago));

            PdfPTable tInfo = new PdfPTable(2);
            tInfo.setWidthPercentage(100);
            tInfo.setSpacingBefore(10);
            tInfo.setSpacingAfter(15);

            agregarCeldaClaveValor(tInfo, "Número de Recibo:", "# PAG-" + idPago);
            agregarCeldaClaveValor(tInfo, "Fecha y Hora:", pago.getFechaPago().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            agregarCeldaClaveValor(tInfo, "Estado de la Transacción:", pago.getEstado().name());
            agregarCeldaClaveValor(tInfo, "Método de Pago:", pago.getMetodo().name());
            agregarCeldaClaveValor(tInfo, "Referencia Pasarela:", pago.getReferenciaTransaccion() != null ? pago.getReferenciaTransaccion() : "N/A (Transferencia/Efectivo)");
            agregarCeldaClaveValor(tInfo, "Reserva Relacionada:", "# RES-" + pago.getReserva().getIdReserva());
            agregarCeldaClaveValor(tInfo, "Cliente Pagador:", pago.getReserva().getCliente().getNombres() + " " + pago.getReserva().getCliente().getApellidos());
            agregarCeldaClaveValor(tInfo, "Monto Pagado:", "$ " + String.format("%,.2f", pago.getMonto()));

            doc.add(tInfo);
            agregarPieLegal(doc, "Recibo válido como constancia de recaudo y soporte contable para la reserva en QuindíoStay.");
            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF de pago: " + e.getMessage(), e);
        }
        return baos.toByteArray();
    }

    @Transactional(readOnly = true)
    public byte[] generarAutorizacionMenor(Long idReserva) {
        Reserva reserva = reservaRepository.findById(idReserva)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva", idReserva));
        validarAccesoCliente(reserva.getCliente().getIdCliente());

        List<Participante> participantes = participanteRepository.findByReservaTourIdReserva(idReserva);
        List<Participante> menores = participantes.stream().filter(p -> p.getEdad() < 18).toList();

        if (menores.isEmpty()) {
            throw new ReglaNegocioException("La reserva #" + idReserva + " no cuenta con participantes menores de 18 años");
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 40, 40);

        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            agregarEncabezado(doc, "CONSENTIMIENTO INFORMADO Y AUTORIZACIÓN PARA MENORES", "Reserva: # RES-" + idReserva);

            Font fCuerpo = FontFactory.getFont(FontFactory.HELVETICA, 10, TEXTO_OSCURO);
            String adulto = reserva.getCliente().getNombres() + " " + reserva.getCliente().getApellidos();
            String docAdulto = reserva.getCliente().getTipoDocumento() + " " + reserva.getCliente().getNumeroDocumento();

            Paragraph p1 = new Paragraph("Yo, " + adulto + ", identificado con " + docAdulto + ", actuando en calidad de padre, tutor legal o adulto responsable debidamente autorizado, hago constar que:", fCuerpo);
            p1.setSpacingBefore(12);
            p1.setSpacingAfter(8);
            doc.add(p1);

            Paragraph p2 = new Paragraph("1. Autorizo expresamente la participación en las actividades turísticas y de ecoturismo contratadas en QuindíoStay para la fecha " + reserva.getFechaServicio() + " a los siguientes menores a mi cargo:", fCuerpo);
            p2.setSpacingAfter(10);
            doc.add(p2);

            PdfPTable tMenores = new PdfPTable(2);
            tMenores.setWidthPercentage(100);
            agregarEncabezadoTabla(tMenores, List.of("Nombre del Menor de Edad", "Edad Cumplida"));
            for (Participante m : menores) {
                tMenores.addCell(crearCeldaDato(m.getNombre(), false));
                tMenores.addCell(crearCeldaDato(m.getEdad() + " años", false));
            }
            doc.add(tMenores);

            Paragraph p3 = new Paragraph("2. Declaro que los menores gozan de condiciones de salud adecuadas para el itinerario del tour y me comprometo a acompañarlos durante toda la jornada.", fCuerpo);
            p3.setSpacingBefore(12);
            p3.setSpacingAfter(30);
            doc.add(p3);

            // Espacio de firmas
            PdfPTable tFirma = new PdfPTable(2);
            tFirma.setWidthPercentage(100);
            PdfPCell cFirma1 = new PdfPCell(new Paragraph("____________________________________\nFirma del Adulto Responsable\nC.C. " + reserva.getCliente().getNumeroDocumento(), fCuerpo));
            cFirma1.setBorder(Rectangle.NO_BORDER);
            cFirma1.setHorizontalAlignment(Element.ALIGN_CENTER);

            PdfPCell cFirma2 = new PdfPCell(new Paragraph("____________________________________\nFirma y Sello del Operador Turístico\nQuindíoStay S.A.S.", fCuerpo));
            cFirma2.setBorder(Rectangle.NO_BORDER);
            cFirma2.setHorizontalAlignment(Element.ALIGN_CENTER);

            tFirma.addCell(cFirma1);
            tFirma.addCell(cFirma2);
            doc.add(tFirma);

            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar autorización de menores: " + e.getMessage(), e);
        }
        return baos.toByteArray();
    }

    @Transactional(readOnly = true)
    public byte[] generarDatosPersonales(Long idCliente) {
        Cliente cliente = clienteRepository.findById(idCliente)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente", idCliente));
        validarAccesoCliente(idCliente);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 40, 40);

        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            agregarEncabezado(doc, "AUTORIZACIÓN DE TRATAMIENTO DE DATOS PERSONALES", "Ley 1581 de 2012 · Hábeas Data");

            Font fCuerpo = FontFactory.getFont(FontFactory.HELVETICA, 10, TEXTO_OSCURO);

            Paragraph p1 = new Paragraph("En cumplimiento de la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2013, el suscrito titular de la información:", fCuerpo);
            p1.setSpacingBefore(12);
            p1.setSpacingAfter(8);
            doc.add(p1);

            PdfPTable tCli = new PdfPTable(2);
            tCli.setWidthPercentage(100);
            agregarCeldaClaveValor(tCli, "Titular:", cliente.getNombres() + " " + cliente.getApellidos());
            agregarCeldaClaveValor(tCli, "Identificación:", cliente.getTipoDocumento() + " " + cliente.getNumeroDocumento());
            agregarCeldaClaveValor(tCli, "Correo Registrado:", cliente.getCorreo());
            agregarCeldaClaveValor(tCli, "Teléfono:", cliente.getTelefono() != null ? cliente.getTelefono() : "No registrado");
            doc.add(tCli);

            Paragraph p2 = new Paragraph("Autoriza de manera previa, expresa e informada a QUINDÍOSTAY y a los prestadores turísticos adscritos a recolectar, almacenar y tratar sus datos personales con fines de:", fCuerpo);
            p2.setSpacingBefore(12);
            p2.setSpacingAfter(8);
            doc.add(p2);

            Paragraph pList = new Paragraph("• Expedición y emisión de boletas y vouchers de reserva turística.\n• Emisión de pólizas de asistencia médica y seguro de viaje para tours.\n• Envío de notificaciones y recordatorios operativos de salidas contratadas.\n• Procesamiento seguro de pagos y transferencias bancarias.", fCuerpo);
            pList.setSpacingAfter(35);
            doc.add(pList);

            PdfPTable tFirma = new PdfPTable(1);
            tFirma.setWidthPercentage(60);
            PdfPCell cF = new PdfPCell(new Paragraph("____________________________________\nFirma del Titular de Datos\n" + cliente.getNombres() + " " + cliente.getApellidos() + "\nDoc: " + cliente.getNumeroDocumento(), fCuerpo));
            cF.setBorder(Rectangle.NO_BORDER);
            cF.setHorizontalAlignment(Element.ALIGN_CENTER);
            tFirma.addCell(cF);
            doc.add(tFirma);

            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar tratamiento de datos: " + e.getMessage(), e);
        }
        return baos.toByteArray();
    }

    private void agregarEncabezado(Document doc, String tituloDoc, String subtituloDoc) throws DocumentException {
        Font fMarca = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, VERDE_BOSQUE);
        Font fSubMarca = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.GRAY);
        Font fTit = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, TEXTO_OSCURO);
        Font fMeta = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.DARK_GRAY);

        Paragraph pMarca = new Paragraph("QUINDÍOSTAY · TOURS & GUIANZA DEL QUINDÍO", fMarca);
        doc.add(pMarca);
        Paragraph pSub = new Paragraph("Plataforma Oficial de Ecoturismo y Servicios Guiados · Nit: 901.884.210-4", fSubMarca);
        pSub.setSpacingAfter(10);
        doc.add(pSub);

        Paragraph pT = new Paragraph(tituloDoc, fTit);
        doc.add(pT);
        Paragraph pM = new Paragraph(subtituloDoc, fMeta);
        pM.setSpacingAfter(12);
        doc.add(pM);
    }

    private void agregarCeldaClaveValor(PdfPTable table, String clave, String valor) {
        Font fClave = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, VERDE_BOSQUE);
        Font fValor = FontFactory.getFont(FontFactory.HELVETICA, 9, TEXTO_OSCURO);

        PdfPCell cK = new PdfPCell(new Phrase(clave, fClave));
        cK.setBackgroundColor(VERDE_CLARO);
        cK.setPadding(6);
        cK.setBorderColor(GRIS_BORDE);

        PdfPCell cV = new PdfPCell(new Phrase(valor != null ? valor : "N/A", fValor));
        cV.setBackgroundColor(Color.WHITE);
        cV.setPadding(6);
        cV.setBorderColor(GRIS_BORDE);

        table.addCell(cK);
        table.addCell(cV);
    }

    private void agregarEncabezadoTabla(PdfPTable table, List<String> columnas) {
        Font fH = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
        for (String c : columnas) {
            PdfPCell cell = new PdfPCell(new Phrase(c, fH));
            cell.setBackgroundColor(VERDE_BOSQUE);
            cell.setPadding(5);
            cell.setBorderColor(GRIS_BORDE);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }
    }

    private PdfPCell crearCeldaDato(String texto, boolean alternate) {
        Font f = FontFactory.getFont(FontFactory.HELVETICA, 8, TEXTO_OSCURO);
        PdfPCell cell = new PdfPCell(new Phrase(texto != null ? texto : "-", f));
        cell.setBackgroundColor(alternate ? VERDE_CLARO : Color.WHITE);
        cell.setPadding(5);
        cell.setBorderColor(GRIS_BORDE);
        return cell;
    }

    private void agregarPieLegal(Document doc, String texto) throws DocumentException {
        Font fPie = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, Color.GRAY);
        Paragraph p = new Paragraph("\n" + texto + "\nGenerado automáticamente por QuindíoStay Core en " + LocalDate.now(), fPie);
        p.setSpacingBefore(15);
        doc.add(p);
    }

    private void validarAccesoCliente(Long idClienteDoc) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            if ("CLIENTE".equalsIgnoreCase(principal.getRol())) {
                if (!principal.getId().equals(idClienteDoc)) {
                    throw new ReglaNegocioException("No tiene permisos para descargar documentos de otro usuario");
                }
            }
        }
    }
}
