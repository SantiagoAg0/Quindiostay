package co.edu.uniquindio.quindiostay.report;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Component;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Component
public class PdfExportador {

    private static final Color VERDE_BOSQUE = new Color(11, 45, 31);
    private static final Color VERDE_CLARO  = new Color(243, 248, 244);
    private static final Color GRIS_BORDE   = new Color(226, 234, 228);
    private static final Color TEXTO_OSCURO = new Color(10, 16, 13);

    public byte[] exportarReporte(
            String titulo,
            LocalDate fechaGeneracion,
            Map<String, String> filtros,
            List<String> columnas,
            List<List<String>> filas,
            Map<String, String> totales
    ) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 40, 40);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // 1. Encabezado institucional QuindíoStay
            Font fontEmpresa = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, VERDE_BOSQUE);
            Font fontSub = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, TEXTO_OSCURO);
            Font fontMeta = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);

            Paragraph pEmpresa = new Paragraph("QUINDÍOSTAY · TURISMO DEL QUINDÍO", fontEmpresa);
            document.add(pEmpresa);
            Paragraph pSub = new Paragraph("Bases de Datos I · Universidad del Quindío · Dominio 5: Tours y Actividades", fontSub);
            pSub.setSpacingAfter(10);
            document.add(pSub);

            // 2. Título del Reporte
            Paragraph pTit = new Paragraph(titulo, fontTitulo);
            document.add(pTit);

            String fechaStr = fechaGeneracion != null ? fechaGeneracion.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : LocalDate.now().toString();
            Paragraph pFecha = new Paragraph("Fecha de generación: " + fechaStr, fontMeta);
            document.add(pFecha);

            // Filtros aplicados
            if (filtros != null && !filtros.isEmpty()) {
                StringBuilder sb = new StringBuilder("Filtros: ");
                filtros.forEach((k, v) -> sb.append(k).append(" = ").append(v).append("  |  "));
                Paragraph pFiltros = new Paragraph(sb.toString(), fontMeta);
                pFiltros.setSpacingAfter(15);
                document.add(pFiltros);
            } else {
                pFecha.setSpacingAfter(15);
            }

            // 3. Tabla de datos
            int numCols = columnas.size();
            PdfPTable table = new PdfPTable(numCols);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);
            table.setSpacingAfter(15);

            Font fontHead = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
            Font fontCell = FontFactory.getFont(FontFactory.HELVETICA, 8, TEXTO_OSCURO);

            for (String col : columnas) {
                PdfPCell cell = new PdfPCell(new Phrase(col, fontHead));
                cell.setBackgroundColor(VERDE_BOSQUE);
                cell.setPadding(6);
                cell.setBorderColor(GRIS_BORDE);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            boolean alternate = false;
            for (List<String> fila : filas) {
                Color bg = alternate ? VERDE_CLARO : Color.WHITE;
                for (String val : fila) {
                    PdfPCell cell = new PdfPCell(new Phrase(val != null ? val : "-", fontCell));
                    cell.setBackgroundColor(bg);
                    cell.setPadding(5);
                    cell.setBorderColor(GRIS_BORDE);
                    table.addCell(cell);
                }
                alternate = !alternate;
            }

            document.add(table);

            // 4. Totales / Resumen
            if (totales != null && !totales.isEmpty()) {
                Font fontTot = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, VERDE_BOSQUE);
                Paragraph pTot = new Paragraph("Resumen / Totales:", fontTot);
                document.add(pTot);
                totales.forEach((k, v) -> {
                    try {
                        document.add(new Paragraph(k + ": " + v, fontMeta));
                    } catch (DocumentException ignored) {}
                });
            }

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error al generar PDF: " + e.getMessage(), e);
        }

        return baos.toByteArray();
    }
}
